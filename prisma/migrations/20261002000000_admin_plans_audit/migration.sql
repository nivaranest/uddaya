-- AlterTable
ALTER TABLE "companies" ADD COLUMN "is_active" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE "plans" (
    "id" UUID NOT NULL,
    "plan_type" "PlanType" NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "price_monthly" INTEGER NOT NULL,
    "jobs_limit" INTEGER,
    "candidate_search_limit" INTEGER,
    "team_members_limit" INTEGER,
    "trial_days" INTEGER NOT NULL DEFAULT 0,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "actor_id" UUID,
    "actor_email" VARCHAR(255) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "target_type" VARCHAR(50) NOT NULL,
    "target_id" VARCHAR(100),
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "plans_plan_type_key" ON "plans"("plan_type");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
