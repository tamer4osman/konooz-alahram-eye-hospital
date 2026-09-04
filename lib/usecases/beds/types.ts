export type BedStatus = 'occupied' | 'ready_clean' | 'dirty_cleaning' | 'reserved';

export type WardType = 'pacu_recovery' | 'daycare_suite' | 'vip_inpatient';

export interface CreateBedInput {
  bedNumber: string;
  wardType: WardType;
  wardNameAr?: string;
  wardNameEn?: string;
  floorAr?: string;
  floorEn?: string;
  nurseInChargeAr?: string;
  nurseInChargeEn?: string;
}

export interface BedPatch {
  status?: BedStatus;
  bloodPressure?: string | null;
  heartRateBpm?: number | null;
  spO2Percent?: number | null;
  tempCelsius?: number | null;
  painScore?: number | null;
  patientId?: string | null;
  patientNameAr?: string | null;
  patientNameEn?: string | null;
  patientAge?: number | null;
  assignedDoctorAr?: string | null;
  assignedDoctorEn?: string | null;
  surgeryPerformedAr?: string | null;
  surgeryPerformedEn?: string | null;
  admissionTime?: string | null;
  estimatedDischargeTime?: string | null;
  nurseInChargeAr?: string | null;
  nurseInChargeEn?: string | null;
}

export class BedNotFoundError extends Error {
  constructor() {
    super('Bed not found');
    this.name = 'BedNotFoundError';
  }
}

export class BedConflictError extends Error {
  constructor() {
    super('Bed number already exists');
    this.name = 'BedConflictError';
  }
}

/** Fully-resolved create payload the adapter persists verbatim. */
export interface ResolvedBedCreate {
  bedNumber: string;
  wardType: WardType;
  wardNameAr: string;
  wardNameEn: string | null;
  floorAr: string;
  floorEn: string | null;
  nurseInChargeAr: string | null;
  nurseInChargeEn: string | null;
}
