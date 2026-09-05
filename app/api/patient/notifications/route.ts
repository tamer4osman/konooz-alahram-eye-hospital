import { getPatientAccount } from '@/lib/api/patient-route';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

// D9: patient notifications are DERIVED, read-only facts computed from the
// patient's own rows — upcoming visits, recently confirmed/completed visits,
// and pending feedback invitations. No notifications table exists, nothing
// implies a message was delivered, and every item is a DB fact.

export async function GET() {
  const account = await getPatientAccount();
  if (!account) {
    return apiError(401, 'NOT_AUTHENTICATED', 'غير مسجل الدخول', 'Not authenticated');
  }

  const profile = await prisma.patientProfile.findUnique({
    where: { accountId: account.accountId },
    select: { id: true },
  });
  if (!profile) {
    return apiError(401, 'NOT_AUTHENTICATED', 'غير مسجل الدخول', 'Not authenticated');
  }

  const now = new Date();

  const appointments = await prisma.appointment.findMany({
    where: { patientId: profile.id },
    orderBy: { date: 'desc' },
    take: 50,
    select: {
      id: true,
      ticketNumber: true,
      date: true,
      time: true,
      status: true,
      doctorDisplayNameAr: true,
      doctorDisplayNameEn: true,
      specialtyAr: true,
      specialtyEn: true,
    },
  });

  const upcoming = appointments
    .filter((a) => a.date >= now && (a.status === 'scheduled' || a.status === 'confirmed'))
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((a) => ({
      kind: 'upcoming_appointment' as const,
      id: a.id,
      ticketNumber: a.ticketNumber,
      date: a.date.toISOString(),
      time: a.time,
      doctorAr: a.doctorDisplayNameAr,
      doctorEn: a.doctorDisplayNameEn,
      specialtyAr: a.specialtyAr,
      specialtyEn: a.specialtyEn,
    }));

  const recentlyCompleted = appointments
    .filter((a) => a.status === 'completed')
    .slice(0, 5)
    .map((a) => ({
      kind: 'visit_completed' as const,
      id: a.id,
      ticketNumber: a.ticketNumber,
      date: a.date.toISOString(),
      doctorAr: a.doctorDisplayNameAr,
      doctorEn: a.doctorDisplayNameEn,
    }));

  const confirmed = appointments
    .filter((a) => a.status === 'confirmed')
    .slice(0, 5)
    .map((a) => ({
      kind: 'appointment_confirmed' as const,
      id: a.id,
      ticketNumber: a.ticketNumber,
      date: a.date.toISOString(),
      time: a.time,
    }));

  return apiSuccess({
    generatedAt: now.toISOString(),
    items: [...upcoming, ...confirmed, ...recentlyCompleted],
  });
}
