// Idempotent: creates/updates the seeded accounts from SEED_* env vars on every start.
import { PrismaClient } from "@prisma/client";
import { randomBytes, scryptSync } from "node:crypto";

const hash = (pw) => {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("hex")}$${scryptSync(pw, salt, 64).toString("hex")}`;
};

const accounts = [
  ["admin", "Uddaya Admin", process.env.SEED_ADMIN_EMAIL, process.env.SEED_ADMIN_PASSWORD],
  ["recruiter", "Priya Rao", process.env.SEED_RECRUITER_EMAIL, process.env.SEED_RECRUITER_PASSWORD],
  ["candidate", "Sairam Kumar", process.env.SEED_CANDIDATE_EMAIL, process.env.SEED_CANDIDATE_PASSWORD],
];

const db = new PrismaClient();

// Default plan catalogue; create-only so admin edits survive restarts.
const plans = [
  ["starter", "Starter", 5000, 5, 500, 3, 14],
  ["professional", "Professional", 15000, null, null, 10, 0],
  ["enterprise", "Enterprise", 0, null, null, null, 0],
];
for (const [planType, name, priceMonthly, jobsLimit, candidateSearchLimit, teamMembersLimit, trialDays] of plans) {
  await db.plan.upsert({
    where: { planType },
    update: {},
    create: { planType, name, priceMonthly, jobsLimit, candidateSearchLimit, teamMembersLimit, trialDays },
  });
}

for (const [role, name, email, password] of accounts) {
  if (!email || !password) continue;
  await db.user.upsert({
    where: { email },
    update: { passwordHash: hash(password), role, isActive: true, name },
    create: { email, passwordHash: hash(password), name, role, isEmailVerified: true },
  });
  console.log(`seeded ${role}: ${email}`);
}

// ---- Demo data for the seeded recruiter (Priya Rao @ TechCorp) and candidate (Sairam Kumar) ----
// Create-only: anything an admin edits or deletes afterwards is not overwritten, except missing rows are re-added.
const recruiterUser = process.env.SEED_RECRUITER_EMAIL && (await db.user.findUnique({ where: { email: process.env.SEED_RECRUITER_EMAIL } }));
const candidateUser = process.env.SEED_CANDIDATE_EMAIL && (await db.user.findUnique({ where: { email: process.env.SEED_CANDIDATE_EMAIL } }));

if (recruiterUser) {
  const company = await db.company.upsert({
    where: { name: "TechCorp" },
    update: {},
    create: { name: "TechCorp", website: "www.techcorp.in", industry: "Technology / SaaS", location: "Hyderabad, India", hqCountry: "India", description: "TechCorp builds the billing and subscription platform used by over 3,000 Indian SaaS businesses." },
  });
  const rec = await db.recruiter.upsert({
    where: { userId: recruiterUser.id },
    update: {},
    create: { userId: recruiterUser.id, companyId: company.id, isCompanyAdmin: true, hiringRole: "Head of Talent", department: "People" },
  });
  const planStarter = await db.plan.findUnique({ where: { planType: "starter" } });
  await db.subscription.upsert({
    where: { recruiterId: rec.id },
    update: {},
    create: { recruiterId: rec.id, planType: "starter", status: "active", priceMonthly: planStarter?.priceMonthly ?? 5000, jobsLimit: 5, candidateSearchLimit: 500, teamMembersLimit: 3 },
  });

  const resp = ["Design and build scalable Python services", "Lead code reviews and mentor junior developers", "Collaborate with product and design teams", "Improve CI/CD pipelines and test coverage"];
  const jobs = [
    ["Senior Python Engineer", "senior", 5, 2000000, 3000000, ["Python", "AWS", "PostgreSQL", "Django", "Leadership"], ["Kubernetes", "Redis"], "2026-09-24", "active", "TechCorp builds the billing and subscription platform used by over 3,000 Indian SaaS businesses. We are looking for a Senior Python Engineer to own core services on our payments team, from API design through production reliability."],
    ["DevOps Engineer", "mid", 3, 1500000, 2400000, ["AWS", "Terraform", "Kubernetes"], ["Python", "Go"], "2026-09-19", "active", "Own our cloud infrastructure, CI/CD and on-call reliability."],
    ["Product Designer", "mid", 3, 1400000, 2200000, ["Figma", "UX Research", "Design Systems"], ["Prototyping"], "2026-09-15", "active", "Design the billing and subscription experience used by thousands of SaaS finance teams."],
    ["Engineering Manager", "lead", 8, 4000000, 5500000, ["Leadership", "System Design", "Hiring"], ["Python"], "2026-09-10", "active", "Lead a team of eight engineers on the payments platform."],
    ["Data Analyst", "junior", 2, 800000, 1400000, ["SQL", "Python", "Excel"], ["Tableau"], "2026-09-02", "active", "Turn product and billing data into decisions for the leadership team."],
    ["QA Automation Engineer", "mid", 3, 1200000, 1800000, ["Selenium", "Python", "CI/CD"], ["API Testing"], "2026-08-21", "closed", "Build and maintain automated regression suites."],
  ];
  const jobRows = [];
  for (const [title, experienceLevel, years, salaryMin, salaryMax, req, nice, posted, status, description] of jobs) {
    let job = await db.job.findFirst({ where: { recruiterId: rec.id, title } });
    job ??= await db.job.create({
      data: {
        recruiterId: rec.id, title, description, category: "Software Development", experienceLevel, jobType: "full_time", location: "Hyderabad", isRemote: false,
        salaryMin, salaryMax, isSalaryVisible: true, status, requiredSkills: req, niceToHaveSkills: nice, yearsOfExperienceRequired: years,
        responsibilities: resp, companyBenefits: ["Health Insurance", "Flexible Schedule"], educationLevel: "Bachelor's Degree",
        postedAt: new Date(posted), closedAt: status === "closed" ? new Date("2026-09-20") : null,
      },
    });
    jobRows.push(job);
  }

  // Mock applicants (cannot log in: no password).
  const names = ["Ananya Iyer", "Rohit Menon", "Vikram Singh", "Meera Pillai", "Arjun Reddy", "Kavya Nair", "Neha Gupta", "Karthik Rao", "Divya Sharma", "Imran Khan", "Pooja Desai", "Sandeep Joshi"];
  const applicants = [];
  for (const [i, name] of names.entries()) {
    const email = `${name.toLowerCase().replace(/ /g, ".")}@example.com`;
    const u = await db.user.upsert({ where: { email }, update: {}, create: { email, name, role: "candidate", isEmailVerified: true, candidate: { create: { headline: "Software professional" } } }, include: { candidate: true } });
    applicants.push(u.candidate ?? (await db.candidate.upsert({ where: { userId: u.id }, update: {}, create: { userId: u.id } })));
  }
  const counts = [12, 9, 7, 4, 3, 11];
  const statuses = ["applied", "applied", "screening", "screening", "interview", "offer", "hired", "rejected", "applied", "screening", "interview", "applied"];
  for (const [j, job] of jobRows.entries()) {
    for (let k = 0; k < counts[j]; k++) {
      const cand = applicants[(k + j) % applicants.length];
      await db.application.upsert({
        where: { candidateId_jobId: { candidateId: cand.id, jobId: job.id } },
        update: {},
        create: { candidateId: cand.id, jobId: job.id, status: statuses[(k + j) % statuses.length], matchScore: 60 + ((k * 7 + j * 5) % 35), appliedAt: new Date(Date.now() - (k + 1) * 86400_000) },
      });
    }
  }

  // The seeded candidate's own applications.
  if (candidateUser) {
    const me = await db.candidate.upsert({
      where: { userId: candidateUser.id },
      update: {},
      create: { userId: candidateUser.id, headline: "Full Stack Developer | React & Node.js", currentCompany: "TechCorp", currentTitle: "Senior Software Engineer", totalExperienceYears: 5 },
    });
    for (const [i, status] of [[0, "interview"], [1, "applied"]]) {
      await db.application.upsert({
        where: { candidateId_jobId: { candidateId: me.id, jobId: jobRows[i].id } },
        update: {},
        create: { candidateId: me.id, jobId: jobRows[i].id, status, matchScore: i === 0 ? 87 : 78, coverNote: "Excited about this role." },
      });
    }
  }
  console.log("seeded demo data: TechCorp, 6 jobs, mock applicants");
}
await db.$disconnect();
