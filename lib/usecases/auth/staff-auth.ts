import { hashToken, SESSION_TTL_MS } from './rules';
import type { StaffIdentityStore, StaffSessionStore } from './ports';

// Staff auth orchestration (D2: no self-registration — the only entry point
// is login against admin-provisioned accounts; D4: revocable DB sessions).
// Stores injected; no prisma, no next/*.

export type StaffVerifyPort = {
  verify(plain: string, hash: string): Promise<boolean>;
  newToken(): string;
};

export type StaffAuthResult =
  | { ok: true; userId: string; email: string; role: 'STAFF' | 'ADMIN'; sessionToken: string }
  | { ok: false; code: 'INVALID_CREDENTIALS' };

export async function loginStaff(
  identity: StaffIdentityStore,
  sessions: StaffSessionStore,
  input: { email: string; password: string },
  crypto: StaffVerifyPort,
): Promise<StaffAuthResult> {
  const user = await identity.findByEmail(input.email.trim().toLowerCase());
  if (!user || !user.passwordHash) return { ok: false, code: 'INVALID_CREDENTIALS' };
  const valid = await crypto.verify(input.password, user.passwordHash);
  if (!valid) return { ok: false, code: 'INVALID_CREDENTIALS' };

  const token = crypto.newToken();
  await sessions.create(user.id, hashToken(token), new Date(Date.now() + SESSION_TTL_MS));
  return { ok: true, userId: user.id, email: user.email, role: user.role, sessionToken: token };
}

export interface StaffTokenClock {
  hashToken(token: string): string;
  now(): Date;
}

export async function currentStaff(
  sessions: StaffSessionStore,
  rawToken: string,
  clock: StaffTokenClock,
): Promise<{ userId: string; email: string; role: 'STAFF' | 'ADMIN' } | null> {
  const row = await sessions.findValidUser(clock.hashToken(rawToken), clock.now());
  return row ? { userId: row.userId, email: row.email, role: row.role } : null;
}

export async function logoutStaff(
  sessions: StaffSessionStore,
  rawToken: string,
  clock: Pick<StaffTokenClock, 'hashToken'>,
): Promise<void> {
  await sessions.deleteByTokenHash(clock.hashToken(rawToken));
}
