import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const jobs = await db.job.findMany({
    orderBy: { postedAt: "desc" },
    take: 200,
    include: { recruiter: { include: { company: { select: { name: true } }, user: { select: { email: true } } } }, _count: { select: { applications: true } } },
  });
  return NextResponse.json(
    jobs.map((j) => ({ id: j.id, title: j.title, company: j.recruiter.company.name, postedBy: j.recruiter.user.email, status: j.status, removedByAdmin: j.removedByAdmin, applications: j._count.applications, postedAt: j.postedAt })),
  );
}
