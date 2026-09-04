import { describe, it, expect } from 'vitest';
import { hasModuleAccess, ROLE_PRESETS, DASHBOARD_MODULES } from '@/lib/permissions';

describe('hasModuleAccess', () => {
  it('ADMIN always has full access regardless of permissions', () => {
    expect(hasModuleAccess('ADMIN', null, 'overview')).toBe(true);
    expect(hasModuleAccess('ADMIN', null, 'billing', 'write')).toBe(true);
    expect(hasModuleAccess('ADMIN', {}, 'analytics', 'write')).toBe(true);
  });

  it('STAFF with no permissions has no access', () => {
    expect(hasModuleAccess('STAFF', null, 'overview')).toBe(false);
    expect(hasModuleAccess('STAFF', {}, 'overview')).toBe(false);
  });

  it('STAFF with read permission satisfies read requirement', () => {
    const perms = { overview: 'read' as const };
    expect(hasModuleAccess('STAFF', perms, 'overview', 'read')).toBe(true);
  });

  it('STAFF with read permission does NOT satisfy write requirement', () => {
    const perms = { overview: 'read' as const };
    expect(hasModuleAccess('STAFF', perms, 'overview', 'write')).toBe(false);
  });

  it('STAFF with write permission satisfies both read and write', () => {
    const perms = { billing: 'write' as const };
    expect(hasModuleAccess('STAFF', perms, 'billing', 'read')).toBe(true);
    expect(hasModuleAccess('STAFF', perms, 'billing', 'write')).toBe(true);
  });

  it('STAFF permission on one module does not grant access to another', () => {
    const perms = { overview: 'write' as const };
    expect(hasModuleAccess('STAFF', perms, 'billing')).toBe(false);
  });

  it('multiple module permissions work independently', () => {
    const perms = {
      overview: 'read' as const,
      billing: 'write' as const,
      clinical: 'read' as const,
    };
    expect(hasModuleAccess('STAFF', perms, 'overview')).toBe(true);
    expect(hasModuleAccess('STAFF', perms, 'billing', 'write')).toBe(true);
    expect(hasModuleAccess('STAFF', perms, 'clinical')).toBe(true);
    expect(hasModuleAccess('STAFF', perms, 'surgeries')).toBe(false);
  });
});

describe('ROLE_PRESETS', () => {
  it('manager preset grants write on all modules', () => {
    const manager = ROLE_PRESETS.manager;
    for (const mod of DASHBOARD_MODULES) {
      expect(manager[mod]).toBe('write');
    }
  });

  it('clinician preset grants read+write on clinical/surgeries only', () => {
    const clinician = ROLE_PRESETS.clinician;
    expect(clinician.clinical).toBe('write');
    expect(clinician.surgeries).toBe('read');
    expect(clinician.overview).toBe('read');
    expect(clinician.billing).toBeUndefined();
  });

  it('receptionist preset has no billing access', () => {
    const receptionist = ROLE_PRESETS.receptionist;
    expect(receptionist.billing).toBeUndefined();
    expect(receptionist.overview).toBe('read');
  });

  it('appointments module is registered in the dashboard', () => {
    expect(DASHBOARD_MODULES).toContain('appointments');
  });

  it('receptionist preset can record appointment statuses', () => {
    const receptionist = ROLE_PRESETS.receptionist;
    expect(receptionist.appointments).toBe('write');
  });

  it('accountant preset has billing write only', () => {
    const accountant = ROLE_PRESETS.accountant;
    expect(accountant.billing).toBe('write');
    expect(accountant.overview).toBe('read');
    expect(accountant.clinical).toBeUndefined();
  });
});
