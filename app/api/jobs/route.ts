import { NextResponse } from "next/server";
import { z } from "zod";
import { readBody } from "@/lib/api";
import { db } from "@/lib/db";
import { postBlocker } from "@/lib/jobs";
import { requireRecruiter } from "@/lib/recruiter-ctx";

const Body = z.object({
  title: z.string().min(1).max(255),
  category: z.string().max(255).optional(),
  experienceLevel: z.enum(["junior", "mid", "senior", "lead"]),
  jobType: z.enum(["full_time", "part_time", "contract", "internship"]),
  location: z.string().min(1).max(255),
  isRemote: z.boolean(),
  salaryMin: z.number().int().min(0).nullable().optional(),
  salaryMax: z.number().int().min(0).nullable().optional(),
  isSalaryVisible: z.boolean(),
  description: z.string().min(1).max(10000),
  responsibilities: z.array(z.string().max(500)).max(30),
  benefits: z.array(z.string().max(100)).max(30),
  workSchedule: z.string().max(255).optional(),
  requiredSkills: z.array(z.string().max(60)).min(1).max(30),
  niceToHaveSkills: z.array(z.string().max(60)).max(30),
  yearsOfExperienceRequired: z.number().int().min(0).max(50).nullable().optional(),
  educationLevel: z.string().max(255).optional(),
  aiQuestions: z.array(z.string().max(500)).max(50).optional(),
});

/** Publish a job. Enforces company status, the recruiter's permission and the licence's job-slot limit. */
export async function POST(req: Request) {
  const r = await requireRecruiter();
  if ("error" in r) return r.error;
  const body = await readBody(req, Body);
  if ("error" in body) return body.error;
  const blocker = await postBlocker(r.me.id);
  if (blocker) return NextResponse.json({ error: blocker }, { status: 402 });
  const b = body.data;
  const job = await db.job.create({
    data: {
      recruiterId: r.me.id,
      title: b.title,
      description: b.description,
      category: b.category,
      experienceLevel: b.experienceLevel,
      jobType: b.jobType,
      location: b.location,
      isRemote: b.isRemote,
      salaryMin: b.salaryMin ?? null,
      salaryMax: b.salaryMax ?? null,
      isSalaryVisible: b.isSalaryVisible,
      workSchedule: b.workSchedule,
      companyBenefits: b.benefits,
      responsibilities: b.responsibilities,
      requiredSkills: b.requiredSkills,
      niceToHaveSkills: b.niceToHaveSkills,
      yearsOfExperienceRequired: b.yearsOfExperienceRequired ?? null,
      educationLevel: b.educationLevel,
      aiGeneratedQuestions: b.aiQuestions,
    },
  });
  return NextResponse.json({ id: job.id }, { status: 201 });
}
