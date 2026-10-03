import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { ApplicationsClient } from "./applications-client";

export const metadata: Metadata = { title: "My Applications" };
export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const session = await getSession();
  const rows = session
    ? await db.application.findMany({
        where: { isWithdrawn: false, candidate: { userId: session.sub } },
        orderBy: { appliedAt: "desc" },
        include: { job: { include: { recruiter: { include: { company: { select: { name: true } } } } } } },
      })
    : [];
  const submitted = rows.map((a) => ({
    id: a.id,
    jobId: a.jobId,
    title: a.job.title,
    company: a.job.recruiter.company.name,
    status: a.status,
    matchScore: a.matchScore,
    appliedAt: a.appliedAt.toISOString().slice(0, 10),
  }));
  return <ApplicationsClient submitted={submitted} />;
}
