import type { NextRequest } from 'next/server';
import { handlePatientLogin } from '@/lib/api/patient-auth-handlers';
import { handleStaffLogin } from '@/lib/api/staff-auth-handlers';

export const dynamic = 'force-dynamic';

// TEMPORARY FACADE (deleted in Phase 5). The pre-split UI posts here for both
// account kinds. We try the patient store first; a miss falls through to the
// staff store. Whichever matches sets its own disjoint session cookie (D6) —
// a staff cookie can never authenticate a patient route and vice versa.
// Phase 2 replaces this entry with /api/staff/auth/login, Phase 4 with
// /api/patient/auth/login.

export async function POST(req: NextRequest): Promise<Response> {
  const patientResponse = await handlePatientLogin(req);
  if (patientResponse.status !== 401) return patientResponse;

  const staffResponse = await handleStaffLogin(req);
  if (staffResponse.status !== 401) return staffResponse;

  // Neither store matched — report the patient-shaped error for a stable UX.
  return patientResponse;
}
