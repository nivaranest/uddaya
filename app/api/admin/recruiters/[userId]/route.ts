import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";
import { PermissionsBody } from "@/lib/team";

const Body = PermissionsBody.extend({ companyId: z.string().uuid().optional(), isCompanyAdmin: z.boolean().optional() });

/** Change a recruiter's permissions, move them to another company, or (un)make them company admin. */
export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const { companyId, ...rest } = body.data;
  const r = await db.recruiter.findUnique({ where: { userId: params.userId }, include: { subscription: true } });
  if (!r) return NextResponse.json({ error: "Recruiter not found" }, { status: 404 });
  if (companyId && companyId !== r.companyId) {
    if (r.subscription) return NextResponse.json({ error: "This recruiter holds the company licence; move the licence first" }, { status: 409 });
    if (!(await db.company.findUnique({ where: { id: companyId } }))) return NextResponse.json({ error: "Target company not found" }, { status: 404 });
  }
  await db.recruiter.update({ where: { id: r.id }, data: { ...rest, ...(companyId ? { companyId, isCompanyAdmin: false } : {}) } });
  await audit(a.session, companyId ? "recruiter.move" : "recruiter.update", "user", params.userId, body.data);
  return NextResponse.json({ ok: true });
}
