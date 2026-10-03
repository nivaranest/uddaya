import { NextResponse } from "next/server";
import { z } from "zod";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { trialLicense } from "@/lib/licensing";

const Body = z.discriminatedUnion("type", [
  z.object({ type: z.literal("candidate"), name: z.string().min(1).max(255), email: z.string().email().max(255), password: z.string().min(8).max(200) }),
  z.object({
    type: z.literal("company"),
    companyName: z.string().min(1).max(255),
    name: z.string().min(1).max(255),
    email: z.string().email().max(255),
    password: z.string().min(8).max(200),
  }),
]);

/** Self-registration. Companies get the trial licence from the plan catalogue (if any); otherwise they start unlicensed. */
export async function POST(req: Request) {
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const b = body.data;
  const email = b.email.toLowerCase();
  if (await db.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  const passwordHash = await hashPassword(b.password);

  if (b.type === "candidate") {
    await db.user.create({ data: { email, name: b.name, role: "candidate", passwordHash, candidate: { create: {} } } });
  } else {
    if (await db.company.findUnique({ where: { name: b.companyName } })) {
      return NextResponse.json({ error: "A company with this name is already registered" }, { status: 409 });
    }
    const trial = await trialLicense();
    await db.company.create({
      data: {
        name: b.companyName,
        recruiters: { create: { isCompanyAdmin: true, user: { create: { email, name: b.name, role: "recruiter", passwordHash } }, ...(trial ? { subscription: { create: trial } } : {}) } },
      },
    });
  }
  return NextResponse.json({ ok: true }, { status: 201 });
}
