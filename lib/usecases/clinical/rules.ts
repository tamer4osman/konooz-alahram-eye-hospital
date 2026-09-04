import type {
  CreateClinicalInput,
  PrescriptionItem,
  ResolvedClinicalCreate,
  ResolvedPrescriptionItem,
} from './types';

// Pure business rules.

/** Default clinical status when a visit is recorded without one. */
export const DEFAULT_CLINICAL_STATUS: ResolvedClinicalCreate['status'] = 'completed';

/** Default prescription drug category when not specified. */
export const DEFAULT_RX_CATEGORY: ResolvedPrescriptionItem['category'] = 'lubricant';

/** Default prescription eye coverage. */
export const DEFAULT_RX_EYE: ResolvedPrescriptionItem['eye'] = 'OU';

/** Synthesize a provisional patient id when none exists (snapshot model). */
export function synthesizePatientId(now: Date): string {
  return `PT-${now.getTime()}`;
}

/** Map wire gender to persistence enum; male default. */
export function resolveGender(gender: 'male' | 'female' | undefined): 'MALE' | 'FEMALE' {
  return gender === 'female' ? 'FEMALE' : 'MALE';
}

/** Apply per-item prescription defaults (category, eye, blank strings, empty tapering). */
export function resolvePrescription(rx: PrescriptionItem): ResolvedPrescriptionItem {
  return {
    drugNameAr: rx.drugNameAr ?? '',
    drugNameEn: rx.drugNameEn ?? null,
    category: rx.category ?? DEFAULT_RX_CATEGORY,
    eye: rx.eye ?? DEFAULT_RX_EYE,
    dosage: rx.dosage ?? '',
    frequency: rx.frequency ?? '',
    durationDays: rx.durationDays ?? 0,
    instructionsAr: rx.instructionsAr ?? null,
    instructionsEn: rx.instructionsEn ?? null,
    taperingSchedule: rx.taperingSchedule ?? [],
  };
}

/**
 * Resolve clinical create: provisional patientId synthesis, gender mapping,
 * visit date fallback to now, completed default status, per-prescription
 * defaults applied.
 */
export function resolveClinicalCreate(
  input: CreateClinicalInput,
  now: Date,
): ResolvedClinicalCreate {
  return {
    ticketNumber: input.ticketNumber ?? '',
    patientId: input.patientId ?? synthesizePatientId(now),
    patientNameAr: input.patientNameAr,
    patientNameEn: input.patientNameEn ?? null,
    patientAge: input.patientAge ?? null,
    patientGender: resolveGender(input.patientGender),
    patientPhone: input.patientPhone ?? '',
    doctorNameAr: input.doctorAr ?? '',
    doctorNameEn: input.doctorEn ?? null,
    clinicRoom: input.clinicRoom ?? '',
    visitDate: input.visitDate ?? null,
    visitTime: input.visitTime ?? '',
    status: input.status ?? DEFAULT_CLINICAL_STATUS,
    chiefComplaintAr: input.chiefComplaintAr ?? null,
    chiefComplaintEn: input.chiefComplaintEn ?? null,
    date: input.visitDate ? new Date(input.visitDate) : now,
    visualAcuityOD_Unaided: input.visualAcuityOD_Unaided ?? '',
    visualAcuityOD_BCVA: input.visualAcuityOD_BCVA ?? '',
    visualAcuityOS_Unaided: input.visualAcuityOS_Unaided ?? '',
    visualAcuityOS_BCVA: input.visualAcuityOS_BCVA ?? '',
    iopOD_mmHg: input.iopOD_mmHg ?? null,
    iopOS_mmHg: input.iopOS_mmHg ?? null,
    corneaAr: input.corneaAr ?? null,
    corneaEn: input.corneaEn ?? null,
    anteriorChamberAr: input.anteriorChamberAr ?? null,
    anteriorChamberEn: input.anteriorChamberEn ?? null,
    lensStatusAr: input.lensStatusAr ?? null,
    lensStatusEn: input.lensStatusEn ?? null,
    fundusMaculaAr: input.fundusMaculaAr ?? null,
    fundusMaculaEn: input.fundusMaculaEn ?? null,
    icdCode: input.icdCode ?? '',
    diagnosisAr: input.diagnosisAr ?? null,
    diagnosisEn: input.diagnosisEn ?? null,
    surgicalPlan: input.surgicalPlan ?? null,
    nextFollowUpDate: input.nextFollowUpDate ?? null,
    prescriptions: input.prescriptions?.map(resolvePrescription),
  };
}
