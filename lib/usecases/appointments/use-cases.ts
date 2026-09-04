import type { AppointmentRequestData, BookingConfirmation, AppointmentStatusUpdate } from './types';
import type {
  AppointmentStatusReader,
  AppointmentStatusWriter,
  AppointmentWriter,
  DoctorReader,
} from './ports';
import { resolveAppointmentCreate, resolveDoctorSnapshot, resolveStatusPatch } from './rules';
import { AppointmentNotFoundError } from './types';

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

/**
 * Reception marks a lifecycle fact (cancelled / no-show) on one appointment.
 * Current status is read through the port so transition rules stay pure.
 */
export async function markAppointmentStatus(
  reader: AppointmentStatusReader,
  writer: AppointmentStatusWriter,
  id: string,
  input: AppointmentStatusUpdate,
): Promise<void> {
  const current = await reader.findStatus(id);
  if (!current) throw new AppointmentNotFoundError();
  const resolved = resolveStatusPatch(input, current);
  await writer.applyStatusPatch(id, resolved);
}
