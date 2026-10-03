import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireCandidate } from "@/lib/recruiter-ctx";

/** Candidate withdraws their own application. */
export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const c = await requireCandidate();
  if ("error" in c) return c.error;
  const app = await db.application.findUnique({ where: { id: params.id }, include: { candidate: true } });
  if (!app || app.candidate.userId !== c.session.sub) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await db.application.update({ where: { id: app.id }, data: { isWithdrawn: true, withdrawnAt: new Date() } });
  return NextResponse.json({ ok: true });
}
