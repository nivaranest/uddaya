import type { Metadata } from "next";
import { listPublicJobs } from "@/lib/jobs";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage({ searchParams }: { searchParams: { q?: string } }) {
  return <DashboardClient initialQuery={searchParams.q ?? ""} liveJobs={await listPublicJobs()} />;
}
