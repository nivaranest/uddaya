export type CandidateSkill = { name: string; level: string; years: number };

export type MatchReason = {
  skill: string;
  note: string;
  ok: boolean;
};

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Skill-by-skill "why you match" breakdown (PRD 5.1.4). This is also the
 * keyword fallback the PRD calls for when the Claude matching service is
 * unavailable.
 */
export function explainMatch(candidate: CandidateSkill[], required: string[], niceToHave: string[]): MatchReason[] {
  const have = new Map(candidate.map((s) => [norm(s.name), s]));
  const req = required.map((skill) => {
    const s = have.get(norm(skill));
    return s
      ? { skill: `${skill} (${s.level}, ${s.years} ${s.years === 1 ? "year" : "years"})`, note: "You have, They need", ok: true }
      : { skill, note: "Required (You don't have)", ok: false };
  });
  const nice = niceToHave.map((skill) => {
    const s = have.get(norm(skill));
    return s
      ? { skill: `${skill} (${s.level})`, note: "Nice to have (You have)", ok: true }
      : { skill, note: "Nice to have (You don't have)", ok: false };
  });
  return [...req, ...nice];
}

/** Keyword-overlap score 0–100: required skills weigh 80%, nice-to-have 20%. */
export function keywordMatchScore(candidate: CandidateSkill[], required: string[], niceToHave: string[]): number {
  const have = new Set(candidate.map((s) => norm(s.name)));
  const frac = (list: string[]) => (list.length ? list.filter((s) => have.has(norm(s))).length / list.length : 1);
  return Math.round(frac(required) * 80 + frac(niceToHave) * 20);
}

/**
 * Rough size of the matching candidate pool for a draft job post
 * (PRD 5.2.3 step 4: "~500 candidates match this job").
 */
export function estimateCandidatePool(opts: { requiredSkills: number; years: number; remote: boolean }): number {
  const raw = (1400 / (1 + opts.requiredSkills * 0.35)) * (1 - opts.years * 0.03) * (opts.remote ? 1.25 : 1);
  return Math.max(40, Math.round(raw / 10) * 10);
}
