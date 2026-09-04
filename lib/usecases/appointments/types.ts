// Appointment use-case layer types. Framework-free: no Prisma, no Next.js.

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed';

/** Full lifecycle status incl. values only staff/persistence can produce. */
export type LiveAppointmentStatus = AppointmentStatus | 'in_queue' | 'no_show';

export type CancelReason =
  | 'patient_request'
  | 'clinic_decision'
  | 'duplicate'
  | 'rescheduled'
  | 'other';

/** Staff status update for one appointment (reception marks facts). */
export interface AppointmentStatusUpdate {
  status: 'cancelled' | 'no_show';
  reason?: CancelReason;
  note?: string;
}

export class AppointmentNotFoundError extends Error {
  constructor() {
    super('Appointment not found');
    this.name = 'AppointmentNotFoundError';
  }
}

export class InvalidStatusTransitionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStatusTransitionError';
  }
}

/** Fully-resolved status patch the adapter persists verbatim. */
export interface ResolvedStatusPatch {
  status: 'cancelled' | 'no_show';
  reason: CancelReason;
  note: string | null;
}

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

/** Raw list request from the staff dashboard (pre-normalization). */
export interface AppointmentListQuery {
  date?: string;
  status?: string;
  take?: number;
}

/** A calendar day in local time: [from, to). Null range = unbounded. */
export interface DayRange {
  from: Date | null;
  to: Date | null;
}

/** Validated, clamped list query the adapter executes verbatim. */
export interface NormalizedAppointmentQuery extends DayRange {
  status?: LiveAppointmentStatus;
  take: number;
}

/** One appointment row on the reception board. */
export interface AppointmentListItem {
  id: string;
  ticketNumber: string;
  date: Date;
  time: string;
  status: LiveAppointmentStatus;
  cancelReason: CancelReason | null;
  cancelNote: string | null;
  doctorDisplayNameAr: string | null;
  doctorDisplayNameEn: string | null;
  specialtyAr: string | null;
  specialtyEn: string | null;
}

export class InvalidAppointmentQueryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAppointmentQueryError';
  }
}
