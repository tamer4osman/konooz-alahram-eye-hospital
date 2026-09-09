import { getStaffAccount } from '@/lib/api/patient-route';
import { prisma } from '@/lib/prisma';
import { apiSuccess } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

export async function GET() {
  const staff = await getStaffAccount();
  // Silent-probe contract: a mount-time probe with no session answers 200
  // user:null so anonymous /ops visitors never see browser network-error
  // logs. Protected DATA routes keep 401 semantics — this is probe-only.
  if (!staff) {
    return apiSuccess({ user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: staff.userId },
    select: { id: true, email: true, role: true, permissions: true },
  });
  return apiSuccess({ user });
}
