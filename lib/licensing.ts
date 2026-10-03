import "server-only";
import { z } from "zod";
import { db } from "./db";

export const LicenseBody = z.object({
  planType: z.enum(["starter", "professional", "enterprise"]),
  status: z.enum(["active", "canceled", "expired"]).default("active"),
  billingCycle: z.enum(["monthly", "quarterly", "annual"]).default("monthly"),
  priceMonthly: z.number().int().min(0).optional(),
  jobsLimit: z.number().int().min(0).nullable().optional(),
  candidateSearchLimit: z.number().int().min(0).nullable().optional(),
  teamMembersLimit: z.number().int().min(1).nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

/** Licence = the Subscription row of a company's admin recruiter. Unset limits fall back to the plan catalogue. */
export async function licenseData(b: z.infer<typeof LicenseBody>) {
  const d = await db.plan.findUniqueOrThrow({ where: { planType: b.planType } });
  return {
    planType: b.planType,
    status: b.status,
    billingCycle: b.billingCycle,
    priceMonthly: b.priceMonthly ?? d.priceMonthly,
    jobsLimit: b.jobsLimit === undefined ? d.jobsLimit : b.jobsLimit,
    candidateSearchLimit: b.candidateSearchLimit === undefined ? d.candidateSearchLimit : b.candidateSearchLimit,
    teamMembersLimit: b.teamMembersLimit === undefined ? d.teamMembersLimit : b.teamMembersLimit,
    expiresAt: b.expiresAt ? new Date(b.expiresAt) : null,
    canceledAt: b.status === "canceled" ? new Date() : null,
  };
}

/** A licence whose expiry has passed counts as expired even if the stored status is still active. */
export function effectiveStatus(s: { status: string; expiresAt: Date | null }): string {
  return s.status === "active" && s.expiresAt && s.expiresAt < new Date() ? "expired" : s.status;
}

/** Trial licence for self-registered companies, from the plan with trial days (cheapest first). Null if none. */
export async function trialLicense() {
  const plan = await db.plan.findFirst({ where: { trialDays: { gt: 0 } }, orderBy: { priceMonthly: "asc" } });
  if (!plan) return null;
  return {
    planType: plan.planType,
    status: "active" as const,
    priceMonthly: 0,
    jobsLimit: plan.jobsLimit,
    candidateSearchLimit: plan.candidateSearchLimit,
    teamMembersLimit: plan.teamMembersLimit,
    expiresAt: new Date(Date.now() + plan.trialDays * 86400_000),
  };
}
