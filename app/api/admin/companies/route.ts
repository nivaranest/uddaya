import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { LicenseBody, effectiveStatus, licenseData } from "@/lib/licensing";
import { audit } from "@/lib/audit";

export async function GET() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const companies = await db.company.findMany({
    orderBy: { createdAt: "desc" },
    include: { recruiters: { include: { user: true, subscription: true }, orderBy: { createdAt: "asc" } } },
  });
  return NextResponse.json(
    companies.map((c) => {
      const owner = c.recruiters.find((r) => r.isCompanyAdmin) ?? c.recruiters[0];
      const s = owner?.subscription;
      return {
        id: c.id,
        isActive: c.isActive,
        name: c.name,
        website: c.website,
        industry: c.industry,
        createdAt: c.createdAt,
        license: s
          ? { planType: s.planType, status: effectiveStatus(s), jobsLimit: s.jobsLimit, candidateSearchLimit: s.candidateSearchLimit, teamMembersLimit: s.teamMembersLimit, priceMonthly: s.priceMonthly, billingCycle: s.billingCycle, expiresAt: s.expiresAt }
          : null,
        recruiters: c.recruiters.map((r) => ({ userId: r.userId, canPostJobs: r.canPostJobs, canManageApplications: r.canManageApplications, canScheduleInterviews: r.canScheduleInterviews, canSendOffers: r.canSendOffers, name: r.user.name, email: r.user.email, isCompanyAdmin: r.isCompanyAdmin, isActive: r.user.isActive })),
      };
    }),
  );
}

const Body = z.object({
  name: z.string().min(1).max(255),
  website: z.string().max(255).optional(),
  industry: z.string().max(255).optional(),
  adminName: z.string().min(1).max(255),
  adminEmail: z.string().email().max(255),
  adminPassword: z.string().min(8).max(200),
  license: LicenseBody.optional(),
});

export async function POST(req: Request) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const b = body.data;
  const email = b.adminEmail.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  if (await db.company.findUnique({ where: { name: b.name } })) return NextResponse.json({ error: "Company already exists" }, { status: 409 });

  const passwordHash = await hashPassword(b.adminPassword);
  const company = await db.company.create({
    data: {
      name: b.name,
      website: b.website,
      industry: b.industry,
      recruiters: {
        create: {
          isCompanyAdmin: true,
          user: { create: { email, name: b.adminName, role: "recruiter", passwordHash, isEmailVerified: true } },
          ...(b.license ? { subscription: { create: await licenseData(b.license) } } : {}),
        },
      },
    },
  });
  await audit(a.session, "company.create", "company", company.id, { name: b.name, plan: b.license?.planType ?? null });
  return NextResponse.json({ id: company.id }, { status: 201 });
}
