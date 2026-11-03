import { AuditLog } from '../models/AuditLog.js';

export async function logAction({ actorId, role, action, targetEntity, targetId, before = null, after = null, reason = null, ipAddress = null }) {
  try {
    await AuditLog.create({
      actorId,
      userId: actorId,
      role,
      action,
      targetEntity,
      category: targetEntity || 'General',
      targetId,
      before,
      after,
      reason,
      ipAddress
    });
  } catch (err) {
    console.error('[AuditLog] Failed to record audit log:', err.message);
  }
}

