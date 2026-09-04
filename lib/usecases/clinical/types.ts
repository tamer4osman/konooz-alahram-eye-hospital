export type ClinicalStatus = 'completed' | 'in_progress' | 'waiting' | 'referred_to_surgery';

export type PrescriptionCategory =
  | 'antibiotic'
  | 'steroid'
  | 'nsaid'
  | 'glaucoma'
  | 'lubricant'
  | 'mydriatic';

export type PrescriptionEye = 'OD' | 'OS' | 'OU';

export interface PrescriptionItem {
  drugNameAr?: string;
  drugNameEn?: string;
  category?: PrescriptionCategory;
  eye?: PrescriptionEye;
  dosage?: string;
  frequency?: string;
  durationDays?: number;
  instructionsAr?: string;
  instructionsEn?: string;
  taperingSchedule?: string[];
}

/** Prescription defaults applied per item by the rules layer. */
export interface ResolvedPrescriptionItem {
  drugNameAr: string;
  drugNameEn: string | null;
  category: PrescriptionCategory;
  eye: PrescriptionEye;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructionsAr: string | null;
  instructionsEn: string | null;
  taperingSchedule: string[];
}

export interface CreateClinicalInput {
  ticketNumber?: string;
  patientId?: string;
  patientNameAr: string;
  patientNameEn?: string;
  patientAge?: number;
  patientGender?: 'male' | 'female';
  patientPhone?: string;
  doctorAr?: string;
  doctorEn?: string;
  clinicRoom?: string;
  visitDate?: string;
  visitTime?: string;
  status?: ClinicalStatus;
  chiefComplaintAr?: string;
  chiefComplaintEn?: string;
  visualAcuityOD_Unaided?: string;
  visualAcuityOD_BCVA?: string;
  visualAcuityOS_Unaided?: string;
  visualAcuityOS_BCVA?: string;
  iopOD_mmHg?: number;
  iopOS_mmHg?: number;
  corneaAr?: string;
  corneaEn?: string;
  anteriorChamberAr?: string;
  anteriorChamberEn?: string;
  lensStatusAr?: string;
  lensStatusEn?: string;
  fundusMaculaAr?: string;
  fundusMaculaEn?: string;
  icdCode?: string;
  diagnosisAr?: string;
  diagnosisEn?: string;
  surgicalPlan?: string;
  nextFollowUpDate?: string;
  prescriptions?: PrescriptionItem[];
}

export interface ResolvedClinicalCreate {
  ticketNumber: string;
  patientId: string;
  patientNameAr: string;
  patientNameEn: string | null;
  patientAge: number | null;
  patientGender: 'MALE' | 'FEMALE';
  patientPhone: string;
  doctorNameAr: string;
  doctorNameEn: string | null;
  clinicRoom: string;
  visitDate: string | null;
  visitTime: string;
  status: ClinicalStatus;
  chiefComplaintAr: string | null;
  chiefComplaintEn: string | null;
  date: Date;
  visualAcuityOD_Unaided: string;
  visualAcuityOD_BCVA: string;
  visualAcuityOS_Unaided: string;
  visualAcuityOS_BCVA: string;
  iopOD_mmHg: number | null;
  iopOS_mmHg: number | null;
  corneaAr: string | null;
  corneaEn: string | null;
  anteriorChamberAr: string | null;
  anteriorChamberEn: string | null;
  lensStatusAr: string | null;
  lensStatusEn: string | null;
  fundusMaculaAr: string | null;
  fundusMaculaEn: string | null;
  icdCode: string;
  diagnosisAr: string | null;
  diagnosisEn: string | null;
  surgicalPlan: string | null;
  nextFollowUpDate: string | null;
  prescriptions?: ResolvedPrescriptionItem[];
}
