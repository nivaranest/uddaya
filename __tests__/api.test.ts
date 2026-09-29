/**
 * @jest-environment node
 */
import { POST as interviewFeedback } from "@/app/api/ai/interview-feedback/route";
import { POST as jobAssist } from "@/app/api/ai/job-assist/route";
import { POST as suggestSkills } from "@/app/api/ai/suggest-skills/route";

// These run without an API key, exercising validation and the offline fallbacks.
const saved = { key: process.env.ANTHROPIC_API_KEY, token: process.env.ANTHROPIC_AUTH_TOKEN };
beforeAll(() => {
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_AUTH_TOKEN;
});
afterAll(() => {
  if (saved.key !== undefined) process.env.ANTHROPIC_API_KEY = saved.key;
  if (saved.token !== undefined) process.env.ANTHROPIC_AUTH_TOKEN = saved.token;
});

const post = (body: unknown) =>
  new Request("http://localhost/api", { method: "POST", headers: { "Content-Type": "application/json" }, body: typeof body === "string" ? body : JSON.stringify(body) });

describe("POST /api/ai/interview-feedback", () => {
  it("rejects malformed JSON and missing fields", async () => {
    expect((await interviewFeedback(post("{not json"))).status).toBe(400);
    expect((await interviewFeedback(post({ question: "Q" }))).status).toBe(400);
  });

  it("returns heuristic feedback when Claude is not configured", async () => {
    const res = await interviewFeedback(post({ question: "Tell me about Python", answer: "I have used Python for five years on AWS." }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.source).toBe("heuristic");
    expect(body.overall).toBeGreaterThanOrEqual(0);
    expect(body.overall).toBeLessThanOrEqual(10);
  });
});

describe("POST /api/ai/job-assist", () => {
  it("falls back to a template description and default questions", async () => {
    const res = await jobAssist(
      post({ title: "SWE", category: "Software Development", level: "Senior", location: "Pune", remote: false, required: ["Go"], nice: [], years: 5, notes: "Own the API.", responsibilities: [] }),
    );
    const body = await res.json();
    expect(body.source).toBe("template");
    expect(body.description).toContain("Own the API.");
    expect(body.questions).toHaveLength(5);
  });
});

describe("POST /api/ai/suggest-skills", () => {
  it("never re-suggests skills already listed", async () => {
    const res = await suggestSkills(post({ title: "SWE", description: "", required: ["django"], nice: [] }));
    const body = await res.json();
    expect(body.required.map((s: string) => s.toLowerCase())).not.toContain("django");
  });
});
