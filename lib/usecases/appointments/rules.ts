import type {
  AppointmentListQuery,
  AppointmentRequestData,
  AppointmentStatusUpdate,
  BookingConfirmation,
  DayRange,
  DoctorLookupResult,
  LiveAppointmentStatus,
  NormalizedAppointmentQuery,
  ResolvedAppointmentCreate,
  ResolvedStatusPatch,
} from './types';
import { InvalidAppointmentQueryError, InvalidStatusTransitionError } from './types';

// Pure business rules. No framework, no I/O — fully unit-testable.

/** 6-digit booking ticket: BK-XXXXXX (collision resolved by writer retry). */
export function generateTicket(): string {
  return `BK-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Booking-time snapshot rule: doctor identity is copied onto the appointment
 * so the record stays historically accurate even if the doctor row changes
 * later (documented 3NF exception). Unknown doctorId yields nulls.
 */
export function resolveDoctorSnapshot(
  doctorId: string | undefined,
  lookup: DoctorLookupResult,
): DoctorLookupResult {
  if (!doctorId || !lookup) return null;
  return lookup;
}

/**
 * Resolve the appointment date: caller's preferred date if given, otherwise
 * +7 days from now (public requests without a date get the next week).
 */
export function resolveAppointmentDate(
  preferredDate: string | undefined,
  now: Date,
): Date {
  if (preferredDate) return new Date(preferredDate);
  const fallback = new Date(now);
  fallback.setDate(fallback.getDate() + 7);
  return fallback;
}

/**
 * Specialty display: doctor's specialty when known; otherwise the condition
 * title carries it (patient self-describes their complaint).
 */
export function resolveSpecialty(
  snapshot: DoctorLookupResult,
  input: AppointmentRequestData,
): { specialtyAr: string | null; specialtyEn: string | null } {
  return {
    specialtyAr: snapshot?.specialtyAr ?? input.conditionTitleAr ?? null,
    specialtyEn: snapshot?.specialtyEn ?? input.conditionTitleEn ?? null,
  };
}

/**
 * Honest instructions: reception confirms via WhatsApp — the site never
 * promises automatic delivery. Fixed bilingual copy, single source.
 */
export const BOOKING_INSTRUCTIONS = {
  instructionsAr: 'يرجى الحضور قبل الموعد بـ 15 دقيقة. يؤكد موظف الاستقبال الموعد عبر واتساب.',
  instructionsEn: 'Please arrive 15 minutes early. Reception confirms the slot via WhatsApp.',
} as const;

export const BOOKING_LOCATION = {
  locationAr: 'مستشفى كنوز الأهرام لطب وجراحة العيون - بنغازي',
  locationEn: 'Konooz Al-Ahram Eye Hospital - Benghazi',
} as const;

/** Compose the full persistable record from rules + static copy. */
export function resolveAppointmentCreate(
  input: AppointmentRequestData,
  snapshot: DoctorLookupResult,
  now: Date,
): ResolvedAppointmentCreate {
  const date = resolveAppointmentDate(input.preferredDate, now);
  const specialty = resolveSpecialty(snapshot, input);
  return {
    ticketNumber: generateTicket(),
    date,
    time: input.preferredTime ?? '09:00',
    status: 'scheduled',
    source: 'PATIENT_REQUEST',
    doctorDisplayNameAr: snapshot?.displayNameAr ?? null,
    doctorDisplayNameEn: snapshot?.displayNameEn ?? null,
    specialtyAr: specialty.specialtyAr,
    specialtyEn: specialty.specialtyEn,
    ...BOOKING_INSTRUCTIONS,
    ...BOOKING_LOCATION,
    intakeData: input.intakeData,
  };
}

/** Public response shape: reference + honest pending status. Nothing more. */
export function toBookingConfirmation(ticketNumber: string): BookingConfirmation {
  return { ref: ticketNumber, status: 'pending_reception' };
}

/**
 * Status transitions staff may mark. `completed` is deliberately NOT settable
 * through this round's PATCH (consultation flow owns completion) — only
 * cancellations and no-shows, which is what reception records. Terminal
 * states (completed, cancelled, no_show) reject further changes so reports
 * stay truthful.
 */
const ALLOWED_FROM: ReadonlySet<LiveAppointmentStatus> = new Set(['scheduled', 'confirmed']);

/**
 * List-query bounds. Only statuses staff can actually see on the board are
 * accepted — anything else means a client bug, not a data state.
 */
const LISTABLE_STATUSES: ReadonlySet<string> = new Set([
  'scheduled',
  'confirmed',
  'cancelled',
  'completed',
  'in_queue',
  'no_show',
]);

const APPOINTMENT_LIST_MAX_TAKE = 200;

/** Strict local-time day: 'YYYY-MM-DD' -> [that midnight, next midnight). */
export function resolveDayRange(date: string | undefined): DayRange {
  if (!date) return { from: null, to: null };
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) {
    throw new InvalidAppointmentQueryError(`Invalid date '${date}' — expected YYYY-MM-DD`);
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const from = new Date(year, month - 1, day);
  // Reject rolled-over dates (e.g. 2026-02-30 -> March 2).
  if (from.getFullYear() !== year || from.getMonth() !== month - 1 || from.getDate() !== day) {
    throw new InvalidAppointmentQueryError(`Invalid calendar date '${date}'`);
  }
  const to = new Date(year, month - 1, day + 1);
  return { from, to };
}

export function normalizeAppointmentQuery(
  input: AppointmentListQuery,
): NormalizedAppointmentQuery {
  if (input.status !== undefined && !LISTABLE_STATUSES.has(input.status)) {
    throw new InvalidAppointmentQueryError(`Unknown appointment status '${input.status}'`);
  }
  const takeRaw = input.take ?? APPOINTMENT_LIST_MAX_TAKE;
  const take = Math.min(Math.max(Math.trunc(takeRaw), 1), APPOINTMENT_LIST_MAX_TAKE);
  const { from, to } = resolveDayRange(input.date);
  return {
    from,
    to,
    status: input.status as NormalizedAppointmentQuery['status'],
    take,
  };
}

export function resolveStatusPatch(
  input: AppointmentStatusUpdate,
  current: LiveAppointmentStatus,
): ResolvedStatusPatch {
  if (!ALLOWED_FROM.has(current)) {
    throw new InvalidStatusTransitionError(
      `Cannot change status from '${current}' — only scheduled/confirmed appointments can be cancelled or marked no-show`,
    );
  }
  if (!input.reason) {
    throw new InvalidStatusTransitionError('A cancellation reason is required');
  }
  return {
    status: input.status,
    reason: input.reason,
    note: input.note?.trim() ? input.note.trim() : null,
  };
}
