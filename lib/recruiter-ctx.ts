import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { db } from "./db";

/** The signed-in recruiter profile (recruiter or admin accounts with a recruiter row). */
export async function requireRecruiter() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const me = await db.recruiter.findUnique({ where: { userId: session.sub }, include: { company: true } });
  if (!me) return { error: NextResponse.json({ error: "No company is linked to your account" }, { status: 403 }) };
  return { session, me };
}

export async function requireCandidate() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.role !== "candidate") return { error: NextResponse.json({ error: "Only candidates can do this" }, { status: 403 }) };
  return { session };
}
