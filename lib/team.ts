import "server-only";
import { z } from "zod";

export const PermissionsBody = z.object({
  canPostJobs: z.boolean().optional(),
  canManageApplications: z.boolean().optional(),
  canScheduleInterviews: z.boolean().optional(),
  canSendOffers: z.boolean().optional(),
  hiringRole: z.string().max(255).nullable().optional(),
});
