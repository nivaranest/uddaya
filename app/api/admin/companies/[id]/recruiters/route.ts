import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { audit } from "@/lib/audit";

const Body = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().max(255),
  password: z.string().min(8).max(200),
  hiringRole: z.string().max(255).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const company = await db.company.findUnique({ where: { id: params.id }, include: { recruiters: { include: { subscription: true } } } });
  if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

  const limit = company.recruiters.find((r) => r.isCompanyAdmin)?.subscription?.teamMembersLimit;
  if (limit != null && company.recruiters.length >= limit) {
    return NextResponse.json({ error: `Licence allows ${limit} team members` }, { status: 409 });
  }
  const email = body.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email already registered" }, { status: 409 });

  await db.recruiter.create({
    data: {
      company: { connect: { id: company.id } },
      hiringRole: body.data.hiringRole,
      user: { create: { email, name: body.data.name, role: "recruiter" as const, passwordHash: await hashPassword(body.data.password), isEmailVerified: true } },
    },
  });
  await audit(a.session, "recruiter.add", "company", company.id, { email });
  return NextResponse.json({ ok: true }, { status: 201 });
}
