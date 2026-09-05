import { describe, expect, it, vi } from 'vitest';
import {
  registerPatient,
  loginPatient,
  logoutPatient,
  currentPatient,
} from '@/lib/usecases/auth/patient-auth';
import { loginStaff, currentStaff, logoutStaff } from '@/lib/usecases/auth/staff-auth';
import type {
  PatientIdentityStore,
  PatientSessionStore,
  StaffIdentityStore,
  StaffSessionStore,
} from '@/lib/usecases/auth/ports';

function stubStores() {
  const identity: PatientIdentityStore = {
    findByEmail: vi.fn().mockResolvedValue(null),
    createWithProfile: vi.fn().mockResolvedValue({ id: 'acc-1', email: 'a@b.c' }),
  };
  const sessions: PatientSessionStore = {
    create: vi.fn().mockResolvedValue(undefined),
    findValidAccount: vi.fn().mockResolvedValue(null),
    deleteByTokenHash: vi.fn().mockResolvedValue(undefined),
  };
  return { identity, sessions };
}

const crypto = {
  hash: vi.fn().mockResolvedValue('hashed'),
  verify: vi.fn().mockResolvedValue(true),
  newToken: () => 'a'.repeat(43),
};

const clock = {
  hashToken: (t: string) => `h(${t})`,
  now: () => new Date('2026-09-05T10:00:00Z'),
};

describe('registerPatient', () => {
  it('creates the account, starts a session, and logs consent (BCK-026)', async () => {
    const { identity, sessions } = stubStores();
    const auditLog = vi.fn().mockResolvedValue(undefined);
    const result = await registerPatient(
      identity,
      sessions,
      auditLog,
      {
        email: 'A@B.C',
        password: 'longenough8',
        fullNameAr: 'سالم',
        phone: '0912345678',
        gender: 'male',
      },
      crypto,
    );
    expect(result.ok).toBe(true);
    expect(identity.createWithProfile).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.c', gender: 'MALE' }),
    );
    expect(sessions.create).toHaveBeenCalledWith(
      'acc-1',
      expect.any(String),
      expect.any(Date),
    );
    expect(auditLog).toHaveBeenCalledWith('acc-1', 'privacy_policy');
  });

  it('refuses a taken email without creating anything', async () => {
    const { identity, sessions } = stubStores();
    identity.findByEmail = vi
      .fn()
      .mockResolvedValue({ id: 'x', email: 'a@b.c', passwordHash: 'h' });
    const result = await registerPatient(
      identity,
      sessions,
      vi.fn(),
      {
        email: 'a@b.c',
        password: 'longenough8',
        fullNameAr: 'سالم',
        phone: '0912345678',
        gender: 'male',
      },
      crypto,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMAIL_TAKEN');
    expect(identity.createWithProfile).not.toHaveBeenCalled();
    expect(sessions.create).not.toHaveBeenCalled();
  });
});

describe('loginPatient', () => {
  it('starts a session on valid credentials', async () => {
    const { identity, sessions } = stubStores();
    identity.findByEmail = vi
      .fn()
      .mockResolvedValue({ id: 'acc-1', email: 'a@b.c', passwordHash: 'hashed' });
    const result = await loginPatient(
      identity,
      sessions,
      { email: 'a@b.c', password: 'pw' },
      crypto,
    );
    expect(result.ok).toBe(true);
    expect(sessions.create).toHaveBeenCalledWith(
      'acc-1',
      expect.any(String),
      expect.any(Date),
    );
  });

  it('returns the same INVALID_CREDENTIALS code for unknown email and wrong password', async () => {
    const { identity, sessions } = stubStores();
    const noUser = await loginPatient(
      identity,
      sessions,
      { email: 'x@y.z', password: 'pw' },
      crypto,
    );
    identity.findByEmail = vi
      .fn()
      .mockResolvedValue({ id: '1', email: 'e', passwordHash: 'h' });
    const badPw = await loginPatient(
      identity,
      sessions,
      { email: 'a@b.c', password: 'pw' },
      { ...crypto, verify: vi.fn().mockResolvedValue(false) },
    );
    expect(noUser.ok).toBe(false);
    expect(badPw.ok).toBe(false);
    if (!noUser.ok && !badPw.ok) expect(noUser.code).toBe(badPw.code);
    expect(sessions.create).not.toHaveBeenCalled();
  });
});

describe('logoutPatient', () => {
  it('deletes the session row for the given token', async () => {
    const { sessions } = stubStores();
    await logoutPatient(sessions, 'raw-token', clock);
    expect(sessions.deleteByTokenHash).toHaveBeenCalledWith('h(raw-token)');
  });
});

describe('currentPatient', () => {
  it('returns null for an expired/unknown session', async () => {
    const { sessions } = stubStores();
    const account = await currentPatient(sessions, 't', clock);
    expect(account).toBeNull();
  });

  it('returns the account identity for a live session', async () => {
    const { sessions } = stubStores();
    sessions.findValidAccount = vi.fn().mockResolvedValue({
      sessionId: 's1',
      accountId: 'acc-1',
      email: 'a@b.c',
      expiresAt: new Date('2026-10-05T10:00:00Z'),
    });
    const account = await currentPatient(sessions, 't', clock);
    expect(account).toEqual({ accountId: 'acc-1', email: 'a@b.c' });
  });
});

function stubStaffStores() {
  const identity: StaffIdentityStore = {
    findByEmail: vi.fn().mockResolvedValue(null),
  };
  const sessions: StaffSessionStore = {
    create: vi.fn().mockResolvedValue(undefined),
    findValidUser: vi.fn().mockResolvedValue(null),
    deleteByTokenHash: vi.fn().mockResolvedValue(undefined),
  };
  return { identity, sessions };
}

describe('loginStaff', () => {
  it('refuses accounts without a password hash (Google-only staff)', async () => {
    const { identity, sessions } = stubStaffStores();
    identity.findByEmail = vi
      .fn()
      .mockResolvedValue({ id: 's1', email: 's@k.t', passwordHash: null, role: 'ADMIN' });
    const result = await loginStaff(
      identity,
      sessions,
      { email: 's@k.t', password: 'pw' },
      { verify: vi.fn().mockResolvedValue(true), newToken: () => 't' },
    );
    expect(result).toEqual({ ok: false, code: 'INVALID_CREDENTIALS' });
    expect(sessions.create).not.toHaveBeenCalled();
  });

  it('creates a staff session on valid credentials', async () => {
    const { identity, sessions } = stubStaffStores();
    identity.findByEmail = vi
      .fn()
      .mockResolvedValue({ id: 's1', email: 's@k.t', passwordHash: 'hashed', role: 'ADMIN' });
    const result = await loginStaff(
      identity,
      sessions,
      { email: 's@k.t', password: 'pw' },
      { verify: vi.fn().mockResolvedValue(true), newToken: () => 't' },
    );
    expect(result.ok).toBe(true);
    expect(sessions.create).toHaveBeenCalledWith('s1', expect.any(String), expect.any(Date));
  });

  it('rejects wrong password without creating a session', async () => {
    const { identity, sessions } = stubStaffStores();
    identity.findByEmail = vi
      .fn()
      .mockResolvedValue({ id: 's1', email: 's@k.t', passwordHash: 'hashed', role: 'STAFF' });
    const result = await loginStaff(
      identity,
      sessions,
      { email: 's@k.t', password: 'pw' },
      { verify: vi.fn().mockResolvedValue(false), newToken: () => 't' },
    );
    expect(result.ok).toBe(false);
    expect(sessions.create).not.toHaveBeenCalled();
  });
});

describe('currentStaff', () => {
  it('returns role with the session identity', async () => {
    const { sessions } = stubStaffStores();
    sessions.findValidUser = vi.fn().mockResolvedValue({
      sessionId: 'x',
      userId: 's1',
      email: 's@k.t',
      role: 'ADMIN',
      expiresAt: new Date(),
    });
    const staff = await currentStaff(sessions, 't', clock);
    expect(staff).toEqual({ userId: 's1', email: 's@k.t', role: 'ADMIN' });
  });

  it('returns null without a live session', async () => {
    const { sessions } = stubStaffStores();
    const staff = await currentStaff(sessions, 't', clock);
    expect(staff).toBeNull();
  });
});

describe('logoutStaff', () => {
  it('deletes the session row for the given token', async () => {
    const { sessions } = stubStaffStores();
    await logoutStaff(sessions, 'raw-token', clock);
    expect(sessions.deleteByTokenHash).toHaveBeenCalledWith('h(raw-token)');
  });
});
