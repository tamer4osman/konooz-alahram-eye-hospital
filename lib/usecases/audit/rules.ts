import type { AuditEntry } from './ports';

// Pure validation rules for audit entries. Fully unit-testable — no I/O.

export const AUDIT_MODULES = [
  'appointments',
  'attendance',
  'beds',
  'clinical_records',
  'consumables',
  'equipment',
  'invoices',
  'patient_flow',
  'rooms',
  'staff_members',
  'surgeries',
] as const;

export type AuditModule = (typeof AUDIT_MODULES)[number];

export const AUDIT_ACTIONS = ['create', 'update', 'delete'] as const;

export function isAuditAction(value: unknown): value is AuditEntry['action'] {
  return (
    typeof value === 'string' &&
    (AUDIT_ACTIONS as readonly string[]).includes(value)
  );
}

export function isAuditModule(value: string): value is AuditModule {
  return (AUDIT_MODULES as readonly string[]).includes(value);
}
