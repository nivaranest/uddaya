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

import { POST as atsCheck } from "@/app/api/ai/ats-check/route";
import { SAMPLE_RESUME } from "@/lib/ats";

describe("POST /api/ai/ats-check", () => {
  const form = (fields: Record<string, string | File>) => {
    const f = new FormData();
    for (const [k, v] of Object.entries(fields)) f.append(k, v);
    return new Request("http://localhost/api/ai/ats-check", { method: "POST", body: f });
  };

  it("requires resume text or a file", async () => {
    expect((await atsCheck(form({ text: "  " }))).status).toBe(400);
  });

  it("rejects unsupported file types", async () => {
    const res = await atsCheck(form({ file: new File(["x"], "resume.doc") }));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/docx/i);
  });

  it("scores pasted text against a Uddaya job without Claude", async () => {
    const res = await atsCheck(form({ text: SAMPLE_RESUME, jobId: "senior-python-engineer-techcorp" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.reviewSource).toBe("not-configured");
    expect(body.review).toBeNull();
    expect(body.target).toBe("Senior Python Engineer at TechCorp");
    expect(body.report.keywords.missing).toContain("Django");
  });

  it("reads uploaded text files", async () => {
    const res = await atsCheck(form({ file: new File([SAMPLE_RESUME], "resume.txt", { type: "text/plain" }) }));
    const body = await res.json();
    expect(body.report.stats.words).toBeGreaterThan(100);
  });
});

describe("POST /api/ai/ats-check with an unreadable file", () => {
  it("reports that the ATS cannot read it instead of erroring", async () => {
    const f = new FormData();
    f.append("file", new File(["   "], "scan.txt", { type: "text/plain" }));
    const res = await atsCheck(new Request("http://localhost/api/ai/ats-check", { method: "POST", body: f }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.report.checks[0]).toMatchObject({ id: "parse", status: "fail" });
  });
});
