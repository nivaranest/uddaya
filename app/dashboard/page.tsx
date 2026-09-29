import type { Metadata } from "next";
import { DashboardClient } from "./dashboard-client";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage({ searchParams }: { searchParams: { q?: string } }) {
  return <DashboardClient initialQuery={searchParams.q ?? ""} />;
}
