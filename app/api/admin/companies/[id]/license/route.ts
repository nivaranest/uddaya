import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { LicenseBody, licenseData } from "@/lib/licensing";
import { audit } from "@/lib/audit";

/** Issue or update the company's licence. */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, LicenseBody);
  if ("error" in body) return body.error;
  const owner = await db.recruiter.findFirst({ where: { companyId: params.id }, orderBy: [{ isCompanyAdmin: "desc" }, { createdAt: "asc" }] });
  if (!owner) return NextResponse.json({ error: "Company has no recruiter to hold the licence" }, { status: 404 });
  const data = await licenseData(body.data);
  await db.subscription.upsert({ where: { recruiterId: owner.id }, create: { recruiterId: owner.id, ...data }, update: data });
  await audit(a.session, "license.set", "company", params.id, { plan: data.planType, status: data.status, expiresAt: data.expiresAt });
  return NextResponse.json({ ok: true });
}
