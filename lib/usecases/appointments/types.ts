// Appointment use-case layer types. Framework-free: no Prisma, no Next.js.

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed';

export interface DoctorSnapshot {
  displayNameAr: string | null;
  displayNameEn: string | null;
  specialtyAr: string | null;
  specialtyEn: string | null;
}

export interface AppointmentRequestData {
  doctorId?: string;
  preferredDate?: string;
  preferredTime?: string;
  conditionTitleAr?: string;
  conditionTitleEn?: string;
  intakeData?: Record<string, unknown>;
}

/** Doctor identity resolved by the doctor-reader port. */
export type DoctorLookupResult = DoctorSnapshot | null;

/** Fully-resolved appointment create payload the adapter persists verbatim. */
export interface ResolvedAppointmentCreate {
  ticketNumber: string;
  date: Date;
  time: string;
  status: AppointmentStatus;
  source: 'PATIENT_REQUEST';
  doctorDisplayNameAr: string | null;
  doctorDisplayNameEn: string | null;
  specialtyAr: string | null;
  specialtyEn: string | null;
  instructionsAr: string;
  instructionsEn: string;
  locationAr: string;
  locationEn: string;
  intakeData?: Record<string, unknown>;
}

/** What the public booking response exposes — nothing more (honest data model). */
export interface BookingConfirmation {
  ref: string;
  status: 'pending_reception';
}
