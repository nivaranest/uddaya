import { NextResponse } from "next/server";
import { z } from "zod";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "@/lib/session";

const Body = z.object({ email: z.string().email().max(255), password: z.string().min(1).max(200) });

const HOME = { admin: "/admin", recruiter: "/recruiter", candidate: "/dashboard" } as const;

export async function POST(req: Request) {
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const user = await db.user.findUnique({
    where: { email: body.data.email.toLowerCase() },
    include: { recruiter: { include: { company: { select: { isActive: true } } } } },
  });
  const ok = await verifyPassword(body.data.password, user?.passwordHash ?? null);
  if (!user || !ok || !user.isActive || user.deletedAt) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }
  if (user.recruiter && !user.recruiter.company.isActive) {
    return NextResponse.json({ error: "Your company account is suspended. Contact Uddaya support." }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true, role: user.role, redirect: HOME[user.role] });
  res.cookies.set(SESSION_COOKIE, await signSession(user), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}
