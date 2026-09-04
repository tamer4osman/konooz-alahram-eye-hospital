import type {
  AppointmentRequestData,
  BookingConfirmation,
  DoctorLookupResult,
  ResolvedAppointmentCreate,
} from './types';

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
