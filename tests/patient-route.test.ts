import { describe, expect, it, vi } from 'vitest';
import { getPatientAccountFromToken } from '@/lib/api/patient-route';
import type { PatientSessionStore } from '@/lib/usecases/auth/ports';

describe('getPatientAccountFromToken', () => {
  it('returns null for garbage tokens without touching the store', async () => {
    const sessions: PatientSessionStore = {
      create: vi.fn(),
      findValidAccount: vi.fn(),
      deleteByTokenHash: vi.fn(),
    };
    const account = await getPatientAccountFromToken('nope!!', sessions);
    expect(account).toBeNull();
    expect(sessions.findValidAccount).not.toHaveBeenCalled();
  });

  it('resolves a valid token through the session store', async () => {
    const sessions: PatientSessionStore = {
      create: vi.fn(),
      findValidAccount: vi
        .fn()
        .mockResolvedValue({
          sessionId: 's1',
          accountId: 'acc-1',
          email: 'a@b.c',
          expiresAt: new Date('2026-10-05T00:00:00Z'),
        }),
      deleteByTokenHash: vi.fn(),
    };
    const account = await getPatientAccountFromToken('a'.repeat(43), sessions);
    expect(account).toEqual({ accountId: 'acc-1', email: 'a@b.c' });
  });
});
