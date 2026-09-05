import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getPatientAccount } from '@/lib/api/patient-route';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

// D8 one-time bridge: imports ONLY self-authored fields from a patient's old
// device-local profile. Appointments/prescriptions from the local copy are
// deliberately NOT imported — they were never hospital records, and writing
// them into a clinical history would fabricate medicine. The response states
// exactly what was and was not migrated.

const importSchema = z.object({
  allergiesAr: z.array(z.string().max(120)).max(30).optional(),
  allergiesEn: z.array(z.string().max(120)).max(30).optional(),
  chronicConditionsAr: z.array(z.string().max(120)).max(30).optional(),
  chronicConditionsEn: z.array(z.string().max(120)).max(30).optional(),
  cityAr: z.string().max(60).optional(),
  cityEn: z.string().max(60).optional(),
  whatsappNumber: z.string().max(20).optional(),
  emergencyContact: z
    .object({
      name: z.string().max(120),
      relationAr: z.string().max(60),
      relationEn: z.string().max(60),
      phone: z.string().max(20),
    })
    .optional(),
  communicationPreferences: z
    .object({
      emailNotifications: z.boolean(),
      whatsappAlerts: z.boolean(),
      appointmentReminders: z.boolean(),
      eyeDropScheduleAlerts: z.boolean(),
      postOpCareGuides: z.boolean(),
      newsletterSubscribed: z.boolean(),
      newsletterTopics: z.array(z.string().max(40)).max(20),
    })
    .optional(),
});

export async function POST(req: NextRequest) {
  const account = await getPatientAccount();
  if (!account) {
    return apiError(401, 'NOT_AUTHENTICATED', 'غير مسجل الدخول', 'Not authenticated');
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload');
  }

  const parsed = importSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', 'بيانات الملف المحلي غير صالحة للاستيراد', 'The local profile data is not valid for import');
  }

  const existing = await prisma.patientProfile.findUnique({
    where: { accountId: account.accountId },
    select: {
      id: true,
      allergiesAr: true,
      allergiesEn: true,
      chronicConditionsAr: true,
      chronicConditionsEn: true,
      cityAr: true,
      cityEn: true,
      whatsappNumber: true,
      emergencyContact: true,
      communicationPreferences: true,
    },
  });
  if (!existing) {
    return apiError(404, 'PROFILE_NOT_FOUND', 'لم نجد ملفك الطبي', 'Your medical profile was not found');
  }

  // Fill-if-empty discipline: the server copy is authoritative; the local
  // copy only fills gaps and extends list fields. Nothing is overwritten.
  const mergeUnique = (server: string[], local: string[] | undefined): string[] | undefined =>
    local && local.length ? Array.from(new Set([...server, ...local.filter((x) => !server.includes(x))])) : undefined;

  const data: Record<string, unknown> = {
    ...(mergeUnique(existing.allergiesAr, parsed.data.allergiesAr) !== undefined
      ? { allergiesAr: mergeUnique(existing.allergiesAr, parsed.data.allergiesAr) }
      : {}),
    ...(mergeUnique(existing.allergiesEn, parsed.data.allergiesEn) !== undefined
      ? { allergiesEn: mergeUnique(existing.allergiesEn, parsed.data.allergiesEn) }
      : {}),
    ...(mergeUnique(existing.chronicConditionsAr, parsed.data.chronicConditionsAr) !== undefined
      ? { chronicConditionsAr: mergeUnique(existing.chronicConditionsAr, parsed.data.chronicConditionsAr) }
      : {}),
    ...(mergeUnique(existing.chronicConditionsEn, parsed.data.chronicConditionsEn) !== undefined
      ? { chronicConditionsEn: mergeUnique(existing.chronicConditionsEn, parsed.data.chronicConditionsEn) }
      : {}),
    ...(!existing.cityAr && parsed.data.cityAr ? { cityAr: parsed.data.cityAr } : {}),
    ...(!existing.cityEn && parsed.data.cityEn ? { cityEn: parsed.data.cityEn } : {}),
    ...(!existing.whatsappNumber && parsed.data.whatsappNumber ? { whatsappNumber: parsed.data.whatsappNumber } : {}),
    ...(!existing.emergencyContact && parsed.data.emergencyContact
      ? { emergencyContact: JSON.stringify(parsed.data.emergencyContact) }
      : {}),
    ...(!existing.communicationPreferences && parsed.data.communicationPreferences
      ? { communicationPreferences: JSON.stringify(parsed.data.communicationPreferences) }
      : {}),
  };

  await prisma.patientProfile.update({ where: { id: existing.id }, data });

  return apiSuccess({
    imported: true,
    skipped: {
      appointments: 'already recorded server-side when you booked — no duplicate created',
      prescriptions: 'not imported: drop schedules saved on your device were never hospital records',
    },
  });
}
