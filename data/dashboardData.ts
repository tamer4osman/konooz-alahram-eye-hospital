
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

export const ANALYTICS_DATA = {
  day: {
    periodLabelAr: 'اليوم (الإثنين - البيانات اللحظية)',
    periodLabelEn: 'Today (Monday - Real-Time Live Feed)',
    kpis: {
      surgeriesCount: 18,
      surgeriesGrowth: '+12.5%',
      consultationsCount: 86,
      consultationsGrowth: '+8.0%',
      diagnosticScans: 64,
      scansGrowth: '+15.2%',
      orUtilizationRate: 91.4,
      orUtilizationGrowth: '+3.1%',
      patientSatisfaction: 98.6,
      averageWaitTimeMin: 14,
      revenueLYD: 48500,
      revenueGrowth: '+10.4%'
    },
    hourlyTimeline: [
      { time: '08:00', consultations: 8, surgeries: 2, scans: 4, orOccupancy: 70 },
      { time: '09:00', consultations: 14, surgeries: 4, scans: 9, orOccupancy: 95 },
      { time: '10:00', consultations: 18, surgeries: 4, scans: 11, orOccupancy: 100 },
      { time: '11:00', consultations: 15, surgeries: 3, scans: 10, orOccupancy: 92 },
      { time: '12:00', consultations: 10, surgeries: 2, scans: 8, orOccupancy: 85 },
      { time: '13:00', consultations: 6, surgeries: 1, scans: 5, orOccupancy: 60 },
      { time: '14:00', consultations: 8, surgeries: 1, scans: 6, orOccupancy: 75 },
      { time: '15:00', consultations: 12, surgeries: 2, scans: 8, orOccupancy: 90 },
      { time: '16:00', consultations: 16, surgeries: 2, scans: 9, orOccupancy: 95 },
      { time: '17:00', consultations: 14, surgeries: 1, scans: 7, orOccupancy: 80 },
      { time: '18:00', consultations: 10, surgeries: 0, scans: 5, orOccupancy: 50 },
      { time: '19:00', consultations: 5, surgeries: 0, scans: 2, orOccupancy: 30 }
    ],
    departmentWorkload: [
      { nameAr: 'جراحة الشبكية والجسم الزجاجي', nameEn: 'Vitreoretinal Surgery', count: 6, color: '#0C2340' },
      { nameAr: 'القرنية وتصحيح الإبصار (ليزك)', nameEn: 'Cornea & LASIK', count: 7, color: '#0D9488' },
      { nameAr: 'المياه البيضاء وزراعة العدسات', nameEn: 'Cataract & Premium IOL', count: 5, color: '#F59E0B' },
      { nameAr: 'عيون الأطفال وجراحة الحول', nameEn: 'Pediatric & Strabismus', count: 3, color: '#6366F1' },
      { nameAr: 'تجميل الجفون ومجرى الدمع', nameEn: 'Oculoplastics', count: 2, color: '#EC4899' },
      { nameAr: 'المياه الزرقاء (الجلوكوما)', nameEn: 'Glaucoma Management', count: 2, color: '#10B981' }
    ]
  },

  week: {
    periodLabelAr: 'هذا الأسبوع (السبت - الجمعة)',
    periodLabelEn: 'This Week (Saturday - Friday)',
    kpis: {
      surgeriesCount: 112,
      surgeriesGrowth: '+14.2%',
      consultationsCount: 540,
      consultationsGrowth: '+9.5%',
      diagnosticScans: 410,
      scansGrowth: '+11.8%',
      orUtilizationRate: 88.7,
      orUtilizationGrowth: '+4.5%',
      patientSatisfaction: 98.4,
      averageWaitTimeMin: 15,
      revenueLYD: 312000,
      revenueGrowth: '+12.1%'
    },
    daysTimeline: [
      { dayAr: 'السبت', dayEn: 'Sat', surgeries: 19, consultations: 92, scans: 68, revenue: 52000 },
      { dayAr: 'الأحد', dayEn: 'Sun', surgeries: 21, consultations: 98, scans: 74, revenue: 58000 },
      { dayAr: 'الإثنين', dayEn: 'Mon', surgeries: 18, consultations: 86, scans: 64, revenue: 48500 },
      { dayAr: 'الثلاثاء', dayEn: 'Tue', surgeries: 22, consultations: 104, scans: 78, revenue: 61000 },
      { dayAr: 'الأربعاء', dayEn: 'Wed', surgeries: 17, consultations: 88, scans: 66, revenue: 47000 },
      { dayAr: 'الخميس', dayEn: 'Thu', surgeries: 15, consultations: 72, scans: 60, revenue: 45500 },
      { dayAr: 'الجمعة', dayEn: 'Fri', surgeries: 4, consultations: 20, scans: 12, revenue: 14000 }
    ],
    departmentWorkload: [
      { nameAr: 'جراحة الشبكية والجسم الزجاجي', nameEn: 'Vitreoretinal Surgery', count: 34, color: '#0C2340' },
      { nameAr: 'القرنية وتصحيح الإبصار (ليزك)', nameEn: 'Cornea & LASIK', count: 38, color: '#0D9488' },
      { nameAr: 'المياه البيضاء وزراعة العدسات', nameEn: 'Cataract & Premium IOL', count: 28, color: '#F59E0B' },
      { nameAr: 'عيون الأطفال وجراحة الحول', nameEn: 'Pediatric & Strabismus', count: 16, color: '#6366F1' },
      { nameAr: 'تجميل الجفون ومجرى الدمع', nameEn: 'Oculoplastics', count: 12, color: '#EC4899' },
      { nameAr: 'المياه الزرقاء (الجلوكوما)', nameEn: 'Glaucoma Management', count: 14, color: '#10B981' }
    ]
  },

  month: {
    periodLabelAr: 'هذا الشهر (أغسطس 2026)',
    periodLabelEn: 'This Month (August 2026)',
    kpis: {
      surgeriesCount: 468,
      surgeriesGrowth: '+18.6%',
      consultationsCount: 2280,
      consultationsGrowth: '+13.2%',
      diagnosticScans: 1740,
      scansGrowth: '+16.0%',
      orUtilizationRate: 89.2,
      orUtilizationGrowth: '+5.2%',
      patientSatisfaction: 98.7,
      averageWaitTimeMin: 13,
      revenueLYD: 1295000,
      revenueGrowth: '+15.8%'
    },
    weeksTimeline: [
      { weekAr: 'الأسبوع 1', weekEn: 'Week 1', surgeries: 108, consultations: 520, scans: 390, revenue: 295000 },
      { weekAr: 'الأسبوع 2', weekEn: 'Week 2', surgeries: 118, consultations: 575, scans: 440, revenue: 328000 },
      { weekAr: 'الأسبوع 3', weekEn: 'Week 3', surgeries: 124, consultations: 605, scans: 465, revenue: 346000 },
      { weekAr: 'الأسبوع 4 (النشط)', weekEn: 'Week 4 (Active)', surgeries: 118, consultations: 580, scans: 445, revenue: 326000 }
    ],
    departmentWorkload: [
      { nameAr: 'جراحة الشبكية والجسم الزجاجي', nameEn: 'Vitreoretinal Surgery', count: 142, color: '#0C2340' },
      { nameAr: 'القرنية وتصحيح الإبصار (ليزك)', nameEn: 'Cornea & LASIK', count: 165, color: '#0D9488' },
      { nameAr: 'المياه البيضاء وزراعة العدسات', nameEn: 'Cataract & Premium IOL', count: 115, color: '#F59E0B' },
      { nameAr: 'عيون الأطفال وجراحة الحول', nameEn: 'Pediatric & Strabismus', count: 62, color: '#6366F1' },
      { nameAr: 'تجميل الجفون ومجرى الدمع', nameEn: 'Oculoplastics', count: 48, color: '#EC4899' },
      { nameAr: 'المياه الزرقاء (الجلوكوما)', nameEn: 'Glaucoma Management', count: 54, color: '#10B981' }
    ]
  },

  year: {
    periodLabelAr: 'هذا العام (2026 - سنوي متراكم)',
    periodLabelEn: 'This Year (2026 Cumulative Overview)',
    kpis: {
      surgeriesCount: 4850,
      surgeriesGrowth: '+24.5%',
      consultationsCount: 24100,
      consultationsGrowth: '+19.8%',
      diagnosticScans: 18900,
      scansGrowth: '+21.4%',
      orUtilizationRate: 90.1,
      orUtilizationGrowth: '+6.8%',
      patientSatisfaction: 98.9,
      averageWaitTimeMin: 12,
      revenueLYD: 13450000,
      revenueGrowth: '+22.0%'
    },
    monthsTimeline: [
      { monthAr: 'يناير', monthEn: 'Jan', surgeries: 360, consultations: 1820, scans: 1410, revenue: 990000 },
      { monthAr: 'فبراير', monthEn: 'Feb', surgeries: 385, consultations: 1910, scans: 1490, revenue: 1060000 },
      { monthAr: 'مارس', monthEn: 'Mar', surgeries: 410, consultations: 2050, scans: 1600, revenue: 1140000 },
      { monthAr: 'أبريل', monthEn: 'Apr', surgeries: 390, consultations: 1960, scans: 1530, revenue: 1080000 },
      { monthAr: 'مايو', monthEn: 'May', surgeries: 425, consultations: 2120, scans: 1680, revenue: 1180000 },
      { monthAr: 'يونيو', monthEn: 'Jun', surgeries: 440, consultations: 2200, scans: 1740, revenue: 1220000 },
      { monthAr: 'يوليو', monthEn: 'Jul', surgeries: 460, consultations: 2310, scans: 1810, revenue: 1280000 },
      { monthAr: 'أغسطس (النشط)', monthEn: 'Aug (Active)', surgeries: 468, consultations: 2280, scans: 1740, revenue: 1295000 },
      { monthAr: 'سبتمبر (تقديري)', monthEn: 'Sep (Est)', surgeries: 490, consultations: 2420, scans: 1890, revenue: 1360000 },
      { monthAr: 'أكتوبر (تقديري)', monthEn: 'Oct (Est)', surgeries: 505, consultations: 2480, scans: 1940, revenue: 1400000 },
      { monthAr: 'نوفمبر (تقديري)', monthEn: 'Nov (Est)', surgeries: 515, consultations: 2520, scans: 1980, revenue: 1430000 },
      { monthAr: 'ديسمبر (تقديري)', monthEn: 'Dec (Est)', surgeries: 520, consultations: 2550, scans: 2000, revenue: 1450000 }
    ],
    departmentWorkload: [
      { nameAr: 'جراحة الشبكية والجسم الزجاجي', nameEn: 'Vitreoretinal Surgery', count: 1480, color: '#0C2340' },
      { nameAr: 'القرنية وتصحيح الإبصار (ليزك)', nameEn: 'Cornea & LASIK', count: 1720, color: '#0D9488' },
      { nameAr: 'المياه البيضاء وزراعة العدسات', nameEn: 'Cataract & Premium IOL', count: 1190, color: '#F59E0B' },
      { nameAr: 'عيون الأطفال وجراحة الحول', nameEn: 'Pediatric & Strabismus', count: 640, color: '#6366F1' },
      { nameAr: 'تجميل الجفون ومجرى الدمع', nameEn: 'Oculoplastics', count: 490, color: '#EC4899' },
      { nameAr: 'المياه الزرقاء (الجلوكوما)', nameEn: 'Glaucoma Management', count: 560, color: '#10B981' }
    ]
  }
};

// ============================================================================
// 1. STAFF ATTENDANCE, SHIFT SCHEDULES & LIVE DUTY ROSTER
// ============================================================================

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

