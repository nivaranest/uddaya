import { NextResponse } from "next/server";
import { z } from "zod";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { companyLicenceActive } from "@/lib/jobs";
import { CANDIDATE } from "@/lib/data";
import { keywordMatchScore } from "@/lib/matching";
import { requireCandidate } from "@/lib/recruiter-ctx";

const Body = z.object({ jobId: z.string().uuid(), coverNote: z.string().max(2000).optional() });

export async function POST(req: Request) {
  const c = await requireCandidate();
  if ("error" in c) return c.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const job = await db.job.findUnique({ where: { id: body.data.jobId }, include: { recruiter: { include: { company: true } } } });
  if (!job || job.status !== "active" || job.removedByAdmin || !job.recruiter.company.isActive || !(await companyLicenceActive(job.recruiter.companyId))) {
    return NextResponse.json({ error: "This job is no longer accepting applications" }, { status: 404 });
  }
  const candidate = await db.candidate.upsert({ where: { userId: c.session.sub }, update: {}, create: { userId: c.session.sub } });
  if (await db.application.findUnique({ where: { candidateId_jobId: { candidateId: candidate.id, jobId: job.id } } })) {
    return NextResponse.json({ error: "You have already applied to this job" }, { status: 409 });
  }
  const strs = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
  const app = await db.application.create({
    data: {
      candidateId: candidate.id,
      jobId: job.id,
      coverNote: body.data.coverNote,
      // Placeholder until candidate profiles are stored: scored against the demo persona's skills.
      matchScore: keywordMatchScore(CANDIDATE.skills, strs(job.requiredSkills), strs(job.niceToHaveSkills)),
    },
  });
  return NextResponse.json({ id: app.id }, { status: 201 });
}
