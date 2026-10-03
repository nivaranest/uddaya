import "server-only";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, verifySession, type Session } from "./session";

export async function getSession(): Promise<Session | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

/** For /api/admin handlers (middleware already checks; this is defence in depth). */
export async function requireAdmin(): Promise<{ session: Session } | { error: NextResponse }> {
  const session = await getSession();
  if (!session) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (session.role !== "admin") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { session };
}
