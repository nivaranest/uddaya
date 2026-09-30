/**
 * ATS resume checker: deterministic analysis of resume text, optionally against
 * a job description. Mirrors what applicant tracking systems look for:
 * parseable text, standard sections, contact details, keyword coverage, and
 * concise, quantified bullet points.
 *
 * Runs without the Claude API; the AI review (app/api/ai/ats-check) adds
 * written suggestions on top of this score.
 */

export type CheckStatus = "pass" | "warn" | "fail";

export type AtsCheck = {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
};

export type AtsCategory = {
  id: "contact" | "sections" | "keywords" | "impact" | "format";
  label: string;
  score: number; // 0–100
  weight: number; // share of the total, sums to 1 across categories in the report
};

export type AtsReport = {
  score: number; // 0–100
  rating: "Excellent" | "Good" | "Needs work" | "Poor";
  categories: AtsCategory[];
  checks: AtsCheck[];
  keywords: { matched: string[]; missing: string[] } | null;
  stats: { words: number; bullets: number; quantifiedBullets: number; actionVerbBullets: number };
};

/* ---------------- Keyword dictionary ---------------- */

type Term = { name: string; aliases?: string[] };

/** Skills and phrases recognised in job descriptions. Aliases count as a match. */
export const SKILL_TERMS: Term[] = [
  // Languages
  { name: "Python" }, { name: "Java" }, { name: "JavaScript", aliases: ["JS", "ES6"] }, { name: "TypeScript", aliases: ["TS"] },
  { name: "Go", aliases: ["Golang"] }, { name: "Rust" }, { name: "C++" }, { name: "C#" }, { name: "Kotlin" }, { name: "Swift" },
  { name: "Ruby" }, { name: "PHP" }, { name: "Scala" }, { name: "SQL" }, { name: "R" },
  // Frontend
  { name: "React", aliases: ["React.js", "ReactJS"] }, { name: "Next.js", aliases: ["NextJS"] }, { name: "Angular" }, { name: "Vue", aliases: ["Vue.js"] },
  { name: "HTML" }, { name: "CSS" }, { name: "Tailwind", aliases: ["TailwindCSS"] }, { name: "Redux" }, { name: "React Native" }, { name: "Flutter" },
  // Backend
  { name: "Node.js", aliases: ["NodeJS", "Node"] }, { name: "Express" }, { name: "Django" }, { name: "Flask" }, { name: "FastAPI" },
  { name: "Spring Boot", aliases: ["Spring"] }, { name: "GraphQL" }, { name: "REST", aliases: ["RESTful", "REST API", "REST APIs"] },
  { name: "Microservices", aliases: ["Microservice"] }, { name: "gRPC" },
  // Data
  { name: "PostgreSQL", aliases: ["Postgres"] }, { name: "MySQL" }, { name: "MongoDB" }, { name: "Redis" }, { name: "Elasticsearch" },
  { name: "Kafka" }, { name: "RabbitMQ" }, { name: "Spark", aliases: ["PySpark", "Apache Spark"] }, { name: "Airflow" }, { name: "Snowflake" },
  { name: "Pandas" }, { name: "NumPy" }, { name: "Machine Learning", aliases: ["ML"] }, { name: "Deep Learning" }, { name: "TensorFlow" },
  { name: "PyTorch" }, { name: "NLP" }, { name: "LLM", aliases: ["LLMs"] }, { name: "Power BI" }, { name: "Tableau" }, { name: "Excel" },
  { name: "Data Analysis" }, { name: "ETL" },
  // Cloud & DevOps
  { name: "AWS", aliases: ["Amazon Web Services"] }, { name: "GCP", aliases: ["Google Cloud"] }, { name: "Azure" },
  { name: "Docker" }, { name: "Kubernetes", aliases: ["K8s"] }, { name: "Terraform" }, { name: "CI/CD", aliases: ["CICD"] },
  { name: "Jenkins" }, { name: "GitHub Actions" }, { name: "Linux" }, { name: "Git" }, { name: "Prometheus" }, { name: "Grafana" },
  // Practices
  { name: "System Design" }, { name: "Distributed Systems" }, { name: "API Design" }, { name: "Unit Testing", aliases: ["Unit Tests"] },
  { name: "TDD" }, { name: "Agile" }, { name: "Scrum" }, { name: "Jira" }, { name: "Figma" }, { name: "UX" }, { name: "UI" },
  { name: "Security" }, { name: "Performance" }, { name: "Scalability", aliases: ["Scalable"] },
  // Soft skills
  { name: "Leadership", aliases: ["Led", "Lead"] }, { name: "Mentoring", aliases: ["Mentored", "Mentor"] },
  { name: "Communication" }, { name: "Stakeholder Management", aliases: ["Stakeholders"] }, { name: "Problem Solving", aliases: ["Problem-solving"] },
  { name: "Collaboration", aliases: ["Cross-functional"] },
];

const ACTION_VERBS = [
  "achieved", "architected", "automated", "built", "championed", "created", "cut", "decreased", "delivered", "deployed", "designed",
  "developed", "drove", "enabled", "engineered", "established", "grew", "implemented", "improved", "increased", "introduced",
  "launched", "led", "managed", "mentored", "migrated", "optimized", "optimised", "owned", "reduced", "redesigned", "refactored",
  "scaled", "shipped", "spearheaded", "streamlined", "trained", "transformed",
];

/* ---------------- Helpers ---------------- */

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Words that are also ordinary English ("Go", "Express", "Lead"). These only
 * match with their exact capitalisation, to avoid false positives from prose.
 */
const CASE_SENSITIVE = new Set(["Go", "R", "Express", "Spring", "Swift", "Rust", "Node", "Lead", "Led", "Mentor", "UI", "UX", "ML", "JS", "TS"]);

/** Whole-term match that works for terms like "C++", "Node.js" and "CI/CD". */
function termRegex(term: string): RegExp {
  return new RegExp(`(?<![A-Za-z0-9])${escape(term)}(?![A-Za-z0-9+#])`, CASE_SENSITIVE.has(term) ? "" : "i");
}

function containsTerm(text: string, t: Term): boolean {
  return [t.name, ...(t.aliases ?? [])].some((a) => termRegex(a).test(text));
}

/** Soft-skill verb forms are fine evidence in a resume but too loose to extract from a job description. */
const JD_IGNORED_ALIASES = new Set(["Led", "Lead", "Mentor", "Mentored", "Node", "Spring", "Stakeholders", "Scalable"]);

/** Keywords an ATS would screen for, taken from a job description (plus any known job skills). */
export function extractKeywords(jobDescription: string, extra: string[] = []): string[] {
  const names = new Map<string, string>();
  for (const t of SKILL_TERMS) {
    const forms = [t.name, ...(t.aliases ?? []).filter((a) => !JD_IGNORED_ALIASES.has(a))];
    if (forms.some((f) => termRegex(f).test(jobDescription))) names.set(t.name.toLowerCase(), t.name);
  }
  for (const e of extra) if (e.trim()) names.set(e.trim().toLowerCase(), e.trim());
  return [...names.values()];
}

function matchKeywords(resume: string, keywords: string[]) {
  const byName = new Map(SKILL_TERMS.map((t) => [t.name.toLowerCase(), t]));
  const matched: string[] = [];
  const missing: string[] = [];
  for (const k of keywords) {
    const term = byName.get(k.toLowerCase()) ?? { name: k };
    (containsTerm(resume, term) ? matched : missing).push(k);
  }
  return { matched, missing };
}

const SECTION_PATTERNS: Record<string, RegExp> = {
  summary: /^\s*(professional\s+)?(summary|profile|objective|about\s+me)\s*:?\s*$/im,
  experience: /^\s*(work\s+|professional\s+)?(experience|employment(\s+history)?|work\s+history)\s*:?\s*$/im,
  education: /^\s*(education|academic\s+(background|qualifications)|qualifications)\s*:?\s*$/im,
  skills: /^\s*((technical|core|key)\s+)?(skills|competencies|technologies|tech\s+stack)\s*:?\s*$/im,
  projects: /^\s*(projects|key\s+projects|personal\s+projects)\s*:?\s*$/im,
  certifications: /^\s*(certifications?|licenses?(\s+&\s+certifications)?|courses)\s*:?\s*$/im,
};

const BULLET_RE = /^\s*([-•*▪●◦–]|\d+[.)])\s+/;

function lines(text: string) {
  return text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function ratingFor(score: number): AtsReport["rating"] {
  return score >= 85 ? "Excellent" : score >= 70 ? "Good" : score >= 50 ? "Needs work" : "Poor";
}

/* ---------------- Analysis ---------------- */

export function analyzeResume(resumeText: string, opts: { jobDescription?: string; jobKeywords?: string[] } = {}): AtsReport {
  const text = resumeText.replace(/ /g, " ");
  const all = lines(text);
  const words = text.split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
  const checks: AtsCheck[] = [];
  const add = (id: string, label: string, status: CheckStatus, detail: string) => checks.push({ id, label, status, detail });

  // Readability: an ATS can only score text it can extract.
  if (words < 50) {
    add("parse", "Readable text", "fail", "Very little text could be read. Image-only or scanned PDFs are invisible to most ATS — export a text-based PDF or DOCX.");
  } else {
    add("parse", "Readable text", "pass", `${words.toLocaleString("en-IN")} words extracted.`);
  }

  // Contact
  const email = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i.test(text);
  const phone = /(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}\b|\+?\d[\d\s().-]{8,}\d/.test(text);
  const linkedin = /linkedin\.com\/in\//i.test(text);
  const portfolio = /github\.com\/|gitlab\.com\/|behance\.net\/|https?:\/\/(?!.*linkedin)/i.test(text);
  add("email", "Email address", email ? "pass" : "fail", email ? "Found." : "Add a professional email near the top.");
  add("phone", "Phone number", phone ? "pass" : "fail", phone ? "Found." : "Add a phone number with country code, e.g. +91 98765 43210.");
  add("linkedin", "LinkedIn profile", linkedin ? "pass" : "warn", linkedin ? "Found." : "Recruiters expect a linkedin.com/in/ URL.");
  const contactScore = (email ? 40 : 0) + (phone ? 35 : 0) + (linkedin ? 15 : 0) + (portfolio ? 10 : 0);

  // Sections
  const has = Object.fromEntries(Object.entries(SECTION_PATTERNS).map(([k, re]) => [k, re.test(text)])) as Record<keyof typeof SECTION_PATTERNS, boolean>;
  for (const [key, label] of [["experience", "Experience section"], ["education", "Education section"], ["skills", "Skills section"]] as const) {
    add(`section-${key}`, label, has[key] ? "pass" : "fail", has[key] ? "Standard heading found." : `Add a heading named “${label.replace(" section", "")}” so the ATS can file this information.`);
  }
  add("section-summary", "Professional summary", has.summary ? "pass" : "warn", has.summary ? "Found." : "A 2–3 line summary at the top helps both ATS and recruiters.");
  const sectionsScore = (has.experience ? 35 : 0) + (has.education ? 20 : 0) + (has.skills ? 25 : 0) + (has.summary ? 10 : 0) + (has.projects || has.certifications ? 10 : 0);

  // Impact: bullets that start with an action verb and include numbers.
  const bullets = all.filter((l) => BULLET_RE.test(l)).map((l) => l.replace(BULLET_RE, ""));
  const quantified = bullets.filter((b) => /\d/.test(b) && /(%|\bx\b|\d+x|₹|\$|\b(k|lakh|lakhs|crore|cr|million|mn|bn|users|customers|ms|hours|days|weeks)\b|\d{2,})/i.test(b)).length;
  const verbRe = new RegExp(`^(${ACTION_VERBS.join("|")})\\b`, "i");
  const actionVerb = bullets.filter((b) => verbRe.test(b)).length;
  const qRatio = bullets.length ? quantified / bullets.length : 0;
  const vRatio = bullets.length ? actionVerb / bullets.length : 0;
  add(
    "quantified",
    "Quantified achievements",
    qRatio >= 0.4 ? "pass" : qRatio >= 0.2 ? "warn" : "fail",
    bullets.length ? `${quantified} of ${bullets.length} bullets include a number or metric. Aim for at least 40%.` : "No bullet points found to measure.",
  );
  add(
    "action-verbs",
    "Strong action verbs",
    vRatio >= 0.6 ? "pass" : vRatio >= 0.3 ? "warn" : "fail",
    bullets.length ? `${actionVerb} of ${bullets.length} bullets start with an action verb like “Built”, “Led” or “Reduced”.` : "Start each bullet with an action verb.",
  );
  // Full marks at 40% quantified and 60% action-verb bullets.
  const impactScore = Math.min(50, (qRatio / 0.4) * 50) + Math.min(50, (vRatio / 0.6) * 50);

  // Format & length
  const lengthOk = words >= 350 && words <= 1100;
  add(
    "length",
    "Resume length",
    lengthOk ? "pass" : words < 250 || words > 1400 ? "fail" : "warn",
    words < 350 ? "Short for a professional resume — add detail to your experience." : words > 1100 ? "Long — trim to 1–2 pages; older roles can be one line each." : "Within the 1–2 page range.",
  );
  add("bullets", "Bullet points", bullets.length >= 6 ? "pass" : bullets.length >= 3 ? "warn" : "fail", bullets.length >= 6 ? `${bullets.length} bullets — easy to scan.` : "Use bullet points for responsibilities and achievements instead of paragraphs.");
  const firstPerson = (text.match(/\b(I|me|my|myself)\b/g) ?? []).length;
  add("pronouns", "No first-person pronouns", firstPerson <= 2 ? "pass" : "warn", firstPerson <= 2 ? "Written in resume style." : `Found “I/my/me” ${firstPerson} times — drop them (“Led a team…” not “I led a team…”).`);
  const dates = (text.match(/\b(19|20)\d{2}\b/g) ?? []).length;
  add("dates", "Employment dates", dates >= 2 ? "pass" : "warn", dates >= 2 ? "Dates found." : "Add start and end dates (e.g. Jan 2023 – Present) to each role.");
  const longParas = all.filter((l) => l.split(/\s+/).length > 60).length;
  if (longParas) add("paragraphs", "Scannable text", "warn", `${longParas} very long paragraph${longParas > 1 ? "s" : ""} — split into bullets.`);
  const formatScore = (lengthOk ? 35 : words >= 250 && words <= 1400 ? 20 : 5) + Math.min(25, bullets.length * 4) + (firstPerson <= 2 ? 15 : 5) + (dates >= 2 ? 15 : 0) + (longParas ? 0 : 10);

  // Keywords
  const jd = opts.jobDescription?.trim() ?? "";
  const keywordList = jd || opts.jobKeywords?.length ? extractKeywords(jd, opts.jobKeywords) : [];
  let keywords: AtsReport["keywords"] = null;
  let keywordScore = 0;
  if (keywordList.length) {
    keywords = matchKeywords(text, keywordList);
    const ratio = keywords.matched.length / keywordList.length;
    keywordScore = ratio * 100;
    add(
      "keywords",
      "Job keyword match",
      ratio >= 0.7 ? "pass" : ratio >= 0.45 ? "warn" : "fail",
      `${keywords.matched.length} of ${keywordList.length} keywords from the job appear in your resume.`,
    );
  }

  const cats: AtsCategory[] = keywords
    ? [
        { id: "keywords", label: "Keyword match", score: clamp(keywordScore), weight: 0.35 },
        { id: "sections", label: "Sections & structure", score: clamp(sectionsScore), weight: 0.2 },
        { id: "impact", label: "Impact & achievements", score: clamp(impactScore), weight: 0.2 },
        { id: "format", label: "Formatting & length", score: clamp(formatScore), weight: 0.13 },
        { id: "contact", label: "Contact details", score: clamp(contactScore), weight: 0.12 },
      ]
    : [
        { id: "sections", label: "Sections & structure", score: clamp(sectionsScore), weight: 0.3 },
        { id: "impact", label: "Impact & achievements", score: clamp(impactScore), weight: 0.3 },
        { id: "format", label: "Formatting & length", score: clamp(formatScore), weight: 0.22 },
        { id: "contact", label: "Contact details", score: clamp(contactScore), weight: 0.18 },
      ];

  let score = clamp(cats.reduce((s, c) => s + c.score * c.weight, 0));
  if (words < 50) score = Math.min(score, 10);

  // Failures first, then warnings, then passes.
  const order: Record<CheckStatus, number> = { fail: 0, warn: 1, pass: 2 };
  checks.sort((a, b) => order[a.status] - order[b.status]);

  return {
    score,
    rating: ratingFor(score),
    categories: cats,
    checks,
    keywords,
    stats: { words, bullets: bullets.length, quantifiedBullets: quantified, actionVerbBullets: actionVerb },
  };
}

export const SAMPLE_RESUME = `Sairam Kumar
Hyderabad, India | +91 98765 43210 | sairam@email.com | linkedin.com/in/sairamkumar

Summary
Full-stack developer with 5+ years building web applications in React and Node.js. I enjoy mentoring and clean code.

Experience
Senior Software Engineer, TechCorp — Jan 2023 – Present
- Led a backend team of 5 building the subscription billing platform
- Built REST APIs in Node.js and Python used by 3,000+ businesses
- Reduced invoice generation time by 60% by moving batch jobs to a queue
- Worked on code reviews and hiring

Full Stack Developer, CloudSoft — Jun 2020 – Dec 2022
- Developed customer dashboards in React
- Responsible for Node.js services on AWS
- Improved page load time from 4s to 1.5s

Education
B.Tech in Computer Science, University of Hyderabad — 2018

Skills
JavaScript, TypeScript, React, Node.js, Python, AWS, PostgreSQL, Git
`;
