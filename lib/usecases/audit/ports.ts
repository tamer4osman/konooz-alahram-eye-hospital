// Ports (ISP): minimal interfaces for the staff audit trail. Implemented by
// lib/adapters/prisma/audit-adapter.ts. Framework-free — no next/*, no prisma.

/** Append-only writer for staff mutation records. */
export interface AuditWriter {
  append(entry: AuditEntry): Promise<void>;
}

export interface AuditEntry {
  actorId: string;
  actorEmail: string;
  action: 'create' | 'update' | 'delete';
  module: string;
  targetId?: string | null;
}
