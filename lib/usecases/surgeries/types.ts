export type SurgeryStatus =
  | 'scheduled'
  | 'in_progress'
  | 'pre_op_prep'
  | 'in_or'
  | 'post_op_recovery'
  | 'completed'
  | 'cancelled';

export type SurgeryPriority = 'urgent' | 'elective' | 'high_priority';

export interface CreateSurgeryInput {
  patientNameAr?: string;
  patientNameEn?: string;
  patientPhone?: string;
  patientAge?: number;
  gender?: 'male' | 'female';
  surgeonAr?: string;
  surgeonEn?: string;
  procedureAr?: string;
  procedureEn?: string;
  specialtyId?: string;
  roomCode?: string;
  time?: string;
  estimatedDurationMin?: number;
  priority?: SurgeryPriority;
  anesthesiaTypeAr?: string;
  anesthesiaTypeEn?: string;
}

export interface SurgeryPatch {
  status?: SurgeryStatus;
  roomCode?: string;
  time?: string;
  notesAr?: string | null;
  notesEn?: string | null;
}

export class SurgeryNotFoundError extends Error {
  constructor() {
    super('Surgery not found');
    this.name = 'SurgeryNotFoundError';
  }
}

export class SurgeryNameRequiredError extends Error {
  constructor() {
    super('Surgery requires a patient name in at least one language');
    this.name = 'SurgeryNameRequiredError';
  }
}

/** Fully-resolved create payload the adapter persists verbatim. */
export interface ResolvedSurgeryCreate {
  procedureAr: string;
  procedureEn: string | null;
  scheduledAt: Date;
  durationMin: number;
  status: 'scheduled';
  patientNameAr: string;
  patientNameEn: string | null;
  patientPhone: string;
  patientAge: number | null;
  gender: 'MALE' | 'FEMALE';
  surgeonNameAr: string;
  surgeonNameEn: string | null;
  specialtyId: string;
  roomCode: string;
  time: string;
  priority: SurgeryPriority;
  anesthesiaTypeAr: string;
  anesthesiaTypeEn: string | null;
}
