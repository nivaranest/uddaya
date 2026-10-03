-- AlterTable
ALTER TABLE "jobs" ADD COLUMN "responsibilities" JSONB,
ADD COLUMN "removed_by_admin" BOOLEAN NOT NULL DEFAULT false;
