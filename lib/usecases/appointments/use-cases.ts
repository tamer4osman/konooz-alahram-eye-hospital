import type { AppointmentRequestData, BookingConfirmation } from './types';
import type { AppointmentWriter, DoctorReader } from './ports';
import { resolveAppointmentCreate, resolveDoctorSnapshot } from './rules';

// Use case: orchestration only. Business rules live in rules.ts; ports are
// injected as first arguments. Errors propagate unchanged — the route handler
// maps them onto HTTP responses.

export async function createBookingRequest(
  doctors: DoctorReader,
  writer: AppointmentWriter,
  input: AppointmentRequestData,
  now: Date = new Date(),
  maxAttempts = 5,
): Promise<BookingConfirmation> {
  const snapshot = input.doctorId
    ? resolveDoctorSnapshot(input.doctorId, await doctors.findSnapshot(input.doctorId))
    : null;

  const resolved = resolveAppointmentCreate(input, snapshot, now);
  const ticketNumber = await writer.createWithRetry(resolved, maxAttempts);
  return { ref: ticketNumber, status: 'pending_reception' };
}
