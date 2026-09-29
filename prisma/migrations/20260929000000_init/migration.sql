-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('candidate', 'recruiter', 'admin');

-- CreateEnum
CREATE TYPE "Proficiency" AS ENUM ('beginner', 'intermediate', 'advanced', 'expert');

-- CreateEnum
CREATE TYPE "CompanySize" AS ENUM ('1-50', '51-200', '201-1000', '1000+');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('starter', 'professional', 'enterprise');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'canceled', 'expired');

-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('monthly', 'quarterly', 'annual');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('junior', 'mid', 'senior', 'lead');

-- CreateEnum
CREATE TYPE "JobType" AS ENUM ('full-time', 'part-time', 'contract', 'internship');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('draft', 'active', 'closed', 'filled');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('applied', 'screening', 'interview', 'offer', 'hired', 'rejected');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('new_job_match', 'application_update', 'message');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('technical', 'hr', 'behavioral', 'final');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('scheduled', 'completed', 'rescheduled', 'cancelled');

-- CreateEnum
CREATE TYPE "OfferStatus" AS ENUM ('draft', 'sent', 'accepted', 'declined', 'expired');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'success', 'failed', 'refunded');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255),
    "name" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL,
    "phone" VARCHAR(20),
    "location" VARCHAR(255),
    "profile_image_url" TEXT,
    "linkedin_id" VARCHAR(255),
    "linkedin_data" JSONB,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "headline" VARCHAR(255),
    "bio" TEXT,
    "total_experience_years" INTEGER,
    "current_company" VARCHAR(255),
    "current_title" VARCHAR(255),
    "salary_expectation_min" INTEGER,
    "salary_expectation_max" INTEGER,
    "notice_period" VARCHAR(50),
    "availability" VARCHAR(50),
    "preferred_locations" JSONB,
    "willing_to_relocate" BOOLEAN NOT NULL DEFAULT false,
    "profile_completion_score" INTEGER NOT NULL DEFAULT 0,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "is_public" BOOLEAN NOT NULL DEFAULT true,
    "open_to_recruiter_contact" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_skills" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "skill_name" VARCHAR(255) NOT NULL,
    "proficiency_level" "Proficiency" NOT NULL DEFAULT 'intermediate',
    "years_of_experience" INTEGER,
    "endorsement_count" INTEGER NOT NULL DEFAULT 0,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidate_skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_experience" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "company" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "candidate_experience_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidate_education" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "school" VARCHAR(255) NOT NULL,
    "degree" VARCHAR(255),
    "field" VARCHAR(255),
    "year" INTEGER,

    CONSTRAINT "candidate_education_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "certifications" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "issuer" VARCHAR(255),
    "issued_at" DATE,
    "credential_id" VARCHAR(255),
    "credential_url" TEXT,

    CONSTRAINT "certifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "website" VARCHAR(255),
    "industry" VARCHAR(255),
    "company_size" "CompanySize" NOT NULL DEFAULT '51-200',
    "logo_url" TEXT,
    "description" TEXT,
    "location" VARCHAR(255),
    "hq_country" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recruiters" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "is_company_admin" BOOLEAN NOT NULL DEFAULT false,
    "hiring_role" VARCHAR(255),
    "department" VARCHAR(255),
    "can_post_jobs" BOOLEAN NOT NULL DEFAULT true,
    "can_manage_applications" BOOLEAN NOT NULL DEFAULT true,
    "can_schedule_interviews" BOOLEAN NOT NULL DEFAULT true,
    "can_send_offers" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recruiters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" UUID NOT NULL,
    "recruiter_id" UUID NOT NULL,
    "plan_type" "PlanType" NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'active',
    "price_monthly" INTEGER NOT NULL,
    "billing_cycle" "BillingCycle" NOT NULL DEFAULT 'monthly',
    "jobs_limit" INTEGER,
    "candidate_search_limit" INTEGER,
    "team_members_limit" INTEGER,
    "is_auto_renew" BOOLEAN NOT NULL DEFAULT true,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jobs" (
    "id" UUID NOT NULL,
    "recruiter_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "category" VARCHAR(255),
    "experience_level" "ExperienceLevel" NOT NULL,
    "job_type" "JobType" NOT NULL DEFAULT 'full-time',
    "location" VARCHAR(255) NOT NULL,
    "is_remote" BOOLEAN NOT NULL DEFAULT false,
    "salary_min" INTEGER,
    "salary_max" INTEGER,
    "salary_currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "is_salary_visible" BOOLEAN NOT NULL DEFAULT false,
    "status" "JobStatus" NOT NULL DEFAULT 'active',
    "work_schedule" VARCHAR(255),
    "company_benefits" JSONB,
    "required_skills" JSONB NOT NULL,
    "nice_to_have_skills" JSONB,
    "years_of_experience_required" INTEGER,
    "education_level" VARCHAR(255),
    "ai_generated_description" TEXT,
    "ai_generated_questions" JSONB,
    "posted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_size" INTEGER,
    "file_name" VARCHAR(255),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "parsed_data" JSONB,
    "extracted_skills" JSONB,
    "extracted_experience" JSONB,
    "extracted_education" JSONB,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'applied',
    "applied_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "match_score" INTEGER,
    "match_explanation" TEXT,
    "resume_id" UUID,
    "cover_note" TEXT,
    "is_withdrawn" BOOLEAN NOT NULL DEFAULT false,
    "withdrawn_at" TIMESTAMP(3),
    "last_status_update" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "alert_type" "AlertType" NOT NULL DEFAULT 'new_job_match',
    "match_score" INTEGER,
    "message" TEXT,
    "is_sent" BOOLEAN NOT NULL DEFAULT false,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "receiver_id" UUID NOT NULL,
    "job_id" UUID,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interviews" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "interview_type" "InterviewType" NOT NULL DEFAULT 'technical',
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "conducted_at" TIMESTAMP(3),
    "interviewer_id" UUID,
    "video_link" TEXT,
    "notes" TEXT,
    "feedback_score" INTEGER,
    "feedback_text" TEXT,
    "status" "InterviewStatus" NOT NULL DEFAULT 'scheduled',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offers" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "position" VARCHAR(255) NOT NULL,
    "salary_annual" INTEGER NOT NULL,
    "joining_date" DATE NOT NULL,
    "benefits" JSONB,
    "terms_and_conditions" TEXT,
    "offer_letter_url" TEXT,
    "status" "OfferStatus" NOT NULL DEFAULT 'draft',
    "sent_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "declined_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_jobs" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "job_id" UUID NOT NULL,
    "list_name" VARCHAR(255),
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "live_counters" (
    "id" UUID NOT NULL,
    "counter_type" VARCHAR(50) NOT NULL,
    "current_count" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "live_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mock_interviews" (
    "id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "job_id" UUID,
    "role_type" VARCHAR(255) NOT NULL,
    "difficulty_level" "Difficulty" NOT NULL DEFAULT 'medium',
    "duration_minutes" INTEGER NOT NULL DEFAULT 15,
    "score_overall" DECIMAL(3,1),
    "score_clarity" DECIMAL(3,1),
    "score_technical" DECIMAL(3,1),
    "score_communication" DECIMAL(3,1),
    "feedback" TEXT,
    "transcript_url" TEXT,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mock_interviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "subscription_id" UUID NOT NULL,
    "razorpay_payment_id" VARCHAR(255),
    "amount" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "payment_method" VARCHAR(255),
    "invoice_url" TEXT,
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_linkedin_id_key" ON "users"("linkedin_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidates_user_id_key" ON "candidates"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "candidate_skills_candidate_id_skill_name_key" ON "candidate_skills"("candidate_id", "skill_name");

-- CreateIndex
CREATE INDEX "candidate_experience_candidate_id_idx" ON "candidate_experience"("candidate_id");

-- CreateIndex
CREATE INDEX "candidate_education_candidate_id_idx" ON "candidate_education"("candidate_id");

-- CreateIndex
CREATE INDEX "certifications_candidate_id_idx" ON "certifications"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "companies_name_key" ON "companies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "recruiters_user_id_key" ON "recruiters"("user_id");

-- CreateIndex
CREATE INDEX "recruiters_company_id_idx" ON "recruiters"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_recruiter_id_key" ON "subscriptions"("recruiter_id");

-- CreateIndex
CREATE INDEX "jobs_recruiter_id_idx" ON "jobs"("recruiter_id");

-- CreateIndex
CREATE INDEX "jobs_status_idx" ON "jobs"("status");

-- CreateIndex
CREATE INDEX "resumes_candidate_id_idx" ON "resumes"("candidate_id");

-- CreateIndex
CREATE INDEX "applications_job_id_idx" ON "applications"("job_id");

-- CreateIndex
CREATE INDEX "applications_status_idx" ON "applications"("status");

-- CreateIndex
CREATE UNIQUE INDEX "applications_candidate_id_job_id_key" ON "applications"("candidate_id", "job_id");

-- CreateIndex
CREATE INDEX "alerts_candidate_id_idx" ON "alerts"("candidate_id");

-- CreateIndex
CREATE INDEX "alerts_created_at_idx" ON "alerts"("created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_receiver_id_idx" ON "messages"("receiver_id");

-- CreateIndex
CREATE INDEX "interviews_application_id_idx" ON "interviews"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "offers_application_id_key" ON "offers"("application_id");

-- CreateIndex
CREATE UNIQUE INDEX "saved_jobs_candidate_id_job_id_key" ON "saved_jobs"("candidate_id", "job_id");

-- CreateIndex
CREATE UNIQUE INDEX "live_counters_counter_type_key" ON "live_counters"("counter_type");

-- CreateIndex
CREATE INDEX "mock_interviews_candidate_id_idx" ON "mock_interviews"("candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_razorpay_payment_id_key" ON "payments"("razorpay_payment_id");

-- CreateIndex
CREATE INDEX "payments_subscription_id_idx" ON "payments"("subscription_id");

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_skills" ADD CONSTRAINT "candidate_skills_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_experience" ADD CONSTRAINT "candidate_experience_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidate_education" ADD CONSTRAINT "candidate_education_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "certifications" ADD CONSTRAINT "certifications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recruiters" ADD CONSTRAINT "recruiters_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "recruiters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_recruiter_id_fkey" FOREIGN KEY ("recruiter_id") REFERENCES "recruiters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interviews" ADD CONSTRAINT "interviews_interviewer_id_fkey" FOREIGN KEY ("interviewer_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offers" ADD CONSTRAINT "offers_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_jobs" ADD CONSTRAINT "saved_jobs_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mock_interviews" ADD CONSTRAINT "mock_interviews_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "subscriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Full-text search (PRD §7.2). The PRD's version calls array_to_string() on a
-- JSONB column, which PostgreSQL rejects; flatten the JSONB skills array instead.
CREATE OR REPLACE FUNCTION jsonb_text_array_to_string(j jsonb) RETURNS text
  LANGUAGE sql IMMUTABLE AS $$ SELECT coalesce(string_agg(x, ' '), '') FROM jsonb_array_elements_text(j) AS x $$;

CREATE INDEX "idx_jobs_search" ON "jobs" USING GIN (
  to_tsvector('english', "title" || ' ' || "description" || ' ' || jsonb_text_array_to_string("required_skills"))
);
CREATE INDEX "idx_candidates_search" ON "candidates" USING GIN (to_tsvector('english', coalesce("bio", '')));
