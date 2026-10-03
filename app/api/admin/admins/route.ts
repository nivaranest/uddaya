import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { audit } from "@/lib/audit";

const Body = z.object({ name: z.string().min(1).max(255), email: z.string().email().max(255), password: z.string().min(8).max(200) });

export async function POST(req: Request) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const email = body.data.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  const u = await db.user.create({ data: { email, name: body.data.name, role: "admin", passwordHash: await hashPassword(body.data.password), isEmailVerified: true } });
  await audit(a.session, "admin.create", "user", u.id, { email });
  return NextResponse.json({ ok: true }, { status: 201 });
}
