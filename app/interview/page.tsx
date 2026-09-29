import type { Metadata } from "next";
import { FEATURED_JOB, getJob } from "@/lib/data";
import { MOCK_INTERVIEW_QUESTIONS } from "@/lib/data";
import { InterviewClient } from "./interview-client";

export const metadata: Metadata = { title: "Mock Interview Prep" };

export default function InterviewPage({ searchParams }: { searchParams: { job?: string } }) {
  const job = (searchParams.job && getJob(searchParams.job)) || FEATURED_JOB;
  // Question generation (PRD §9.2 use case 3) is not wired yet; the prototype set is used for every role.
  return (
    <InterviewClient
      jobId={job.id}
      role={job.title}
      company={job.company}
      questions={MOCK_INTERVIEW_QUESTIONS}
      interviewType="Technical Round"
      difficulty="medium"
    />
  );
}
