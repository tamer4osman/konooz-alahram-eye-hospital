// Pure rules for ops housekeeping scripts. Framework-free: no prisma, no
// next/* — the deleteMany where-objects returned here are plain JSON shapes.

export const AUDIT_RETENTION_DAYS_DEFAULT = 730;
export const AUDIT_RETENTION_DAYS_MIN = 30;

export interface ExpiredSessionFilter {
  expiresAt: { lt: Date };
}

// Where-clause matching sessions/patient_sessions whose expiry has already
// passed. Live tokens (expiresAt >= now) are never matched.
export function expiredSessionFilter(now: Date): ExpiredSessionFilter {
  return { expiresAt: { lt: new Date(now.getTime()) } };
}

// Cutoff before which audit rows may be pruned. The minimum exists to stop a
// typo'd env var from silently destroying a young audit trail.
export function auditRetentionCutoff(
  now: Date,
  days: number = AUDIT_RETENTION_DAYS_DEFAULT,
): Date {
  if (!Number.isFinite(days) || days < AUDIT_RETENTION_DAYS_MIN) {
    throw new Error(`audit retention must be a finite number >= ${AUDIT_RETENTION_DAYS_MIN} days`);
  }
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}
