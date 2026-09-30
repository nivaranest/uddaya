import { analyzeResume, extractKeywords, SAMPLE_RESUME } from "@/lib/ats";

const STRONG = `Asha Rao
Bengaluru | +91 98450 12345 | asha@example.com | linkedin.com/in/asharao | github.com/asharao

Summary
Backend engineer with 6 years building payment systems in Python and Go.

Experience
Senior Engineer, PayCo — Mar 2021 – Present
- Led migration of 40 services to Kubernetes, cutting deploy time by 70%
- Built a Kafka pipeline processing 2M events per day
- Reduced API p95 latency from 900ms to 150ms with Redis caching
- Mentored 4 engineers; 2 promoted within a year

Engineer, ShopKart — Jul 2018 – Feb 2021
- Developed order APIs in Python and PostgreSQL serving 1M users
- Automated CI/CD with GitHub Actions, saving 10 hours per week
- Designed a fraud rules engine that cut chargebacks by 25%

Education
B.E. Computer Science, RV College of Engineering — 2018

Skills
Python, Go, PostgreSQL, Redis, Kafka, Kubernetes, Docker, AWS, CI/CD
`;

describe("extractKeywords", () => {
  it("finds known skills and aliases in a job description", () => {
    const k = extractKeywords("We need Postgres, K8s and strong ReactJS skills. CI/CD experience is a plus.");
    expect(k).toEqual(expect.arrayContaining(["PostgreSQL", "Kubernetes", "React", "CI/CD"]));
  });

  it("does not treat ordinary words as skills", () => {
    const k = extractKeywords("You will go above and beyond, express ideas clearly and lead by example.");
    expect(k).not.toEqual(expect.arrayContaining(["Go"]));
    expect(k).not.toContain("Express");
    expect(k).not.toContain("Leadership");
  });

  it("includes extra job skills", () => {
    expect(extractKeywords("", ["Django", "django", " "])).toEqual(["django"]);
  });
});

describe("analyzeResume", () => {
  it("scores a well-structured, quantified resume highly", () => {
    const r = analyzeResume(STRONG);
    expect(r.score).toBeGreaterThanOrEqual(85);
    expect(r.rating).toBe("Excellent");
    // The fixture is deliberately short, so only the length check may fail.
    expect(r.checks.filter((c) => c.status === "fail").map((c) => c.id)).toEqual(["length"]);
    expect(r.keywords).toBeNull();
    expect(r.categories.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1);
  });

  it("flags missing sections, contact details and weak bullets", () => {
    const r = analyzeResume("I am a hard working developer. I did many things at my job. ".repeat(10));
    const status = Object.fromEntries(r.checks.map((c) => [c.id, c.status]));
    expect(status.email).toBe("fail");
    expect(status["section-experience"]).toBe("fail");
    expect(status.bullets).toBe("fail");
    expect(status.pronouns).toBe("warn");
    expect(r.score).toBeLessThan(40);
    // Failures are listed first.
    expect(r.checks[0].status).toBe("fail");
  });

  it("treats near-empty text as unreadable", () => {
    const r = analyzeResume("Scanned resume");
    expect(r.checks.find((c) => c.id === "parse")?.status).toBe("fail");
    expect(r.score).toBeLessThanOrEqual(10);
  });

  it("matches job keywords, including aliases in the resume", () => {
    const r = analyzeResume(STRONG, { jobDescription: "Python, PostgreSQL, Kubernetes, Terraform and Django required." });
    expect(r.keywords?.matched).toEqual(expect.arrayContaining(["Python", "PostgreSQL", "Kubernetes"]));
    expect(r.keywords?.missing).toEqual(expect.arrayContaining(["Terraform", "Django"]));
    expect(r.categories[0].id).toBe("keywords");
    expect(r.categories.reduce((s, c) => s + c.weight, 0)).toBeCloseTo(1);
  });

  it("gives the sample resume room to improve", () => {
    const r = analyzeResume(SAMPLE_RESUME, { jobKeywords: ["Python", "AWS", "Django", "Kubernetes"] });
    expect(r.score).toBeGreaterThan(40);
    expect(r.score).toBeLessThan(85);
    expect(r.keywords?.missing).toEqual(expect.arrayContaining(["Django", "Kubernetes"]));
  });
});
