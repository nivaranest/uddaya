import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

const Body = z.object({ removed: z.boolean() });

/** Moderation: take a job down (hidden, recruiter can't reopen) or restore it. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  try {
    await db.job.update({ where: { id: params.id }, data: body.data.removed ? { removedByAdmin: true, status: "closed", closedAt: new Date() } : { removedByAdmin: false } });
  } catch {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }
  await audit(a.session, body.data.removed ? "job.takedown" : "job.restore", "job", params.id);
  return NextResponse.json({ ok: true });
}
