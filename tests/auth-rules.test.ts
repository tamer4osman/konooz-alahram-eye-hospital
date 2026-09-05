import { describe, expect, it } from 'vitest';
import {
  PATIENT_COOKIE,
  STAFF_COOKIE,
  SESSION_TTL_MS,
  hashToken,
  tokenLooksValid,
} from '@/lib/usecases/auth/rules';

describe('auth rules', () => {
  it('uses disjoint cookie names (D6)', () => {
    expect(PATIENT_COOKIE).toBe('konooz_patient_session');
    expect(STAFF_COOKIE).toBe('konooz_staff_session');
    expect(PATIENT_COOKIE).not.toBe(STAFF_COOKIE);
  });

  it('session TTL is 30 days in ms', () => {
    expect(SESSION_TTL_MS).toBe(60 * 60 * 24 * 30 * 1000);
  });

  it('hashToken is sha256 hex of the input', () => {
    expect(hashToken('abc')).toBe(
      'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
  });

  it('tokenLooksValid rejects obvious garbage before a DB hit', () => {
    expect(tokenLooksValid('')).toBe(false);
    expect(tokenLooksValid('not base64url!!')).toBe(false);
    // Real token shape: 32 random bytes → 43 base64url chars
    expect(tokenLooksValid('a'.repeat(43))).toBe(true);
    expect(tokenLooksValid('dGVzdC10b2tlbg')).toBe(false); // too short
    expect(tokenLooksValid('a'.repeat(44))).toBe(false); // too long
  });
});
