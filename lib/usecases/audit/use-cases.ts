import type { AuditEntry, AuditWriter } from './ports';
import { isAuditAction, isAuditModule } from './rules';

// Orchestration: append an audit record for a staff mutation.
//
// Policy (deliberate, documented): the audit write happens AFTER the primary
// mutation has committed. If auditing fails, the mutation is still real and
// the caller must not lie about it — so we never throw to the route. A failed
// append is logged loudly server-side instead. Tamper-evidence comes from the
// schema: staff_audit_logs has no update or delete path in the application.

const MAX_FIELD_LENGTH = 200;

function truncate(value: string, max = MAX_FIELD_LENGTH): string {
  return value.length > max ? value.slice(0, max) : value;
}

/**
 * Record a staff mutation. Best-effort by design: invalid input or a failing
 * writer is logged, never propagated — the caller's mutation already succeeded
 * and the response must reflect that truth.
 */
export async function recordStaffMutation(
  writer: AuditWriter,
  entry: AuditEntry,
): Promise<void> {
  if (!isAuditAction(entry.action)) {
    console.error(
      `[audit] rejected invalid action "${String(entry.action)}" for module ${entry.module}`,
    );
    return;
  }
  if (!isAuditModule(entry.module)) {
    console.error(`[audit] rejected unknown module "${entry.module}"`);
    return;
  }
  if (!entry.actorId || !entry.actorEmail) {
    console.error('[audit] rejected entry without actor identity');
    return;
  }

  try {
    await writer.append({
      ...entry,
      actorEmail: truncate(entry.actorEmail),
      module: truncate(entry.module, 50),
      targetId: entry.targetId ? truncate(entry.targetId, 128) : null,
    });
  } catch (err) {
    // Fail-open on audit failure: the mutation already committed; blocking the
    // response would mislead staff into retrying and duplicating clinical data.
    console.error('[audit] failed to persist staff mutation record', err);
  }
}
