import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const a = await requireAdmin();
  if ("error" in a) return a.error;
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim();
  const role = sp.get("role");
  const status = sp.get("status");

  const where: Prisma.UserWhereInput = {};
  if (role === "candidate" || role === "recruiter" || role === "admin") where.role = role;
  if (status === "active") Object.assign(where, { isActive: true, deletedAt: null });
  if (status === "suspended") Object.assign(where, { isActive: false, deletedAt: null });
  if (status === "deleted") where.deletedAt = { not: null };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
      { recruiter: { company: { name: { contains: q, mode: "insensitive" } } } },
    ];
  }
  const users = await db.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { recruiter: { include: { company: { select: { name: true } } } } },
  });
  return NextResponse.json(
    users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      company: u.recruiter?.company.name ?? null,
      status: u.deletedAt ? "deleted" : u.isActive ? "active" : "suspended",
      createdAt: u.createdAt,
    })),
  );
}
