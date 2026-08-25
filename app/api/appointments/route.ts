import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/api/response';
import { appointmentRequestSchema } from '@/lib/validation/appointments';
import {
  bookingRateLimiter,
  getClientIp,
  tooManyRequests,
} from '@/lib/api/rate-limit';

export const dynamic = 'force-dynamic';

function generateTicket(): string {
  return `BK-${Math.floor(100000 + Math.random() * 900000)}`;
}

export async function POST(request: Request) {
  const limiter = bookingRateLimiter(getClientIp(request));
  if (!limiter.allowed) return tooManyRequests(limiter.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload');
  }

  const parsed = appointmentRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', 'بيانات الحجز غير مكتملة أو غير صحيحة', 'Booking data is incomplete or invalid');
  }
  const input = parsed.data;

  try {
    let doctorSnapshot: { displayNameAr: string | null; displayNameEn: string | null; specialtyAr: string | null; specialtyEn: string | null } = {
      displayNameAr: null,
      displayNameEn: null,
      specialtyAr: null,
      specialtyEn: null,
    };

    if (input.doctorId) {
      const doctor = await prisma.doctor.findUnique({ where: { id: input.doctorId } });
      if (doctor) {
        doctorSnapshot = {
          displayNameAr: doctor.fullNameAr,
          displayNameEn: doctor.fullNameEn,
          specialtyAr: doctor.specialtyAr,
          specialtyEn: doctor.specialtyEn,
        };
      }
    }

    // Public booking requests arrive before any patient account exists —
    // patientId stays null until reception links the request to a profile.
    const fallbackDate = new Date();
    fallbackDate.setDate(fallbackDate.getDate() + 7);

    let created;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        created = await prisma.appointment.create({
          data: {
            ticketNumber: generateTicket(),
            date: input.preferredDate ? new Date(input.preferredDate) : fallbackDate,
            time: input.preferredTime ?? '09:00',
            status: 'scheduled',
            source: 'PATIENT_REQUEST',
            doctorDisplayNameAr: doctorSnapshot.displayNameAr,
            doctorDisplayNameEn: doctorSnapshot.displayNameEn,
            specialtyAr: doctorSnapshot.specialtyAr ?? input.conditionTitleAr ?? null,
            specialtyEn: doctorSnapshot.specialtyEn ?? input.conditionTitleEn ?? null,
            instructionsAr: 'يرجى الحضور قبل الموعد بـ 15 دقيقة. يؤكد موظف الاستقبال الموعد عبر واتساب.',
            instructionsEn: 'Please arrive 15 minutes early. Reception confirms the slot via WhatsApp.',
            locationAr: 'مستشفى كنوز الأهرام لطب وجراحة العيون - بنغازي',
            locationEn: 'Konooz Al-Ahram Eye Hospital - Benghazi',
          },
        });
        break;
      } catch (err) {
        const code = (err as { code?: string }).code;
        if (code === 'P2002' && attempt < 4) continue;
        throw err;
      }
    }

    if (!created) {
      return apiError(500, 'BOOKING_CREATE_FAILED', 'تعذر إنشاء طلب الحجز', 'Failed to create booking request');
    }

    return apiSuccess({ ref: created.ticketNumber, status: 'pending_reception' }, 201);
  } catch {
    return apiError(500, 'BOOKING_FAILED', 'تعذر تسجيل طلب الحجز، حاول مرة أخرى', 'Could not record booking request, please retry');
  }
}
