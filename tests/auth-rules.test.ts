import { describe, expect, it } from 'vitest';
import {
  PATIENT_COOKIE,
  PATIENT_SESSION_TTL_MS,
  STAFF_COOKIE,
  STAFF_SESSION_TTL_MS,
  hashToken,
  isPasswordAcceptable,
  tokenLooksValid,
} from '@/lib/usecases/auth/rules';

describe('auth rules', () => {
  it('uses disjoint cookie names (D6)', () => {
    expect(PATIENT_COOKIE).toBe('konooz_patient_session');
    expect(STAFF_COOKIE).toBe('konooz_staff_session');
    expect(PATIENT_COOKIE).not.toBe(STAFF_COOKIE);
  });

  it('session TTLs are split: staff 7 days, patient 30 days (F8)', () => {
    expect(STAFF_SESSION_TTL_MS).toBe(60 * 60 * 24 * 7 * 1000);
    expect(PATIENT_SESSION_TTL_MS).toBe(60 * 60 * 24 * 30 * 1000);
    expect(STAFF_SESSION_TTL_MS).toBeLessThan(PATIENT_SESSION_TTL_MS);
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

describe('password policy (F4)', () => {
  it('accepts length >= 8 with at least one letter and one digit', () => {
    expect(isPasswordAcceptable('Staff@12345')).toBe(true);
    expect(isPasswordAcceptable('alllowercase1!')).toBe(true); // letter+digit, length ok
    expect(isPasswordAcceptable('abcdefgh1')).toBe(true);
    expect(isPasswordAcceptable('pass1234')).toBe(true);
    // Arabic letters count as letters
    expect(isPasswordAcceptable('كلمة1234')).toBe(true);
  });

  it('rejects passwords without a digit', () => {
    expect(isPasswordAcceptable('onlyletters!')).toBe(false);
    expect(isPasswordAcceptable('abcdefgh')).toBe(false);
  });

  it('rejects passwords without a letter', () => {
    expect(isPasswordAcceptable('12345678')).toBe(false);
    expect(isPasswordAcceptable('1234!@#$5678')).toBe(false);
  });

  it('rejects short and oversized passwords', () => {
    expect(isPasswordAcceptable('ab1')).toBe(false);
    expect(isPasswordAcceptable('abc12345')).toBe(true); // exactly 8 — boundary
    expect(isPasswordAcceptable('a'.repeat(128) + '1')).toBe(false);
  });

  it('rejects empty input', () => {
    expect(isPasswordAcceptable('')).toBe(false);
  });
});
