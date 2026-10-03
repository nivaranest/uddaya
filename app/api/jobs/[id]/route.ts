import { NextResponse } from "next/server";
import { z } from "zod";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { postBlocker } from "@/lib/jobs";
import { requireRecruiter } from "@/lib/recruiter-ctx";

const Body = z.object({ status: z.enum(["active", "closed", "filled"]) });

/** Close, reopen or mark a job filled. Reopening re-checks the licence. */
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const r = await requireRecruiter();
  if ("error" in r) return r.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const job = await db.job.findUnique({ where: { id: params.id }, include: { recruiter: true } });
  if (!job || job.recruiter.companyId !== r.me.companyId) return NextResponse.json({ error: "Job not found" }, { status: 404 });
  if (job.removedByAdmin) return NextResponse.json({ error: "This job was taken down by Uddaya" }, { status: 403 });
  if (body.data.status === "active" && job.status !== "active") {
    const blocker = await postBlocker(r.me.id);
    if (blocker) return NextResponse.json({ error: blocker }, { status: 402 });
  }
  await db.job.update({ where: { id: job.id }, data: { status: body.data.status, closedAt: body.data.status === "active" ? null : new Date() } });
  return NextResponse.json({ ok: true });
}
