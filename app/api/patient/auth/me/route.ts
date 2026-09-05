import { getPatientAccount } from '@/lib/api/patient-route';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AUTH_MESSAGES } from '@/data/authMessages';

export const dynamic = 'force-dynamic';

export async function GET() {
  const account = await getPatientAccount();
  if (!account) {
    return apiError(401, 'NOT_AUTHENTICATED', AUTH_MESSAGES.notAuthenticated.ar, AUTH_MESSAGES.notAuthenticated.en);
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { accountId: account.accountId },
  });
  return apiSuccess({
    user: { id: account.accountId, email: account.email, role: 'PATIENT' as const },
    profile,
  });
}
