import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CANDIDATE, companyFor, getJob } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { companyLicenceActive, toUiJob, withCompany } from "@/lib/jobs";
import { explainMatch } from "@/lib/matching";
import { JobDetailClient } from "./job-detail-client";

type Props = { params: { id: string } };

// Rendered per request: stored jobs and the "already applied" state depend on the session.
export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const demo = getJob(params.id);
  if (demo) return { title: `${demo.title} at ${demo.company}` };
  const row = UUID.test(params.id) ? await db.job.findUnique({ where: { id: params.id }, include: withCompany }) : null;
  return { title: row ? `${row.title} at ${row.recruiter.company.name}` : "Job not found" };
}

export default async function JobDetailPage({ params }: Props) {
  let job = getJob(params.id);
  let real = false;
  let alreadyApplied = false;
  if (!job && UUID.test(params.id)) {
    const row = await db.job.findUnique({ where: { id: params.id }, include: withCompany });
    if (row && !row.removedByAdmin && row.recruiter.company.isActive && (await companyLicenceActive(row.recruiter.companyId))) {
      job = toUiJob(row);
      real = true;
      const session = await getSession();
      if (session) {
        alreadyApplied = !!(await db.application.findFirst({ where: { jobId: row.id, isWithdrawn: false, candidate: { userId: session.sub } } }));
      }
    }
  }
  if (!job) notFound();
  const reasons = explainMatch(CANDIDATE.skills, job.requiredSkills, job.niceToHave);
  return (
    <JobDetailClient
      job={job}
      company={companyFor(job.company)}
      reasons={reasons}
      resumes={CANDIDATE.resumes.map((r) => r.name)}
      real={real}
      alreadyApplied={alreadyApplied}
    />
  );
}
