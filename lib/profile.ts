export type ProfileSnapshot = {
  photo: string;
  basic: { name: string; email: string; phone: string; location: string; headline: string };
  about: string;
  experience: unknown[];
  education: unknown[];
  skills: unknown[];
  certifications: unknown[];
  resumes: unknown[];
};

type Check = { key: string; weight: number; done: boolean; tip: string };

/**
 * Profile completeness (PRD 5.1.2): weighted by section, totals 100.
 * Returns the score and the next section the candidate should fill in.
 */
export function profileCompletion(p: ProfileSnapshot): { pct: number; nextTip: string | null } {
  const b = p.basic;
  const checks: Check[] = [
    { key: "photo", weight: 15, done: !!p.photo, tip: "Next: Add a profile photo" },
    { key: "basic", weight: 20, done: !!(b.name && b.email && b.phone && b.location), tip: "Next: Fill in your basic info" },
    { key: "about", weight: 15, done: p.about.trim().length > 20, tip: "Next: Add a bio" },
    { key: "experience", weight: 15, done: p.experience.length > 0, tip: "Next: Add your experience" },
    { key: "education", weight: 10, done: p.education.length > 0, tip: "Next: Add your education" },
    { key: "skills", weight: 10, done: p.skills.length >= 3, tip: "Next: Add at least 3 skills" },
    { key: "certifications", weight: 5, done: p.certifications.length > 0, tip: "Next: Add a certification" },
    { key: "resume", weight: 10, done: p.resumes.length > 0, tip: "Next: Upload a resume" },
  ];
  const pct = checks.reduce((sum, c) => sum + (c.done ? c.weight : 0), 0);
  const missing = checks.find((c) => !c.done);
  return { pct, nextTip: missing ? missing.tip : null };
}
