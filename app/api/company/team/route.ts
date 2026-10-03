import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCompanyAdmin } from "@/lib/company-admin";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { effectiveStatus } from "@/lib/licensing";

export async function GET() {
  const c = await requireCompanyAdmin();
  if ("error" in c) return c.error;
  const rs = await db.recruiter.findMany({ where: { companyId: c.me.companyId }, include: { user: true, subscription: true }, orderBy: { createdAt: "asc" } });
  const s = rs.find((r) => r.subscription)?.subscription ?? null;
  return NextResponse.json({
    company: c.me.company.name,
    me: c.session.sub,
    license: s && { planType: s.planType, status: effectiveStatus(s), jobsLimit: s.jobsLimit, candidateSearchLimit: s.candidateSearchLimit, teamMembersLimit: s.teamMembersLimit, expiresAt: s.expiresAt },
    team: rs.map((r) => ({
      userId: r.userId, name: r.user.name, email: r.user.email, isCompanyAdmin: r.isCompanyAdmin, isActive: r.user.isActive, hiringRole: r.hiringRole,
      canPostJobs: r.canPostJobs, canManageApplications: r.canManageApplications, canScheduleInterviews: r.canScheduleInterviews, canSendOffers: r.canSendOffers,
    })),
  });
}

const Body = z.object({ name: z.string().min(1).max(255), email: z.string().email().max(255), password: z.string().min(8).max(200), hiringRole: z.string().max(255).optional() });

export async function POST(req: Request) {
  const c = await requireCompanyAdmin();
  if ("error" in c) return c.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const rs = await db.recruiter.findMany({ where: { companyId: c.me.companyId }, include: { subscription: true } });
  const lic = rs.find((r) => r.subscription)?.subscription;
  if (!lic || effectiveStatus(lic) !== "active") return NextResponse.json({ error: "Your company has no active licence. Contact Uddaya to get one." }, { status: 402 });
  if (lic.teamMembersLimit != null && rs.length >= lic.teamMembersLimit) {
    return NextResponse.json({ error: `Your licence allows ${lic.teamMembersLimit} team members` }, { status: 409 });
  }
  const email = body.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  await db.recruiter.create({
    data: {
      company: { connect: { id: c.me.companyId } },
      hiringRole: body.data.hiringRole,
      user: { create: { email, name: body.data.name, role: "recruiter" as const, passwordHash: await hashPassword(body.data.password), isEmailVerified: true } },
    },
  });
  return NextResponse.json({ ok: true }, { status: 201 });
}
