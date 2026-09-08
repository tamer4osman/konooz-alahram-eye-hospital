import { hashToken, PATIENT_SESSION_TTL_MS } from './rules';
import type { PatientIdentityStore, PatientSessionStore } from './ports';

// Patient auth orchestration (D2: patients self-serve; D4: session-token
// scoping). Stores are injected ports — no prisma, no next/* here. The
// password/crypto port keeps argon2id wiring in the adapters/routes layer.

export type CryptoPort = {
  hash(plain: string): Promise<string>;
  verify(plain: string, hash: string): Promise<boolean>;
  newToken(): string;
};

export type ConsentAuditPort = (
  accountId: string,
  consentType: string,
) => Promise<void>;

export type PatientAuthResult =
  | { ok: true; accountId: string; email: string; sessionToken: string }
  | { ok: false; code: 'EMAIL_TAKEN' | 'INVALID_CREDENTIALS' };

export interface RegisterPatientInput {
  email: string;
  password: string;
  fullNameAr: string;
  phone: string;
  gender: 'male' | 'female';
}

export interface TokenClock {
  hashToken(token: string): string;
  now(): Date;
}

export async function registerPatient(
  identity: PatientIdentityStore,
  sessions: PatientSessionStore,
  auditConsent: ConsentAuditPort,
  input: RegisterPatientInput,
  crypto: CryptoPort,
): Promise<PatientAuthResult> {
  const email = input.email.trim().toLowerCase();
  const existing = await identity.findByEmail(email);
  if (existing) return { ok: false, code: 'EMAIL_TAKEN' };

  const passwordHash = await crypto.hash(input.password);
  const account = await identity.createWithProfile({
    email,
    passwordHash,
    fullNameAr: input.fullNameAr.trim(),
    phone: input.phone,
    gender: input.gender === 'female' ? 'FEMALE' : 'MALE',
    cityAr: 'بنغازي',
  });

  const token = crypto.newToken();
  await sessions.create(account.id, hashToken(token), new Date(Date.now() + PATIENT_SESSION_TTL_MS));
  await auditConsent(account.id, 'privacy_policy');
  return { ok: true, accountId: account.id, email: account.email, sessionToken: token };
}

export async function loginPatient(
  identity: PatientIdentityStore,
  sessions: PatientSessionStore,
  input: { email: string; password: string },
  crypto: CryptoPort,
): Promise<PatientAuthResult> {
  const account = await identity.findByEmail(input.email.trim().toLowerCase());
  // Same error code for unknown email and wrong password — no account oracle.
  if (!account) return { ok: false, code: 'INVALID_CREDENTIALS' };
  const valid = await crypto.verify(input.password, account.passwordHash);
  if (!valid) return { ok: false, code: 'INVALID_CREDENTIALS' };

  const token = crypto.newToken();
  await sessions.create(account.id, hashToken(token), new Date(Date.now() + PATIENT_SESSION_TTL_MS));
  return { ok: true, accountId: account.id, email: account.email, sessionToken: token };
}

export async function logoutPatient(
  sessions: PatientSessionStore,
  rawToken: string,
  clock: Pick<TokenClock, 'hashToken'>,
): Promise<void> {
  await sessions.deleteByTokenHash(clock.hashToken(rawToken));
}

export async function currentPatient(
  sessions: PatientSessionStore,
  rawToken: string,
  clock: TokenClock,
): Promise<{ accountId: string; email: string } | null> {
  const row = await sessions.findValidAccount(clock.hashToken(rawToken), clock.now());
  return row ? { accountId: row.accountId, email: row.email } : null;
}
