import { getPatientAccount, getStaffAccount } from '@/lib/api/patient-route';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AUTH_MESSAGES } from '@/data/authMessages';

export const dynamic = 'force-dynamic';

// TEMPORARY FACADE (deleted in Phase 5). Serves whichever session is live —
// patient or staff — under the pre-split response shape the UI expects.

export async function GET() {
  const account = await getPatientAccount();
  if (account) {
    const profile = await prisma.patientProfile.findUnique({
      where: { accountId: account.accountId },
    });
    return apiSuccess({
      user: { id: account.accountId, email: account.email, role: 'PATIENT' as const },
      profile,
    });
  }

  const staff = await getStaffAccount();
  if (staff) {
    const user = await prisma.user.findUnique({
      where: { id: staff.userId },
      select: { id: true, email: true, role: true, permissions: true },
    });
    return apiSuccess({ user });
  }

  return apiError(401, 'NOT_AUTHENTICATED', AUTH_MESSAGES.notAuthenticated.ar, AUTH_MESSAGES.notAuthenticated.en);
}
