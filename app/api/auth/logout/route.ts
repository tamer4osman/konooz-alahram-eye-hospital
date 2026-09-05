import { handlePatientLogout } from '@/lib/api/patient-auth-handlers';
import { handleStaffLogout } from '@/lib/api/staff-auth-handlers';

export const dynamic = 'force-dynamic';

// TEMPORARY FACADE (deleted in Phase 5). Clears whichever session cookie is
// present; both stores are consulted independently.

export async function POST(): Promise<Response> {
  const patientResponse = await handlePatientLogout();
  const staffResponse = await handleStaffLogout();

  const headers = new Headers({ 'Content-Type': 'application/json' });
  for (const cookie of [...patientResponse.headers.getSetCookie(), ...staffResponse.headers.getSetCookie()]) {
    headers.append('set-cookie', cookie);
  }

  return new Response(await patientResponse.text(), { status: patientResponse.status, headers });
}
