import "server-only";
import type { Job as DbJob, Company, Recruiter } from "@prisma/client";
import { db } from "./db";
import { effectiveStatus } from "./licensing";
import { CANDIDATE, type Job as UiJob } from "./data";
import { keywordMatchScore } from "./matching";

const LEVELS = { junior: "0–2 years", mid: "2–5 years", senior: "5+ years", lead: "Lead / Manager" } as const;
const TYPES = { full_time: "Full-time", part_time: "Part-time", contract: "Contract", internship: "Internship" } as const;

type JobWithCompany = DbJob & { recruiter: Recruiter & { company: Company } };
export const withCompany = { recruiter: { include: { company: true } } } as const;

const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : []);

function lpa(n: number) {
  return `₹${+(n / 100000).toFixed(1)}`;
}

function ago(d: Date) {
  const days = Math.floor((Date.now() - d.getTime()) / 86400_000);
  return days <= 0 ? "Posted today" : days === 1 ? "Posted 1 day ago" : `Posted ${days} days ago`;
}

/** Convert a stored job into the shape the candidate UI renders. */
export function toUiJob(j: JobWithCompany): UiJob {
  const req = strs(j.requiredSkills);
  const nice = strs(j.niceToHaveSkills);
  return {
    id: j.id,
    title: j.title,
    company: j.recruiter.company.name,
    location: j.location.split(",")[0],
    workMode: j.isRemote ? "Remote" : undefined,
    salary: j.isSalaryVisible && j.salaryMin && j.salaryMax ? `${lpa(j.salaryMin)}–${lpa(j.salaryMax).slice(1)} LPA` : "Not disclosed",
    match: keywordMatchScore(CANDIDATE.skills, req, nice),
    experience: j.yearsOfExperienceRequired ? `${j.yearsOfExperienceRequired}+ years` : LEVELS[j.experienceLevel],
    jobType: TYPES[j.jobType],
    posted: ago(j.postedAt),
    about: j.description.split(/\n{2,}/).filter(Boolean),
    responsibilities: strs(j.responsibilities),
    requiredSkills: req,
    niceToHave: nice,
    experienceRequired: j.yearsOfExperienceRequired ? `${j.yearsOfExperienceRequired}+ years` : LEVELS[j.experienceLevel],
  };
}

/** Jobs candidates can see: active, not taken down, company active with a live licence. */
export async function listPublicJobs(): Promise<UiJob[]> {
  const rows = await db.job.findMany({ where: { status: "active", removedByAdmin: false, recruiter: { company: { isActive: true } } }, include: withCompany, orderBy: { postedAt: "desc" }, take: 100 });
  const ok: JobWithCompany[] = [];
  for (const j of rows) if (await companyLicenceActive(j.recruiter.companyId)) ok.push(j);
  return ok.map(toUiJob);
}

export async function companyLicence(companyId: string) {
  const r = await db.recruiter.findFirst({ where: { companyId, subscription: { isNot: null } }, include: { subscription: true } });
  return r?.subscription ?? null;
}

export async function companyLicenceActive(companyId: string) {
  const s = await companyLicence(companyId);
  return !!s && effectiveStatus(s) === "active";
}

/** Why this recruiter can't publish (or reopen) a job right now, or null if they can. */
export async function postBlocker(recruiterId: string): Promise<string | null> {
  const r = await db.recruiter.findUnique({ where: { id: recruiterId }, include: { company: true } });
  if (!r) return "Recruiter profile not found";
  if (!r.company.isActive) return "Your company account is suspended";
  if (!r.canPostJobs) return "You don't have permission to post jobs";
  const lic = await companyLicence(r.companyId);
  if (!lic) return "Your company has no licence. Contact Uddaya to get one.";
  const st = effectiveStatus(lic);
  if (st !== "active") return `Your company licence is ${st}`;
  if (lic.jobsLimit != null) {
    const used = await db.job.count({ where: { status: "active", recruiter: { companyId: r.companyId } } });
    if (used >= lic.jobsLimit) return `Your licence allows ${lic.jobsLimit} active jobs. Close one first or ask Uddaya for a higher limit.`;
  }
  return null;
}
