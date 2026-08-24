
export type StaffCategory = 'surgeon' | 'consultant' | 'resident' | 'nurse' | 'technician' | 'admin';
export type StaffStatus = 'on_duty' | 'in_surgery' | 'on_call' | 'break' | 'off_duty';

export interface HospitalStaff {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  category: StaffCategory;
  departmentAr: string;
  departmentEn: string;
  status: StaffStatus;
  roomAssignedAr: string;
  roomAssignedEn: string;
  shift: string;
  patientCountToday: number;
  surgeriesCountToday: number;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
}


export type RoomType = 'operating_theater' | 'outpatient_clinic' | 'diagnostic_suite' | 'recovery_ward' | 'laser_room';
export type RoomStatus = 'occupied_surgery' | 'in_consultation' | 'ready_clean' | 'sterilizing' | 'maintenance';

export interface HospitalRoom {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  type: RoomType;
  floorAr: string;
  floorEn: string;
  status: RoomStatus;
  currentDoctorAr?: string;
  currentDoctorEn?: string;
  currentPatientId?: string;
  currentProcedureAr?: string;
  currentProcedureEn?: string;
  sterilizationStatus: 'sterile_verified' | 'in_progress' | 'required';
  airPressureHepa: 'positive_optimal' | 'standard' | 'warning';
  tempCelsius: number;
  humidityPercent: number;
  capacity: number;
  occupiedCount: number;
  mainDeviceAssignedAr: string;
  mainDeviceAssignedEn: string;
}

export type DeviceStatus = 'operational' | 'in_use' | 'under_calibration' | 'maintenance_scheduled' | 'offline_alert';

export interface HospitalEquipment {
  id: string;
  nameAr: string;
  nameEn: string;
  brand: string;
  model: string;
  serialNumber: string;
  departmentAr: string;
  departmentEn: string;
  roomCode: string;
  status: DeviceStatus;
  uptimePercentage: number;
  totalProceduresRun: number;
  lastMaintenanceDate: string;
  nextServiceDue: string;
  firmwareVersion: string;
  technicianInChargeAr: string;
  technicianInChargeEn: string;
  healthScore: number; // 0 - 100
  notesAr: string;
  notesEn: string;
}

export interface ScheduledSurgery {
  id: string;
  patientNameAr: string;
  patientNameEn: string;
  patientPhone: string;
  patientAge: number;
  gender: 'male' | 'female';
  surgeonAr: string;
  surgeonEn: string;
  procedureAr: string;
  procedureEn: string;
  specialtyId: string;
  roomCode: string;
  time: string;
  estimatedDurationMin: number;
  priority: 'urgent' | 'elective' | 'high_priority';
  status: 'pre_op_prep' | 'in_or' | 'post_op_recovery' | 'completed' | 'scheduled';
  anesthesiaTypeAr: string;
  anesthesiaTypeEn: string;
}

export type ShiftType = 'morning' | 'evening' | 'night_call' | 'full_day';
export type AttendanceStatus =
  | 'present_ontime'
  | 'present_late'
  | 'in_surgery'
  | 'on_break'
  | 'on_call'
  | 'leave_authorized'
  | 'absent';

export interface StaffAttendanceRecord {
  id: string;
  staffId: string;
  staffNameAr: string;
  staffNameEn: string;
  roleAr: string;
  roleEn: string;
  avatar: string;
  category: StaffCategory;
  departmentAr: string;
  departmentEn: string;
  shiftType: ShiftType;
  shiftNameAr: string;
  shiftNameEn: string;
  shiftTiming: string;
  scheduledTime: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  punctualityMinutes: number; // 0 = exactly on time, negative = late (e.g. -15), positive = early (e.g. +10)
  overtimeHours: number;
  monthlyAttendanceRate: number; // percentage, e.g. 98.5
  badgeCode: string;
  notesAr: string;
  notesEn: string;
}

export type ConsumableCategory = 'iol_lens' | 'viscoelastic' | 'laser_pack' | 'surgical_gas' | 'microsuture' | 'phaco_pack';

export interface SurgicalConsumable {
  id: string;
  nameAr: string;
  nameEn: string;
  category: ConsumableCategory;
  brand: string;
  stockCurrent: number;
  stockMinThreshold: number;
  unitAr: string;
  unitEn: string;
  reorderStatus: 'optimal' | 'low_stock' | 'reorder_placed';
  batchLot: string;
  expiryDate: string;
  locationAr: string;
  locationEn: string;
  unitCostLYD: number;
}

export interface PatientFlowStage {
  id: string;
  stageCode: 'triage' | 'diagnostics' | 'consultation' | 'pre_op' | 'in_or' | 'pacu' | 'discharge';
  titleAr: string;
  titleEn: string;
  count: number;
  avgTimeMin: number;
  benchmarkMin: number;
  status: 'normal' | 'busy' | 'smooth';
  color: string;
}

// ============================================================================
// 5. BAHMNI CLINICAL CONSULTATION & OPHTHALMIC EMR DATA
// ============================================================================

export interface OphthalmicPrescriptionItem {
  id: string;
  drugNameAr: string;
  drugNameEn: string;
  category: 'antibiotic' | 'steroid' | 'nsaid' | 'glaucoma' | 'lubricant' | 'mydriatic';
  eye: 'OD' | 'OS' | 'OU'; // Right, Left, Both
  dosage: string;
  frequency: string;
  durationDays: number;
  instructionsAr: string;
  instructionsEn: string;
  taperingSchedule?: string[];
}

export interface ClinicalConsultationRecord {
  id: string;
  ticketNumber: string;
  patientId: string;
  patientNameAr: string;
  patientNameEn: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  patientPhone: string;
  doctorAr: string;
  doctorEn: string;
  clinicRoom: string;
  visitDate: string;
  visitTime: string;
  status: 'completed' | 'in_progress' | 'waiting' | 'referred_to_surgery';
  
  // Ophthalmic Clinical Examination (OpenMRS Ophthalmic Template)
  chiefComplaintAr: string;
  chiefComplaintEn: string;
  
  // Visual Acuity
  visualAcuityOD_Unaided: string; // e.g. "6/60"
  visualAcuityOD_BCVA: string;    // e.g. "6/6"
  visualAcuityOS_Unaided: string;
  visualAcuityOS_BCVA: string;

  // Tonometry (IOP in mmHg)
  iopOD_mmHg: number;
  iopOS_mmHg: number;

  // Slit Lamp & Fundus Exam
  corneaAr: string;
  corneaEn: string;
  anteriorChamberAr: string;
  anteriorChamberEn: string;
  lensStatusAr: string;
  lensStatusEn: string;
  fundusMaculaAr: string;
  fundusMaculaEn: string;

  // ICD-10 Diagnosis
  icdCode: string;
  diagnosisAr: string;
  diagnosisEn: string;
  surgicalPlan?: string;

  // e-Prescription (Medications)
  prescriptions: OphthalmicPrescriptionItem[];
  nextFollowUpDate: string;
}

export type BedStatus = 'occupied' | 'ready_clean' | 'dirty_cleaning' | 'reserved';
export type WardType = 'pacu_recovery' | 'daycare_suite' | 'vip_inpatient';

export interface HospitalBed {
  id: string;
  bedNumber: string;
  wardType: WardType;
  wardNameAr: string;
  wardNameEn: string;
  floorAr: string;
  floorEn: string;
  status: BedStatus;
  
  // Patient details if occupied
  patientId?: string;
  patientNameAr?: string;
  patientNameEn?: string;
  patientAge?: number;
  assignedDoctorAr?: string;
  assignedDoctorEn?: string;
  surgeryPerformedAr?: string;
  surgeryPerformedEn?: string;
  admissionTime?: string;
  estimatedDischargeTime?: string;
  
  // Telemetry Vital Signs
  bloodPressure?: string;    // e.g. "120/80"
  heartRateBpm?: number;     // e.g. 72
  spO2Percent?: number;      // e.g. 99
  tempCelsius?: number;      // e.g. 36.8
  painScore?: number;        // 1 to 10 scale
  nurseInChargeAr?: string;
  nurseInChargeEn?: string;
}

export interface InsuranceProviderInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  coveragePercentage: number;
  preAuthRequired: boolean;
  contactDesk: string;
  logo: string;
}

export interface HospitalBillingInvoice {
  id: string;
  invoiceNumber: string;
  ticketNumber: string;
  patientNameAr: string;
  patientNameEn: string;
  procedureAr: string;
  procedureEn: string;
  insuranceNameAr: string;
  insuranceNameEn: string;
  dateIssued: string;
  
  // Cost breakdown in LYD (Libyan Dinar)
  surgeonFeeLYD: number;
  orFacilityFeeLYD: number;
  anesthesiaFeeLYD: number;
  lensOrDeviceFeeLYD: number;
  consumablesFeeLYD: number;
  totalGrossLYD: number;
  insuranceCoveredLYD: number;
  patientCoPayLYD: number;
  
  status: 'paid' | 'pending_insurance' | 'pre_auth_approved' | 'draft';
}

export interface DiagnosticPacsOrder {
  id: string;
  orderNumber: string;
  ticketNumber: string;
  patientNameAr: string;
  patientNameEn: string;
  scanTypeAr: string;
  scanTypeEn: string;
  deviceUsed: string;
  orderingDoctorAr: string;
  orderingDoctorEn: string;
  technicianAr: string;
  technicianEn: string;
  status: 'completed' | 'in_scan' | 'pending';
  findingsSummaryAr: string;
  findingsSummaryEn: string;
  timeCompleted: string;
  imageThumbnail: string;
}

