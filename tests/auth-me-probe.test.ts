/**
 * Clean-console contract tests (2026-09-09).
 *
 * The anonymous session probe endpoints (`GET /api/patient/auth/me`,
 * `GET /api/staff/auth/me`) are called on every page mount. Returning 401
 * for an anonymous visitor is correct REST but makes the browser log a
 * network error in devtools — noisy console on the marketing pages.
 *
 * Contract: a probe with NO session returns 200 `{ user: null }` (silent
 * "not logged in"). A probe WITH a session still returns the full payload.
 * Protected data routes keep their 401 semantics — this change is strictly
 * about the mount-time probe.
 *
 * These tests mock `@/lib/prisma` (the established pattern in this suite)
 * and exercise the real route handlers with a stubbed `next/headers`.
 */
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

const prismaMock = vi.hoisted(() => ({
  patientProfile: {
    findUnique: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
}));

vi.mock('@/lib/prisma', () => ({ prisma: prismaMock }));

vi.mock('@/lib/adapters/prisma/patient-auth-adapter', () => ({
  prismaPatientSessions: {},
}));

vi.mock('@/lib/adapters/prisma/staff-auth-adapter', () => ({
  prismaStaffSessions: {},
}));

// Session lookups: the adapters are mocked out at the store level so these
// tests exercise route logic, not DB wiring (kept in sync with tokenLooksValid).
vi.mock('@/lib/usecases/auth/patient-auth', () => ({
  currentPatient: vi.fn(async (_sessions: unknown, token: string) =>
    token === 'A'.repeat(43)
      ? { accountId: 'acc1', email: 'p@x.test' }
      : null,
  ),
}));

vi.mock('@/lib/usecases/auth/staff-auth', () => ({
  currentStaff: vi.fn(async (_sessions: unknown, token: string) =>
    token === 'S'.repeat(43)
      ? { userId: 'u1', email: 'staff@konooz.test', role: 'ADMIN' as const }
      : null,
  ),
}));

const cookieStoreMock = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('next/headers', () => ({
  cookies: async () => cookieStoreMock,
}));

import { GET as getPatientMe } from '@/app/api/patient/auth/me/route';
import { GET as getStaffMe } from '@/app/api/staff/auth/me/route';

async function shapeOf(res: Response): Promise<{ status: number; body: unknown }> {
  const body: unknown = await res.json();
  return { status: res.status, body };
}

beforeEach(() => {
  vi.clearAllMocks();
  cookieStoreMock.get.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('patient /me probe contract', () => {
  it('returns 200 user:null when there is no session cookie (silent probe)', async () => {
    cookieStoreMock.get.mockReturnValue(undefined);

    const { status, body } = await shapeOf(await getPatientMe());

    expect(status).toBe(200);
    expect(body).toEqual({ data: { user: null } });
    // The probe must not touch the DB when there is no session.
    expect(prismaMock.patientProfile.findUnique).not.toHaveBeenCalled();
  });

  it('returns 200 user:null when the cookie value is invalid', async () => {
    cookieStoreMock.get.mockReturnValue({ value: 'garbage' });

    const { status, body } = await shapeOf(await getPatientMe());

    expect(status).toBe(200);
    expect(body).toEqual({ data: { user: null } });
  });

  it('still returns the full payload for an authenticated patient', async () => {
    cookieStoreMock.get.mockReturnValue({ value: 'A'.repeat(43) });
    prismaMock.patientProfile.findUnique.mockResolvedValue({
      id: 'prof1',
      accountId: 'acc1',
      appointments: [],
      prescriptions: [],
    });

    const { status, body } = await shapeOf(await getPatientMe());

    expect(status).toBe(200);
    const data = (body as { data: { user: { id: string; role: string }; profile: unknown } }).data;
    expect(data.user).toEqual({ id: 'acc1', email: 'p@x.test', role: 'PATIENT' });
    expect(data.profile).toBeTruthy();
  });
});

describe('staff /me probe contract', () => {
  it('returns 200 user:null when there is no session cookie (silent probe)', async () => {
    cookieStoreMock.get.mockReturnValue(undefined);

    const { status, body } = await shapeOf(await getStaffMe());

    expect(status).toBe(200);
    expect(body).toEqual({ data: { user: null } });
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns 200 user:null when the cookie value is invalid', async () => {
    cookieStoreMock.get.mockReturnValue({ value: 'garbage' });

    const { status, body } = await shapeOf(await getStaffMe());

    expect(status).toBe(200);
    expect(body).toEqual({ data: { user: null } });
  });

  it('still returns the user payload for an authenticated staff member', async () => {
    cookieStoreMock.get.mockReturnValue({ value: 'S'.repeat(43) });
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'u1',
      email: 'staff@konooz.test',
      role: 'ADMIN',
      permissions: [],
    });

    const { status, body } = await shapeOf(await getStaffMe());

    expect(status).toBe(200);
    expect((body as { data: { user: { id: string } } }).data.user.id).toBe('u1');
  });
});
