import { getPatientAccount } from '@/lib/api/patient-route';
import { prisma } from '@/lib/prisma';
import { toPortalAppointment, toPortalPrescription } from '@/lib/patient/dto';
import { apiSuccess, apiError } from '@/lib/api/response';
import { AUTH_MESSAGES } from '@/data/authMessages';

export const dynamic = 'force-dynamic';

// Patient /me (D4: server-side record scoping). The session cookie decides
// which account is consulted; every row below is fetched through the
// account → profile edge, so a patient can only ever see their own data.

export async function GET() {
  const account = await getPatientAccount();
  if (!account) {
    return apiError(401, 'NOT_AUTHENTICATED', AUTH_MESSAGES.notAuthenticated.ar, AUTH_MESSAGES.notAuthenticated.en);
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { accountId: account.accountId },
    include: {
      appointments: {
        orderBy: { date: 'desc' },
        include: { room: { select: { nameAr: true, nameEn: true } } },
        take: 50,
      },
      prescriptions: {
        orderBy: { issuedDate: 'desc' },
        include: { doctor: { select: { fullNameAr: true, fullNameEn: true } } },
        take: 50,
      },
    },
  });
  if (!profile) {
    return apiError(401, 'NOT_AUTHENTICATED', AUTH_MESSAGES.notAuthenticated.ar, AUTH_MESSAGES.notAuthenticated.en);
  }

  return apiSuccess({
    user: { id: account.accountId, email: account.email, role: 'PATIENT' as const },
    profile: {
      ...profile,
      appointments: profile.appointments.map(toPortalAppointment),
      prescriptions: profile.prescriptions.map(toPortalPrescription),
    },
  });
}
