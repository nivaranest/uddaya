import "server-only";
import { db } from "./db";
import type { Session } from "./session";

/** Record an admin action. Never throws: auditing must not break the action itself. */
export async function audit(actor: Session, action: string, targetType: string, targetId?: string, details?: Record<string, unknown>) {
  try {
    const u = await db.user.findUnique({ where: { id: actor.sub }, select: { email: true } });
    await db.auditLog.create({
      data: { actorId: actor.sub, actorEmail: u?.email ?? actor.name, action, targetType, targetId, details: details as object | undefined },
    });
  } catch (e) {
    console.error("audit failed", e);
  }
}
