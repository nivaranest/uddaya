import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { audit } from "@/lib/audit";

const Body = z.object({ months: z.number().int().min(1).max(60) });

/** Extend the licence by N months from the later of now and the current expiry, and reactivate it. */
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const owner = await db.recruiter.findFirst({
    where: { companyId: params.id, subscription: { isNot: null } },
    include: { subscription: true },
    orderBy: [{ isCompanyAdmin: "desc" }, { createdAt: "asc" }],
  });
  if (!owner?.subscription) return NextResponse.json({ error: "Company has no licence" }, { status: 404 });
  const from = owner.subscription.expiresAt && owner.subscription.expiresAt > new Date() ? owner.subscription.expiresAt : new Date();
  const expiresAt = new Date(from);
  expiresAt.setMonth(expiresAt.getMonth() + body.data.months);
  await db.subscription.update({ where: { id: owner.subscription.id }, data: { expiresAt, status: "active", canceledAt: null } });
  await audit(a.session, "license.renew", "company", params.id, { months: body.data.months, expiresAt });
  return NextResponse.json({ ok: true, expiresAt });
}
