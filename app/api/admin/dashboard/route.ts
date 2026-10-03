import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 86400_000);
  const since = new Date(now.getTime() - 30 * 86400_000);
  const live = { isActive: true, deletedAt: null };

  const [candidates, recruiters, admins, suspended, companies, suspendedCompanies, activeLicences, expiringSoon, expired, unlicensed, recent, jobsActive, jobsTotal, appsTotal, appsMonth] = await Promise.all([
    db.user.count({ where: { role: "candidate", ...live } }),
    db.user.count({ where: { role: "recruiter", ...live } }),
    db.user.count({ where: { role: "admin", ...live } }),
    db.user.count({ where: { OR: [{ isActive: false }, { deletedAt: { not: null } }] } }),
    db.company.count(),
    db.company.count({ where: { isActive: false } }),
    db.subscription.count({ where: { status: "active", OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] } }),
    db.subscription.count({ where: { status: "active", expiresAt: { gt: now, lte: in30 } } }),
    db.subscription.count({ where: { OR: [{ status: "expired" }, { status: "active", expiresAt: { lte: now } }] } }),
    db.company.count({ where: { recruiters: { none: { subscription: { isNot: null } } } } }),
    db.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true, role: true } }),
    db.job.count({ where: { status: "active", removedByAdmin: false } }),
    db.job.count(),
    db.application.count(),
    db.application.count({ where: { appliedAt: { gte: since } } }),
  ]);

  const days: Record<string, { candidates: number; recruiters: number }> = {};
  for (let i = 29; i >= 0; i--) days[new Date(now.getTime() - i * 86400_000).toISOString().slice(0, 10)] = { candidates: 0, recruiters: 0 };
  for (const u of recent) {
    const d = days[u.createdAt.toISOString().slice(0, 10)];
    if (d && u.role === "candidate") d.candidates++;
    else if (d && u.role === "recruiter") d.recruiters++;
  }
  return NextResponse.json({
    users: { candidates, recruiters, admins, suspended, total: candidates + recruiters + admins },
    companies: { total: companies, suspended: suspendedCompanies, unlicensed },
    jobs: { active: jobsActive, total: jobsTotal, applications: appsTotal, applicationsLast30: appsMonth },
    licences: { active: activeLicences, expiringSoon, expired },
    signups: Object.entries(days).map(([date, v]) => ({ date, ...v })),
  });
}
