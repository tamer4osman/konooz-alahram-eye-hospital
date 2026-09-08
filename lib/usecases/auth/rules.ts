import { createHash } from 'crypto';

// Pure session/auth rules for the split identity stores (D6). Framework-free:
// no next/* and no prisma imports — routes and adapters depend on this, never
// the reverse.

// Session TTL split (audit F8, 2026-09-08): staff sessions are the keys to
// patient records, so they rotate on a 7-day sliding window — every validated
// request extends expiry, so active staff are never logged out mid-shift, but
// an abandoned session dies within a week. Patient sessions carry only
// self-authored device data and keep the gentler 30-day window.
const STAFF_SESSION_TTL_DAYS = 7;
const PATIENT_SESSION_TTL_DAYS = 30;

export const PATIENT_COOKIE = 'konooz_patient_session';
export const STAFF_COOKIE = 'konooz_staff_session';
export const STAFF_SESSION_TTL_MS = STAFF_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;
export const PATIENT_SESSION_TTL_MS = PATIENT_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

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

// Password policy (audit F4, 2026-09-08): length-first, minimal friction —
// min 8 chars plus at least one letter and one digit. No forced special
// characters: length and argon2id carry the weight; composition rules that
// are too strict push users toward predictable patterns.
const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

const PASSWORD_HAS_LETTER = /[A-Za-z\u0600-\u06FF]/;
const PASSWORD_HAS_DIGIT = /[0-9]/;

export function isPasswordAcceptable(plain: string): boolean {
  if (plain.length < PASSWORD_MIN_LENGTH || plain.length > PASSWORD_MAX_LENGTH) return false;
  return PASSWORD_HAS_LETTER.test(plain) && PASSWORD_HAS_DIGIT.test(plain);
}

/** Bilingual user-facing copy for the weak-password rejection (F4). */
export const WEAK_PASSWORD_MESSAGES = {
  ar: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل وتحتوي على حرف ورقم على الأقل',
  en: 'Password must be at least 8 characters and contain at least one letter and one digit',
} as const;
