import type { Metadata } from "next";
import { FEATURED_JOB, JOBS } from "@/lib/data";
import { ResumeCheckerClient } from "./resume-checker-client";

export const metadata: Metadata = {
  title: "ATS Resume Checker",
  description: "Check how applicant tracking systems read your resume, and get AI suggestions to fix it.",
};

export default function ResumeCheckerPage({ searchParams }: { searchParams: { job?: string } }) {
  const jobs = [FEATURED_JOB, ...JOBS].map((j) => ({ id: j.id, label: `${j.title} — ${j.company}` }));
  return <ResumeCheckerClient jobs={jobs} initialJobId={searchParams.job ?? ""} />;
}
