import { cookies } from 'next/headers';
import { PATIENT_COOKIE, STAFF_COOKIE, hashToken, tokenLooksValid } from '@/lib/usecases/auth/rules';
import { currentPatient } from '@/lib/usecases/auth/patient-auth';
import { currentStaff } from '@/lib/usecases/auth/staff-auth';
import { prismaPatientSessions } from '@/lib/adapters/prisma/patient-auth-adapter';
import { prismaStaffSessions } from '@/lib/adapters/prisma/staff-auth-adapter';
import type { PatientSessionStore, StaffSessionStore } from '@/lib/usecases/auth/ports';

// Route-level guards for the split identity stores (D6). A patient cookie can
// never authenticate a staff route and vice versa — the cookie name decides
// which session table is consulted, so confusion is impossible by mechanism.

export interface PatientIdentity {
  accountId: string;
  email: string;
}

export interface StaffIdentity {
  userId: string;
  email: string;
  role: 'STAFF' | 'ADMIN';
}

export async function getPatientAccountFromToken(
  rawToken: string,
  sessions: PatientSessionStore = prismaPatientSessions,
): Promise<PatientIdentity | null> {
  if (!tokenLooksValid(rawToken)) return null;
  return currentPatient(sessions, rawToken, { hashToken, now: () => new Date() });
}

function getStaffFromToken(
  rawToken: string,
  sessions: StaffSessionStore = prismaStaffSessions,
): Promise<StaffIdentity | null> {
  if (!tokenLooksValid(rawToken)) return Promise.resolve(null);
  return currentStaff(sessions, rawToken, { hashToken, now: () => new Date() });
}

export async function getPatientAccount(): Promise<PatientIdentity | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(PATIENT_COOKIE)?.value;
  if (!token) return null;
  return getPatientAccountFromToken(token);
}

export async function getStaffAccount(): Promise<StaffIdentity | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(STAFF_COOKIE)?.value;
  if (!token) return null;
  return getStaffFromToken(token);
}

/** Presence flag for client-side hydration decisions — carries no identity. */
export const AUTH_INDICATOR_COOKIE = 'konooz_auth';
