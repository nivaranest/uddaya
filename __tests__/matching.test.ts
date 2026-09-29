import { estimateCandidatePool, explainMatch, keywordMatchScore } from "@/lib/matching";

const candidate = [
  { name: "Python", level: "Advanced", years: 5 },
  { name: "AWS", level: "Intermediate", years: 1 },
];

describe("explainMatch", () => {
  it("marks required and nice-to-have skills the candidate has or lacks", () => {
    const r = explainMatch(candidate, ["python", "Django"], ["AWS", "Kubernetes"]);
    expect(r).toEqual([
      { skill: "python (Advanced, 5 years)", note: "You have, They need", ok: true },
      { skill: "Django", note: "Required (You don't have)", ok: false },
      { skill: "AWS (Intermediate)", note: "Nice to have (You have)", ok: true },
      { skill: "Kubernetes", note: "Nice to have (You don't have)", ok: false },
    ]);
  });

  it("uses singular 'year'", () => {
    expect(explainMatch(candidate, ["AWS"], [])[0].skill).toBe("AWS (Intermediate, 1 year)");
  });
});

describe("keywordMatchScore", () => {
  it("weights required skills at 80% and nice-to-have at 20%", () => {
    expect(keywordMatchScore(candidate, ["Python", "Django"], ["AWS"])).toBe(60);
    expect(keywordMatchScore(candidate, ["Python", "AWS"], [])).toBe(100);
    expect(keywordMatchScore([], ["Python"], ["AWS"])).toBe(0);
  });
});

describe("estimateCandidatePool", () => {
  it("shrinks with more required skills and experience, grows with remote", () => {
    const base = estimateCandidatePool({ requiredSkills: 3, years: 5, remote: false });
    expect(estimateCandidatePool({ requiredSkills: 6, years: 5, remote: false })).toBeLessThan(base);
    expect(estimateCandidatePool({ requiredSkills: 3, years: 10, remote: false })).toBeLessThan(base);
    expect(estimateCandidatePool({ requiredSkills: 3, years: 5, remote: true })).toBeGreaterThan(base);
  });

  it("rounds to tens and never drops below 40", () => {
    expect(estimateCandidatePool({ requiredSkills: 3, years: 5, remote: true }) % 10).toBe(0);
    expect(estimateCandidatePool({ requiredSkills: 60, years: 20, remote: false })).toBe(40);
  });
});
