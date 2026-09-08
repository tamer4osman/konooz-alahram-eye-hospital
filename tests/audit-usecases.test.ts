import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  AUDIT_ACTIONS,
  AUDIT_MODULES,
  isAuditAction,
  isAuditModule,
} from '@/lib/usecases/audit/rules';
import { recordStaffMutation } from '@/lib/usecases/audit/use-cases';
import type { AuditEntry, AuditWriter } from '@/lib/usecases/audit/ports';

describe('audit rules', () => {
  it('action whitelist contains exactly create/update/delete', () => {
    expect(AUDIT_ACTIONS).toEqual(['create', 'update', 'delete']);
    expect(isAuditAction('create')).toBe(true);
    expect(isAuditAction('patch')).toBe(false);
    expect(isAuditAction('')).toBe(false);
    expect(isAuditAction(null)).toBe(false);
  });

  it('module whitelist covers every wired staff module', () => {
    expect(AUDIT_MODULES).toContain('clinical_records');
    expect(AUDIT_MODULES).toContain('invoices');
    expect(AUDIT_MODULES).toContain('staff_members');
    expect(isAuditModule('rooms')).toBe(true);
    expect(isAuditModule('fake_module')).toBe(false);
  });
});

describe('recordStaffMutation', () => {
  const baseEntry: AuditEntry = {
    actorId: 'user_1',
    actorEmail: 'staff@konooz.test',
    action: 'create',
    module: 'invoices',
    targetId: 'inv_123',
  };

  function stubWriter() {
    const appended: AuditEntry[] = [];
    const writer: AuditWriter = {
      append: async (entry) => {
        appended.push(entry);
      },
    };
    return { appended, writer };
  }

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('appends a valid entry with targetId', async () => {
    const { appended, writer } = stubWriter();
    await recordStaffMutation(writer, baseEntry);
    expect(appended).toHaveLength(1);
    expect(appended[0]).toMatchObject({
      actorId: 'user_1',
      action: 'create',
      module: 'invoices',
      targetId: 'inv_123',
    });
  });

  it('normalizes missing targetId to null', async () => {
    const { appended, writer } = stubWriter();
    await recordStaffMutation(writer, { ...baseEntry, targetId: undefined });
    expect(appended[0].targetId).toBeNull();
  });

  it('rejects invalid action without touching the writer', async () => {
    const { appended, writer } = stubWriter();
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await recordStaffMutation(writer, { ...baseEntry, action: 'nuke' as AuditEntry['action'] });
    expect(appended).toHaveLength(0);
    expect(errSpy).toHaveBeenCalledOnce();
  });

  it('rejects unknown module without touching the writer', async () => {
    const { appended, writer } = stubWriter();
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await recordStaffMutation(writer, { ...baseEntry, module: 'payroll' });
    expect(appended).toHaveLength(0);
    expect(errSpy).toHaveBeenCalledOnce();
  });

  it('rejects entries without actor identity', async () => {
    const { appended, writer } = stubWriter();
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await recordStaffMutation(writer, { ...baseEntry, actorId: '', actorEmail: '' });
    expect(appended).toHaveLength(0);
    expect(errSpy).toHaveBeenCalledOnce();
  });

  it('truncates oversized actorEmail and targetId', async () => {
    const { appended, writer } = stubWriter();
    await recordStaffMutation(writer, {
      ...baseEntry,
      actorEmail: `x@${'y'.repeat(300)}.com`,
      targetId: 't'.repeat(500),
    });
    expect(appended[0].actorEmail.length).toBeLessThanOrEqual(200);
    expect(appended[0].targetId?.length).toBeLessThanOrEqual(128);
  });

  it('never throws when the writer fails (mutation already committed)', async () => {
    const failingWriter: AuditWriter = {
      append: async () => {
        throw new Error('db gone');
      },
    };
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await expect(
      recordStaffMutation(failingWriter, baseEntry),
    ).resolves.toBeUndefined();
    expect(errSpy).toHaveBeenCalledOnce();
  });
});
