import { NextRequest } from 'next/server';
import { z } from 'zod';
import { getPatientAccount } from '@/lib/api/patient-route';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';

export const dynamic = 'force-dynamic';

// Patient profile update (D4: scoping). Only the fields a patient may edit
// about themselves are accepted — clinical fields are staff-authored and
// never patient-writable.

const patchSchema = z.object({
  fullNameAr: z.string().min(2).max(120).optional(),
  fullNameEn: z.string().max(120).optional(),
  phone: z.string().min(8).max(20).optional(),
  whatsappNumber: z.string().max(20).optional(),
  cityAr: z.string().max(60).optional(),
  cityEn: z.string().max(60).optional(),
  bloodGroup: z.string().max(8).optional(),
  dateOfBirth: z.string().max(20).optional(),
  gender: z.enum(['male', 'female']).optional(),
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

export async function PATCH(req: NextRequest) {
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

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', 'بيانات الملف غير صالحة', 'Invalid profile data');
  }

  const { communicationPreferences, gender, ...scalarFields } = parsed.data;

  const profile = await prisma.patientProfile.update({
    where: { accountId: account.accountId },
    data: {
      ...scalarFields,
      ...(gender !== undefined ? { gender: gender === 'female' ? 'FEMALE' : 'MALE' as const } : {}),
      ...(communicationPreferences !== undefined
        ? { communicationPreferences: JSON.stringify(communicationPreferences) }
        : {}),
    },
    select: { id: true },
  });

  return apiSuccess({ ok: true, id: profile.id });
}
