import type { BedPatch, CreateBedInput, ResolvedBedCreate } from './types';

// Pure business rules.

/** Resolve bed create: empty-string defaults for missing bilingual ward names. */
export function resolveBedCreate(input: CreateBedInput): ResolvedBedCreate {
  return {
    bedNumber: input.bedNumber,
    wardType: input.wardType,
    wardNameAr: input.wardNameAr ?? '',
    wardNameEn: input.wardNameEn ?? null,
    floorAr: input.floorAr ?? '',
    floorEn: input.floorEn ?? null,
    nurseInChargeAr: input.nurseInChargeAr ?? null,
    nurseInChargeEn: input.nurseInChargeEn ?? null,
  };
}

/** Fields cleared when a bed is marked ready_clean (occupant release + vitals reset). */
export const OCCUPANT_FIELDS = {
  patientId: null,
  patientNameAr: null,
  patientNameEn: null,
  patientAge: null,
  assignedDoctorAr: null,
  assignedDoctorEn: null,
  surgeryPerformedAr: null,
  surgeryPerformedEn: null,
  admissionTime: null,
  estimatedDischargeTime: null,
  bloodPressure: null,
  heartRateBpm: null,
  spO2Percent: null,
  tempCelsius: null,
  painScore: null,
} as const;

/**
 * Bed status rule: marking a bed ready_clean releases its occupant and
 * clears all vitals. Any explicit caller-supplied occupant fields on the
 * same patch are discarded — the status transition is authoritative.
 */
export function resolveBedPatch(patch: BedPatch): BedPatch {
  if (patch.status === 'ready_clean') {
    return { ...patch, ...OCCUPANT_FIELDS };
  }
  return { ...patch };
}
