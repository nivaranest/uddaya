import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ALL_JOB_IDS, CANDIDATE, companyFor, getJob } from "@/lib/data";
import { explainMatch } from "@/lib/matching";
import { JobDetailClient } from "./job-detail-client";

type Props = { params: { id: string } };

export function generateStaticParams() {
  return ALL_JOB_IDS.map((id) => ({ id }));
}

export function generateMetadata({ params }: Props): Metadata {
  const job = getJob(params.id);
  return { title: job ? `${job.title} at ${job.company}` : "Job not found" };
}

export default function JobDetailPage({ params }: Props) {
  const job = getJob(params.id);
  if (!job) notFound();
  const reasons = explainMatch(CANDIDATE.skills, job.requiredSkills, job.niceToHave);
  return (
    <JobDetailClient
      job={job}
      company={companyFor(job.company)}
      reasons={reasons}
      resumes={CANDIDATE.resumes.map((r) => r.name)}
    />
  );
}
