import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { companyLicence } from "@/lib/jobs";
import { effectiveStatus } from "@/lib/licensing";
import { RecruiterClient, type Overview } from "./recruiter-client";

export const metadata: Metadata = { title: "Recruiter Dashboard" };
export const dynamic = "force-dynamic";

async function overview(): Promise<Overview | null> {
  const session = await getSession();
  const me = session && (await db.recruiter.findUnique({ where: { userId: session.sub }, include: { company: true, user: true } }));
  if (!me) return null;
  const jobs = await db.job.findMany({
    where: { recruiter: { companyId: me.companyId } },
    orderBy: { postedAt: "desc" },
    include: { _count: { select: { applications: true } } },
  });
  const apps = await db.application.groupBy({ by: ["status"], where: { isWithdrawn: false, job: { recruiter: { companyId: me.companyId } } }, _count: true });
  const n = (s: string) => apps.find((a) => a.status === s)?._count ?? 0;
  const lic = await companyLicence(me.companyId);
  return {
    company: me.company.name,
    name: me.user.name,
    licence: lic ? { status: effectiveStatus(lic), jobsLimit: lic.jobsLimit } : null,
    jobs: jobs.map((j) => ({ id: j.id, title: j.title, apps: j._count.applications, active: j.status === "active", removed: j.removedByAdmin, posted: j.postedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) })),
    totals: { applications: apps.reduce((t, a) => t + a._count, 0), interview: n("interview"), hired: n("hired") },
  };
}

export default async function RecruiterPage() {
  return <RecruiterClient overview={await overview()} />;
}
