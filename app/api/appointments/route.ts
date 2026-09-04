import { apiSuccess, apiError } from '@/lib/api/response';
import { appointmentRequestSchema } from '@/lib/validation/appointments';
import {
  bookingRateLimiter,
  getClientIp,
  tooManyRequests,
} from '@/lib/api/rate-limit';
import { createBookingRequest } from '@/lib/usecases/appointments';
import {
  prismaDoctorReader,
  prismaAppointmentWriter,
} from '@/lib/adapters/prisma/appointment-adapter';

export const dynamic = 'force-dynamic';

// Thin handler: rate limit -> validate -> use case -> respond. Business rules
// (ticket generation, doctor snapshot, fallback date, honest copy) live in
// lib/usecases/appointments; persistence + collision retry in the adapter.

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

  try {
    const confirmation = await createBookingRequest(
      prismaDoctorReader,
      prismaAppointmentWriter,
      parsed.data,
    );
    return apiSuccess(confirmation, 201);
  } catch {
    return apiError(500, 'BOOKING_FAILED', 'تعذر تسجيل طلب الحجز، حاول مرة أخرى', 'Could not record booking request, please retry');
  }
}
