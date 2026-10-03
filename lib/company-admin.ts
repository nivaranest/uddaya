import "server-only";
import { NextResponse } from "next/server";
import { getSession } from "./auth";
import { db } from "./db";

/** The signed-in recruiter, if they are their company's admin. */
export async function requireCompanyAdmin() {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const me = await db.recruiter.findUnique({ where: { userId: session.sub }, include: { company: true } });
  if (!me || !me.isCompanyAdmin) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { session, me };
}
