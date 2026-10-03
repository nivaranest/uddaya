import { NextResponse } from "next/server";
import { z } from "zod";
import { requireCompanyAdmin } from "@/lib/company-admin";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { PermissionsBody } from "@/lib/team";

const Body = PermissionsBody.extend({ isActive: z.boolean().optional() });

/** Company admin edits a team member's permissions or disables/enables them. */
export async function PATCH(req: Request, { params }: { params: { userId: string } }) {
  const c = await requireCompanyAdmin();
  if ("error" in c) return c.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const target = await db.recruiter.findUnique({ where: { userId: params.userId } });
  if (!target || target.companyId !== c.me.companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (target.isCompanyAdmin && body.data.isActive === false) return NextResponse.json({ error: "The company admin cannot be disabled" }, { status: 400 });
  const { isActive, ...perms } = body.data;
  await db.recruiter.update({ where: { id: target.id }, data: perms });
  if (isActive !== undefined) await db.user.update({ where: { id: params.userId }, data: { isActive } });
  return NextResponse.json({ ok: true });
}
