/**
 * Seed data for the UI. These mirror the design prototypes (docs/design) and
 * the PRD personas, and stand in for API responses until the backend lands.
 */

export const INITIAL_CANDIDATE_COUNT = 12450;

export type Company = {
  name: string;
  industry: string;
  size: string;
  founded: string;
  website: string;
  location: string;
  logoBg: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode?: string;
  salary: string;
  match: number;
  experience: string;
  jobType: string;
  posted: string;
  about: string[];
  responsibilities: string[];
  requiredSkills: string[];
  niceToHave: string[];
  experienceRequired: string;
};

export const COMPANIES: Record<string, Company> = {
  TechCorp: {
    name: "TechCorp",
    industry: "Technology / SaaS",
    size: "100–500 employees",
    founded: "2018",
    website: "www.techcorp.in",
    location: "Hyderabad, India",
    logoBg: "#1F2937",
  },
  Razorleaf: { name: "Razorleaf", industry: "Fintech", size: "50–100 employees", founded: "2019", website: "www.razorleaf.in", location: "Bengaluru, India", logoBg: "#1F2937" },
  "Startup XYZ": { name: "Startup XYZ", industry: "Technology / SaaS", size: "10–50 employees", founded: "2023", website: "www.startupxyz.in", location: "Remote", logoBg: "#8A5A2B" },
  CloudSoft: { name: "CloudSoft", industry: "Cloud Infrastructure", size: "500–1000 employees", founded: "2012", website: "www.cloudsoft.in", location: "Pune, India", logoBg: "#4F7F68" },
  Datanest: { name: "Datanest", industry: "Data & Analytics", size: "50–100 employees", founded: "2020", website: "www.datanest.in", location: "Hyderabad, India", logoBg: "#374151" },
  Kiranaverse: { name: "Kiranaverse", industry: "Retail Tech", size: "100–500 employees", founded: "2017", website: "www.kiranaverse.in", location: "Mumbai, India", logoBg: "#B07A48" },
  "Mitra Health": { name: "Mitra Health", industry: "Healthcare", size: "50–100 employees", founded: "2021", website: "www.mitrahealth.in", location: "Chennai, India", logoBg: "#1F2937" },
  "Yatra Labs": { name: "Yatra Labs", industry: "Travel Tech", size: "100–500 employees", founded: "2016", website: "www.yatralabs.in", location: "Delhi NCR, India", logoBg: "#2F5E48" },
  "Sthir Systems": { name: "Sthir Systems", industry: "Enterprise Software", size: "500+ employees", founded: "2010", website: "www.sthir.in", location: "Hyderabad, India", logoBg: "#6B4423" },
  Pravah: { name: "Pravah", industry: "Developer Tools", size: "10–50 employees", founded: "2022", website: "www.pravah.dev", location: "Remote", logoBg: "#4B5563" },
  "Kalam EdTech": { name: "Kalam EdTech", industry: "Education", size: "100–500 employees", founded: "2015", website: "www.kalam.edu.in", location: "Bengaluru, India", logoBg: "#8A5A2B" },
};

export function companyFor(name: string): Company {
  return (
    COMPANIES[name] ?? {
      name,
      industry: "Technology",
      size: "50–200 employees",
      founded: "2020",
      website: "",
      location: "India",
      logoBg: "#1F2937",
    }
  );
}

const TECHCORP_RESPONSIBILITIES = [
  "Design and build scalable Python services",
  "Lead code reviews and mentor junior developers",
  "Collaborate with product and design teams",
  "Own reliability of payment APIs, including on-call rotation",
  "Drive database schema and query performance work in PostgreSQL",
  "Write technical design docs for new services",
  "Improve CI/CD pipelines and test coverage",
  "Help hire and onboard new engineers",
];

type JobSeed = Pick<Job, "id" | "title" | "company" | "location" | "salary" | "match"> &
  Partial<Omit<Job, "id" | "title" | "company" | "location" | "salary" | "match">>;

function job(seed: JobSeed): Job {
  const c = companyFor(seed.company);
  const skills = seed.requiredSkills ?? ["Python", "AWS", "PostgreSQL"];
  return {
    workMode: undefined,
    experience: "3+ years",
    jobType: "Full-time",
    posted: "Posted 3 days ago",
    about: [
      `${c.name} is hiring a ${seed.title} to join a growing ${c.industry.toLowerCase()} team in ${seed.location}.`,
      `You will own services end to end, work closely with product and design, and help raise the engineering bar through reviews and mentoring.`,
    ],
    responsibilities: [
      "Design, build and operate production services",
      "Review code and mentor teammates",
      "Collaborate with product and design on the roadmap",
      "Improve observability, testing and deployment pipelines",
    ],
    requiredSkills: skills,
    niceToHave: ["Kubernetes", "Redis"],
    experienceRequired: "3+ years in software development",
    ...seed,
  };
}

/** The featured recommendation on the candidate dashboard. */
export const FEATURED_JOB: Job = job({
  id: "senior-python-engineer-techcorp",
  title: "Senior Python Engineer",
  company: "TechCorp",
  location: "Hyderabad",
  workMode: "Hybrid",
  salary: "₹20–30 LPA",
  match: 87,
  experience: "5+ years",
  posted: "Posted 5 days ago",
  about: [
    "TechCorp builds the billing and subscription platform used by over 3,000 Indian SaaS businesses. We are looking for a Senior Python Engineer to own core services on our payments team, from API design through production reliability.",
    "You will work in a team of eight engineers, ship to production several times a day, and have a direct say in architecture. The role is hybrid, with three days a week at our Hitech City office.",
  ],
  responsibilities: TECHCORP_RESPONSIBILITIES,
  requiredSkills: ["Python", "AWS", "PostgreSQL", "Django", "Leadership"],
  niceToHave: ["Kubernetes", "Redis", "Microservices"],
  experienceRequired: "5+ years in backend development",
});

export const JOBS: Job[] = [
  job({ id: "backend-engineer-payments-razorleaf", title: "Backend Engineer, Payments", company: "Razorleaf", location: "Bengaluru", salary: "₹18–26 LPA", match: 84, requiredSkills: ["Python", "PostgreSQL", "Kafka"] }),
  job({ id: "full-stack-developer-startup-xyz", title: "Full Stack Developer", company: "Startup XYZ", location: "Remote", salary: "₹14–22 LPA", match: 81, requiredSkills: ["React", "Node.js", "PostgreSQL"] }),
  job({ id: "devops-engineer-cloudsoft", title: "DevOps Engineer", company: "CloudSoft", location: "Pune", salary: "₹16–24 LPA", match: 78, requiredSkills: ["AWS", "Terraform", "Kubernetes"], niceToHave: ["Python", "Go"] }),
  job({ id: "python-developer-data-datanest", title: "Python Developer, Data", company: "Datanest", location: "Hyderabad", salary: "₹15–21 LPA", match: 76, requiredSkills: ["Python", "SQL", "Airflow"] }),
  job({ id: "staff-engineer-platform-kiranaverse", title: "Staff Engineer, Platform", company: "Kiranaverse", location: "Mumbai", salary: "₹35–45 LPA", match: 72, experience: "8+ years", requiredSkills: ["System Design", "Go", "AWS", "Leadership"] }),
  job({ id: "django-developer-mitra-health", title: "Django Developer", company: "Mitra Health", location: "Chennai", salary: "₹12–18 LPA", match: 71, requiredSkills: ["Python", "Django", "PostgreSQL"] }),
  job({ id: "engineering-lead-apis-yatra-labs", title: "Engineering Lead, APIs", company: "Yatra Labs", location: "Delhi NCR", salary: "₹30–40 LPA", match: 69, experience: "7+ years", requiredSkills: ["Leadership", "API Design", "Node.js"] }),
  job({ id: "cloud-engineer-aws-sthir-systems", title: "Cloud Engineer (AWS)", company: "Sthir Systems", location: "Hyderabad", salary: "₹20–28 LPA", match: 67, requiredSkills: ["AWS", "Terraform", "Python"] }),
  job({ id: "nodejs-engineer-pravah", title: "Node.js Engineer", company: "Pravah", location: "Remote", salary: "₹14–20 LPA", match: 64, requiredSkills: ["Node.js", "TypeScript", "Redis"] }),
  job({ id: "senior-react-developer-kalam-edtech", title: "Senior React Developer", company: "Kalam EdTech", location: "Bengaluru", salary: "₹22–30 LPA", match: 62, requiredSkills: ["React", "TypeScript", "GraphQL"] }),
];

export function getJob(id: string): Job | undefined {
  if (id === FEATURED_JOB.id) return FEATURED_JOB;
  return JOBS.find((j) => j.id === id);
}

export const ALL_JOB_IDS = [FEATURED_JOB.id, ...JOBS.map((j) => j.id)];

/** The signed-in candidate (PRD persona, as in the prototypes). */
export const CANDIDATE = {
  name: "Sairam Kumar",
  firstName: "Sairam",
  initials: "SK",
  email: "sairam@email.com",
  phone: "+91 9876543210",
  location: "Hyderabad, India",
  headline: "Full Stack Developer | React & Node.js",
  memberSince: "Feb 2026",
  about:
    "Experienced full-stack developer with 5+ years building scalable web applications.\nExpertise in React, Node.js, and cloud technologies.\nPassionate about clean code and mentoring junior developers.",
  /** Skill → proficiency, used for match explanations. */
  skills: [
    { name: "Python", level: "Advanced", years: 5, endorsements: 5 },
    { name: "JavaScript", level: "Advanced", years: 6, endorsements: 8 },
    { name: "React", level: "Advanced", years: 4, endorsements: 6 },
    { name: "AWS", level: "Intermediate", years: 3, endorsements: 0 },
    { name: "PostgreSQL", level: "Intermediate", years: 4, endorsements: 0 },
    { name: "Leadership", level: "Intermediate", years: 2, endorsements: 0 },
    { name: "Communication", level: "Advanced", years: 5, endorsements: 0 },
  ],
  experience: [
    { company: "TechCorp", title: "Senior Software Engineer", dates: "Jan 2023 - Present", desc: "Led backend team of 5 building the subscription billing platform." },
    { company: "CloudSoft", title: "Full Stack Developer", dates: "Jun 2020 - Dec 2022", desc: "Built customer dashboards in React and Node.js services on AWS." },
  ],
  education: [{ school: "University of Hyderabad", degree: "B.Tech in Computer Science", year: "2018" }],
  certifications: [{ name: "AWS Solutions Architect - Associate", issuer: "Amazon Web Services", date: "Mar 2023", cred: "12345678" }],
  resumes: [
    { name: "Sairam_Kumar_Resume_2026.pdf", meta: "Updated 15 days ago" },
    { name: "Resume_TechRole.pdf", meta: "Updated 2 months ago" },
    { name: "Resume_Leadership.pdf", meta: "Updated 4 months ago" },
  ],
};

export const ENDORSERS = ["Ananya Iyer", "Rohit Menon", "Priya Rao", "Vikram Singh", "Meera Pillai", "Arjun Reddy", "Kavya Nair", "Neha Gupta"];

export const CANDIDATE_NOTIFICATIONS = [
  { icon: "event", text: "TechCorp interview on Sept 30, 2 PM", time: "1 hour ago", href: "/applications" },
  { icon: "workspace_premium", text: "You received an offer from TechCorp", time: "Yesterday", href: "/applications" },
  { icon: "bolt", text: "3 new jobs match your skills", time: "2 days ago", href: "/dashboard#jobs" },
];

/* ---------- Candidate applications (Kanban) ---------- */

export type AppColumn = "applied" | "interview" | "offer" | "closed";

export type CandidateApplication = {
  id: number;
  col: AppColumn;
  company: string;
  job: string;
  meta?: string;
  /** Days since last update — used for "Recent" sort. */
  age: number;
  salary?: string;
  joining?: string;
  offer?: "pending" | "accepted" | "declined";
};

const APPLIED: [string, string, string, number][] = [
  ["TechCorp", "Senior Python Engineer", "Applied 2 days ago", 2],
  ["Startup XYZ", "Full Stack Developer", "Applied 5 days ago", 5],
  ["Razorleaf", "Backend Engineer, Payments", "Applied 1 day ago", 1],
  ["Datanest", "Python Developer, Data", "Applied 3 days ago", 3],
  ["Kiranaverse", "Staff Engineer, Platform", "Applied 6 days ago", 6],
  ["Mitra Health", "Django Developer", "Applied 1 week ago", 7],
  ["Yatra Labs", "Engineering Lead, APIs", "Applied 8 days ago", 8],
  ["Sthir Systems", "Cloud Engineer (AWS)", "Applied 9 days ago", 9],
  ["Pravah", "Node.js Engineer", "Applied 10 days ago", 10],
  ["Kalam EdTech", "Senior React Developer", "Applied 11 days ago", 11],
  ["Finverse", "Platform Engineer", "Applied 12 days ago", 12],
  ["Nirmaan", "Backend Developer", "Applied 2 weeks ago", 14],
];

export const CANDIDATE_APPLICATIONS: CandidateApplication[] = [
  ...APPLIED.map(([company, jobTitle, meta, age], i) => ({ id: i + 1, col: "applied" as const, company, job: jobTitle, meta, age })),
  { id: 20, col: "interview", company: "TechCorp", job: "Senior Python Engineer", meta: "Sept 30, 2PM", age: 0 },
  { id: 21, col: "interview", company: "CloudSoft", job: "DevOps Engineer", meta: "Oct 2, 10AM", age: 1 },
  { id: 22, col: "interview", company: "Razorleaf", job: "SRE, Payments", meta: "Oct 3, 4PM", age: 2 },
  { id: 23, col: "interview", company: "Yatra Labs", job: "Backend Engineer", meta: "Oct 6, 11AM", age: 3 },
  { id: 30, col: "offer", company: "TechCorp", job: "Senior Python Engineer", salary: "₹25 LPA", joining: "Oct 15, 2026", offer: "pending", age: 1 },
  { id: 40, col: "closed", company: "OldStartup", job: "Junior Developer", meta: "Rejected 1 week ago", age: 7 },
  { id: 41, col: "closed", company: "Bharat Retail", job: "Python Developer", meta: "Rejected 2 weeks ago", age: 14 },
  { id: 42, col: "closed", company: "Quanta", job: "Backend Engineer", meta: "Position closed", age: 20 },
];

/* ---------- Recruiter ---------- */

export const RECRUITER = { name: "Priya Rao", initials: "PR", company: "TechCorp", planJobSlots: 5 };

export type RecruiterJob = { title: string; apps: number; views: number; active: boolean; posted: string };

export const RECRUITER_JOBS: RecruiterJob[] = [
  { title: "Senior Python Engineer", apps: 18, views: 1240, active: true, posted: "Sept 24" },
  { title: "DevOps Engineer", apps: 9, views: 610, active: true, posted: "Sept 19" },
  { title: "Product Designer", apps: 7, views: 820, active: true, posted: "Sept 15" },
  { title: "Engineering Manager", apps: 4, views: 390, active: true, posted: "Sept 10" },
  { title: "Data Analyst", apps: 3, views: 275, active: true, posted: "Sept 2" },
  { title: "QA Automation Engineer", apps: 11, views: 940, active: false, posted: "Aug 21" },
];

export type PipelineStage = "new" | "screen" | "interview" | "offer";

export type PipelineCard = {
  id: number;
  col: PipelineStage;
  /** Stage the card started in, so column totals stay consistent after a move. */
  orig?: PipelineStage;
  name: string;
  job: string;
  meta: string;
  scheduled?: boolean;
  offer?: "Accepted" | "Awaiting reply";
};

/** Total applications per stage, including those not shown as cards. */
export const PIPELINE_TOTALS: Record<PipelineStage, number> = { new: 12, screen: 8, interview: 4, offer: 2 };

export const PIPELINE_CARDS: PipelineCard[] = [
  { id: 1, col: "new", name: "Ananya Iyer", job: "Senior Python Engineer", meta: "Applied 2 days ago" },
  { id: 2, col: "new", name: "Rohit Menon", job: "DevOps Engineer", meta: "Applied 3 days ago" },
  { id: 3, col: "new", name: "Fatima Sheikh", job: "Product Designer", meta: "Applied 4 days ago" },
  { id: 4, col: "screen", name: "Vikram Singh", job: "Senior Python Engineer", meta: "Phone screen passed" },
  { id: 5, col: "screen", name: "Meera Pillai", job: "Data Analyst", meta: "Assessment sent" },
  { id: 6, col: "interview", name: "Arjun Reddy", job: "Senior Python Engineer", meta: "Tomorrow, 2:00 PM", scheduled: true },
  { id: 7, col: "interview", name: "Kavya Nair", job: "Engineering Manager", meta: "Oct 2, 11:00 AM", scheduled: true },
  { id: 8, col: "offer", name: "Siddharth Joshi", job: "DevOps Engineer", meta: "Offer sent Sept 26", offer: "Accepted" },
  { id: 9, col: "offer", name: "Neha Gupta", job: "Product Designer", meta: "Offer sent Sept 27", offer: "Awaiting reply" },
];

/* ---------- Mock interview ---------- */

export const MOCK_INTERVIEW_QUESTIONS = [
  "Tell me about your experience with Python and how you've used it in production environments",
  "How would you design a payments API that stays reliable during a 10x traffic spike?",
  "Walk me through how you debugged the hardest production incident you have faced.",
  "How do you mentor junior developers and give feedback on their code?",
  "Describe an AWS architecture you built. What trade-offs did you make?",
];

/* ---------- Job posting ---------- */

export const SKILL_SUGGESTIONS = [
  "Python", "AWS", "PostgreSQL", "Django", "React", "Node.js", "Kubernetes", "Docker", "Microservices",
  "Redis", "FastAPI", "Kafka", "GCP", "TypeScript", "Go", "Terraform", "Leadership", "System Design",
];

export const DEFAULT_INTERVIEW_QUESTIONS = [
  "Tell me about your experience with Python and production systems",
  "How do you approach system design for scalability?",
  "Describe a time you led a technical initiative",
  "How do you mentor junior developers?",
  "Tell me about your AWS experience",
];
