import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { audit } from "@/lib/audit";

const Body = z.object({
  isActive: z.boolean().optional(),
  deleted: z.boolean().optional(),
  newPassword: z.string().min(8).max(200).optional(),
});

/** Suspend / reactivate, soft-delete / restore, or reset the password. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const b = body.data;
  if (a.session.sub === params.id && (b.isActive === false || b.deleted)) {
    return NextResponse.json({ error: "You cannot suspend or delete yourself" }, { status: 400 });
  }
  const data: Record<string, unknown> = {};
  if (b.isActive !== undefined) data.isActive = b.isActive;
  if (b.deleted !== undefined) {
    data.deletedAt = b.deleted ? new Date() : null;
    if (b.deleted) data.isActive = false;
    else if (b.isActive === undefined) data.isActive = true;
  }
  if (b.newPassword) data.passwordHash = await hashPassword(b.newPassword);
  try {
    await db.user.update({ where: { id: params.id }, data });
  } catch {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const action = b.newPassword ? "user.reset_password" : b.deleted !== undefined ? (b.deleted ? "user.delete" : "user.restore") : b.isActive ? "user.reactivate" : "user.suspend";
  await audit(a.session, action, "user", params.id);
  return NextResponse.json({ ok: true });
}
