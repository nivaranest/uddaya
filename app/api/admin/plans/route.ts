import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

export async function GET() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  return NextResponse.json(await db.plan.findMany({ orderBy: { priceMonthly: "asc" } }));
}

const Body = z.object({
  planType: z.enum(["starter", "professional", "enterprise"]),
  name: z.string().min(1).max(100),
  priceMonthly: z.number().int().min(0),
  jobsLimit: z.number().int().min(0).nullable(),
  candidateSearchLimit: z.number().int().min(0).nullable(),
  teamMembersLimit: z.number().int().min(1).nullable(),
  trialDays: z.number().int().min(0).max(365),
});

/** Edit a plan's defaults. Applies to licences issued or trials started from now on; existing licences keep their values. */
export async function PUT(req: Request) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const { planType, ...data } = body.data;
  await db.plan.update({ where: { planType }, data });
  await audit(a.session, "plan.update", "plan", planType, data);
  return NextResponse.json({ ok: true });
}
