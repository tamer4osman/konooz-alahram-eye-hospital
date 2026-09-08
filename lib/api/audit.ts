import type { StaffUser } from '@/lib/auth/guards';
import { prismaAuditWriter } from '@/lib/adapters/prisma/audit-adapter';
import { recordStaffMutation, type AuditEntry } from '@/lib/usecases/audit';

// One-line audit wiring for staff mutation handlers. Call AFTER the mutation
// use case has succeeded and BEFORE returning: the record describes an action
// that actually happened. Never throws — see recordStaffMutation.

export async function auditStaffMutation(
  actor: StaffUser,
  entry: Omit<AuditEntry, 'actorId' | 'actorEmail'>,
): Promise<void> {
  await recordStaffMutation(prismaAuditWriter, {
    ...entry,
    actorId: actor.id,
    actorEmail: actor.email,
  });
}
