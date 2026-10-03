import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

const Body = z.object({
  name: z.string().min(1).max(255).optional(),
  website: z.string().max(255).nullable().optional(),
  industry: z.string().max(255).nullable().optional(),
  isActive: z.boolean().optional(),
});

/** Edit details, or suspend/reactivate (suspended companies' recruiters cannot log in). */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  try {
    await db.company.update({ where: { id: params.id }, data: body.data });
  } catch {
    return NextResponse.json({ error: "Company not found or name already taken" }, { status: 409 });
  }
  await audit(a.session, body.data.isActive === undefined ? "company.update" : body.data.isActive ? "company.reactivate" : "company.suspend", "company", params.id, body.data);
  return NextResponse.json({ ok: true });
}

/** Delete the company and soft-delete its recruiter accounts. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const c = await db.company.findUnique({ where: { id: params.id }, include: { recruiters: true } });
  if (!c) return NextResponse.json({ error: "Company not found" }, { status: 404 });
  await db.user.updateMany({ where: { id: { in: c.recruiters.map((r) => r.userId) } }, data: { isActive: false, deletedAt: new Date() } });
  await db.company.delete({ where: { id: c.id } });
  await audit(a.session, "company.delete", "company", c.id, { name: c.name });
  return NextResponse.json({ ok: true });
}
