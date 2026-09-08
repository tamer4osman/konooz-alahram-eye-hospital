import { prisma } from '@/lib/prisma';
import type { AuditEntry, AuditWriter } from '@/lib/usecases/audit';

// Prisma implementation of the audit trail port. staff_audit_logs is
// append-only: create is the only permitted statement here, and no update or
// delete path exists anywhere in the codebase.

export const prismaAuditWriter: AuditWriter = {
  async append(entry: AuditEntry): Promise<void> {
    await prisma.staffAuditLog.create({
      data: {
        actorId: entry.actorId,
        actorEmail: entry.actorEmail,
        action: entry.action,
        module: entry.module,
        targetId: entry.targetId ?? null,
      },
    });
  },
};
