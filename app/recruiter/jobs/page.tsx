import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { JobsClient, type JobRow } from "./jobs-client";

export const metadata: Metadata = { title: "My Jobs" };
export const dynamic = "force-dynamic";

export default async function RecruiterJobsPage() {
  const session = await getSession();
  const me = session && (await db.recruiter.findUnique({ where: { userId: session.sub } }));
  const jobs = me
    ? await db.job.findMany({
        where: { recruiter: { companyId: me.companyId } },
        orderBy: { postedAt: "desc" },
        include: { applications: { where: { isWithdrawn: false }, orderBy: { appliedAt: "desc" }, include: { candidate: { include: { user: { select: { name: true, email: true } } } } } } },
      })
    : [];
  const rows: JobRow[] = jobs.map((j) => ({
    id: j.id,
    title: j.title,
    status: j.removedByAdmin ? "removed" : j.status,
    posted: j.postedAt.toISOString(),
    applications: j.applications.map((a) => ({
      id: a.id,
      name: a.candidate.user.name,
      email: a.candidate.user.email,
      status: a.status,
      matchScore: a.matchScore,
      note: a.coverNote,
      appliedAt: a.appliedAt.toISOString(),
    })),
  }));
  return <JobsClient jobs={rows} canManage={!!me?.canManageApplications} />;
}
