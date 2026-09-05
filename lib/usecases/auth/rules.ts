import { createHash } from 'crypto';

// Pure session/auth rules for the split identity stores (D6). Framework-free:
// no next/* and no prisma imports — routes and adapters depend on this, never
// the reverse.

const SESSION_TTL_DAYS = 30;

export const PATIENT_COOKIE = 'konooz_patient_session';
export const STAFF_COOKIE = 'konooz_staff_session';
export const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

/** Tokens are stored hashed; the raw value only ever lives in the cookie. */
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// 32 random bytes → 43 base64url chars. Anything shorter or off-alphabet is
// rejected before a DB round-trip.
const BASE64URL_RE = /^[A-Za-z0-9_-]{43}$/;

export function tokenLooksValid(token: string): boolean {
  return BASE64URL_RE.test(token);
}
