import { handlePatientRegister } from '@/lib/api/patient-auth-handlers';

export const dynamic = 'force-dynamic';

// TEMPORARY FACADE (deleted in Phase 4 when the portal moves to its own
// surface). Registration is patient-only by design (D2) — there is no staff
// registration anywhere in the system.

export const POST = handlePatientRegister;
