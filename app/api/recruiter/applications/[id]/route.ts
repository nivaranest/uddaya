import { NextResponse } from "next/server";
import { z } from "zod";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { requireRecruiter } from "@/lib/recruiter-ctx";

const Body = z.object({ status: z.enum(["applied", "screening", "interview", "offer", "hired", "rejected"]) });

/** Move an application through the pipeline. Needs the manage-applications permission. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const r = await requireRecruiter();
  if ("error" in r) return r.error;
  if (!r.me.canManageApplications) return NextResponse.json({ error: "You don't have permission to manage applications" }, { status: 403 });
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const app = await db.application.findUnique({ where: { id: params.id }, include: { job: { include: { recruiter: true } } } });
  if (!app || app.job.recruiter.companyId !== r.me.companyId) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.application.update({ where: { id: app.id }, data: { status: body.data.status, lastStatusUpdate: new Date() } });
  return NextResponse.json({ ok: true });
}
