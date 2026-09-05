import { getStaffAccount } from '@/lib/api/patient-route';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AUTH_MESSAGES } from '@/data/authMessages';

export const dynamic = 'force-dynamic';

export async function GET() {
  const staff = await getStaffAccount();
  if (!staff) {
    return apiError(401, 'NOT_AUTHENTICATED', AUTH_MESSAGES.notAuthenticated.ar, AUTH_MESSAGES.notAuthenticated.en);
  }

  const user = await prisma.user.findUnique({
    where: { id: staff.userId },
    select: { id: true, email: true, role: true, permissions: true },
  });
  return apiSuccess({ user });
}
