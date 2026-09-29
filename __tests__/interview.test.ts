import { heuristicFeedback, withOverall } from "@/lib/interview";
import { scoreColor } from "@/lib/score";

describe("withOverall", () => {
  it("clamps scores to 0–10 and averages to one decimal", () => {
    const r = withOverall({ clarity: 12, depth: -1, communication: 7, feedback: "", strength: "", improvements: [] }, "claude");
    expect([r.clarity, r.depth, r.communication]).toEqual([10, 0, 7]);
    expect(r.overall).toBe(5.7);
    expect(r.source).toBe("claude");
  });
});

describe("heuristicFeedback", () => {
  it("scores a detailed, concrete answer above a vague one", () => {
    const vague = heuristicFeedback("I know Python well.");
    const detailed = heuristicFeedback(
      "At my last company we built a payments API in Python on AWS. For example, when traffic spiked 10x during a sale, " +
        "I added a Redis cache and a queue in front of Postgres, which cut p95 latency from 800ms to 120ms. " +
        "We also added load tests to CI and better monitoring so we could deploy safely.",
    );
    expect(detailed.overall).toBeGreaterThan(vague.overall);
    expect(vague.improvements.length).toBeGreaterThan(0);
    expect(detailed.source).toBe("heuristic");
  });

  it("stays within bounds", () => {
    const r = heuristicFeedback("word ".repeat(2000));
    for (const v of [r.clarity, r.depth, r.communication, r.overall]) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(10);
    }
  });
});

describe("scoreColor", () => {
  it("maps score bands to colours", () => {
    expect(scoreColor(8)).toBe("#8FC3A8");
    expect(scoreColor(6)).toBe("#E3C08A");
    expect(scoreColor(5.9)).toBe("#D08A84");
  });
});
