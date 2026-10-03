import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  return NextResponse.json(await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 200 }));
}
