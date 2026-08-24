export interface DashboardUser {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  titleAr: string;
  titleEn: string;
  avatar: string;
  department: string;
  accessLevel: 'super_admin' | 'medical_director' | 'head_nurse' | 'biomedical_lead' | 'reception_manager';
  email: string;
  phone: string;
}

export const DUMMY_MANAGERS: DashboardUser[] = [
  {
    id: 'mgr-1',
    nameAr: 'د. تامر عثمان',
    nameEn: 'Dr. Tamer Osman',
    roleAr: 'المدير العام والعمليات الطبية',
    roleEn: 'Chief Executive & Medical Operations Officer',
    titleAr: 'استشاري أول طب وجراحة العيون',
    titleEn: 'Senior Consultant Ophthalmologist',
    avatar: '/avatars/photo-1622253692010-333f2da6031d.jpg',
    department: 'Hospital Administration & Surgical Directorate',
    accessLevel: 'super_admin',
    email: 'tamer4osman@gmail.com',
    phone: '+218 91 529 9170'
  },
  {
    id: 'mgr-2',
    nameAr: 'أ.د. محمود الحسيني',
    nameEn: 'Prof. Dr. Mahmoud Al-Husseini',
    roleAr: 'رئيس المجلس الاستشاري والشبكية',
    roleEn: 'Head of Vitreoretinal Advisory Board',
    titleAr: 'أستاذ جراحة الشبكية والجسم الزجاجي - قصر العيني',
    titleEn: 'Professor of Vitreoretinal Surgery - Cairo University',
    avatar: '/avatars/photo-1537368910025-700350fe46c7.jpg',
    department: 'Vitreoretinal & Surgical Eye Center',
    accessLevel: 'medical_director',
    email: 'm.husseini@konooz-hospital.ly',
    phone: '+218 91 529 9171'
  },
  {
    id: 'mgr-3',
    nameAr: 'أ. فاطمة الورفلي',
    nameEn: 'Fatima Al-Warfalli, RN',
    roleAr: 'رئيسة هيئة التمريض وغرف العمليات',
    roleEn: 'Director of Nursing & OR Sterile Services',
    titleAr: 'أخصائية التمريض الجراحي ومكافحة العدوى',
    titleEn: 'Surgical Nursing & Infection Control Specialist',
    avatar: '/avatars/photo-1584515979956-d9f6e5d09982.jpg',
    department: 'Nursing & Surgical Inpatient Directorate',
    accessLevel: 'head_nurse',
    email: 'f.warfalli@konooz-hospital.ly',
    phone: '+218 92 654 3210'
  },
  {
    id: 'mgr-4',
    nameAr: 'م. سالم المجبري',
    nameEn: 'Eng. Salem Al-Majbari',
    roleAr: 'رئيس قسم الهندسة الطبية والليزر',
    roleEn: 'Lead Biomedical & Laser Systems Engineer',
    titleAr: 'مهندس أجهزة طبية معتمد (Zeiss & Alcon)',
    titleEn: 'Certified Ophthalmic Biomedical Specialist',
    avatar: '/avatars/photo-1507003211169-0a1dd7228f2d.jpg',
    department: 'Biomedical & High-Tech Maintenance',
    accessLevel: 'biomedical_lead',
    email: 'biomed@konooz-hospital.ly',
    phone: '+218 91 765 4321'
  },
  {
    id: 'mgr-5',
    nameAr: 'أ. هشام الدرسي',
    nameEn: 'Hisham Al-Dersi',
    roleAr: 'مدير خدمات المرضى والاستقبال',
    roleEn: 'Patient Care & Admissions Manager',
    titleAr: 'مسؤول التنسيق المالي والحجوزات الفورية',
    titleEn: 'Admissions & Instant Booking Coordinator',
    avatar: '/avatars/photo-1500648767791-00dcc994a43e.jpg',
    department: 'Front Desk & Patient Flow Management',
    accessLevel: 'reception_manager',
    email: 'reception@konooz-hospital.ly',
    phone: '+218 91 529 9170'
  }
];

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

export const DUMMY_STAFF: HospitalStaff[] = [
  {
    id: 'st-1',
    nameAr: 'أ.د. طارق قطامش',
    nameEn: 'Prof. Dr. Tarek Katamish',
    roleAr: 'استشاري زائر - جراحات القرنية وتصحيح الإبصار',
    roleEn: 'Visiting Professor - Cornea & Refractive Surgery',
    category: 'consultant',
    departmentAr: 'قسم القرنية وتصحيح الإبصار بالفيمتوليزك',
    departmentEn: 'Cornea & Femto-LASIK Unit',
    status: 'in_surgery',
    roomAssignedAr: 'جناح العمليات 3 (Femto-LASIK Suite)',
    roomAssignedEn: 'OR 3 (Femto-LASIK Suite)',
    shift: '08:30 - 16:30',
    patientCountToday: 18,
    surgeriesCountToday: 6,
    phone: '+218 91 529 9172',
    email: 'tarek.katamish@konooz-hospital.ly',
    avatar: '/avatars/photo-1622253692010-333f2da6031d.jpg',
    rating: 4.98
  },
  {
    id: 'st-2',
    nameAr: 'أ.د. محمود الحسيني',
    nameEn: 'Prof. Dr. Mahmoud Al-Husseini',
    roleAr: 'استشاري زائر - جراحة الشبكية والجسم الزجاجي',
    roleEn: 'Visiting Professor - Vitreoretinal Surgery',
    category: 'surgeon',
    departmentAr: 'مركز جراحة الشبكية وانفصال الشبكية',
    departmentEn: 'Vitreoretinal Surgical Center',
    status: 'in_surgery',
    roomAssignedAr: 'جناح العمليات 1 (الميكروسكوب الجراحي)',
    roomAssignedEn: 'OR 1 (Lumera Surgical Suite)',
    shift: '08:00 - 18:00',
    patientCountToday: 12,
    surgeriesCountToday: 4,
    phone: '+218 91 529 9171',
    email: 'm.husseini@konooz-hospital.ly',
    avatar: '/avatars/photo-1537368910025-700350fe46c7.jpg',
    rating: 4.99
  },
  {
    id: 'st-3',
    nameAr: 'أ.د. حسام زيادة',
    nameEn: 'Prof. Dr. Hossam Ziada',
    roleAr: 'استشاري زائر - عيون الأطفال والحول والجفون',
    roleEn: 'Visiting Professor - Pediatric Eye & Strabismus',
    category: 'consultant',
    departmentAr: 'قسم عيون الأطفال وجراحة الحول الدقيقة',
    departmentEn: 'Pediatric Ophthalmology & Strabismus',
    status: 'on_duty',
    roomAssignedAr: 'عيادة 103 (كشف الأطفال والحول)',
    roomAssignedEn: 'Clinic 103 (Pediatric Suite)',
    shift: '09:00 - 17:00',
    patientCountToday: 22,
    surgeriesCountToday: 2,
    phone: '+218 91 529 9173',
    email: 'hossam.ziada@konooz-hospital.ly',
    avatar: '/avatars/photo-1582750433449-648ed127bb54.jpg',
    rating: 4.95
  },
  {
    id: 'st-4',
    nameAr: 'أ.د. طارق عبد الرازق',
    nameEn: 'Prof. Dr. Tarek Abdelrazek',
    roleAr: 'استشاري زائر - جراحات تجميل الجفون ومجرى الدمع',
    roleEn: 'Visiting Professor - Oculoplastics & Orbit',
    category: 'consultant',
    departmentAr: 'قسم تجميل العيون وتفريغ مجرى الدمع',
    departmentEn: 'Oculoplastics & Lacrimal Surgery',
    status: 'on_call',
    roomAssignedAr: 'عيادة 104 (تجميل العين)',
    roomAssignedEn: 'Clinic 104 (Oculoplastics)',
    shift: '12:00 - 20:00',
    patientCountToday: 14,
    surgeriesCountToday: 3,
    phone: '+218 91 529 9174',
    email: 'tarek.razek@konooz-hospital.ly',
    avatar: '/avatars/photo-1612349317150-e413f6a5b16d.jpg',
    rating: 4.92
  },
  {
    id: 'st-5',
    nameAr: 'د. يوسف العقوري',
    nameEn: 'Dr. Yousef Al-Agouri',
    roleAr: 'أخصائي مقيم - جراحة المياه البيضاء وتثبيت القرنية',
    roleEn: 'Senior Resident - Cataract & Cornea Crosslinking',
    category: 'resident',
    departmentAr: 'العيادات الخارجية والطوارئ العينية',
    departmentEn: 'Outpatient & Eye Emergency',
    status: 'on_duty',
    roomAssignedAr: 'عيادة 101 (الفحص العام والطوارئ)',
    roomAssignedEn: 'Clinic 101 (General & Emergency)',
    shift: '08:00 - 16:00',
    patientCountToday: 26,
    surgeriesCountToday: 5,
    phone: '+218 91 334 5566',
    email: 'y.agouri@konooz-hospital.ly',
    avatar: '/avatars/photo-1559839734-2b71ea197ec2.jpg',
    rating: 4.88
  },
  {
    id: 'st-6',
    nameAr: 'د. مروة الزوي',
    nameEn: 'Dr. Marwa Al-Zway',
    roleAr: 'أخصائية التخدير وعناية جراحات العيون',
    roleEn: 'Ophthalmic Anesthesiologist Specialist',
    category: 'surgeon',
    departmentAr: 'قسم التخدير والرعاية حول الجراحية',
    departmentEn: 'Anesthesiology & Perioperative Care',
    status: 'in_surgery',
    roomAssignedAr: 'جناح العمليات 1 & 2',
    roomAssignedEn: 'OR 1 & OR 2 Complex',
    shift: '07:30 - 15:30',
    patientCountToday: 9,
    surgeriesCountToday: 9,
    phone: '+218 92 445 6677',
    email: 'm.zway@konooz-hospital.ly',
    avatar: '/avatars/photo-1584515979956-d9f6e5d09982.jpg',
    rating: 4.96
  },
  {
    id: 'st-7',
    nameAr: 'أ. فاطمة الورفلي',
    nameEn: 'Fatima Al-Warfalli, RN',
    roleAr: 'مشرفة تمريض غرف العمليات والتعقيم الجراحي',
    roleEn: 'Head Nurse - OR & Surgical Sterilization',
    category: 'nurse',
    departmentAr: 'هيئة التمريض الجراحي المركزي',
    departmentEn: 'Central Surgical Nursing',
    status: 'on_duty',
    roomAssignedAr: 'مجمع العمليات الجراحية',
    roomAssignedEn: 'Main OR Complex Control',
    shift: '07:00 - 15:00',
    patientCountToday: 24,
    surgeriesCountToday: 12,
    phone: '+218 92 654 3210',
    email: 'f.warfalli@konooz-hospital.ly',
    avatar: '/avatars/photo-1584515979956-d9f6e5d09982.jpg',
    rating: 4.97
  },
  {
    id: 'st-8',
    nameAr: 'ممرض جراحي: معتز الفيتوري',
    nameEn: 'Moataz Al-Fitouri, BSN',
    roleAr: 'ممرض جراحة متقدمة - جهاز استئصال الزجاجية',
    roleEn: 'Lead Scrub Nurse - Vitrectomy & Phaco',
    category: 'nurse',
    departmentAr: 'قسم تمريض جراحات الشبكية والفاكو',
    departmentEn: 'Vitreoretinal Scrub Nursing',
    status: 'in_surgery',
    roomAssignedAr: 'جناح العمليات 1',
    roomAssignedEn: 'OR Suite 1',
    shift: '07:30 - 15:30',
    patientCountToday: 8,
    surgeriesCountToday: 5,
    phone: '+218 91 887 6655',
    email: 'm.fitouri@konooz-hospital.ly',
    avatar: '/avatars/photo-1537368910025-700350fe46c7.jpg',
    rating: 4.91
  },
  {
    id: 'st-9',
    nameAr: 'أخصائية البصريات: هدى البرعصي',
    nameEn: 'Huda Al-Barasi, OD',
    roleAr: 'أخصائية قياس النظر وتضاريس القرنية (Pentacam)',
    roleEn: 'Optometrist & Pentacam Corneal Topographer',
    category: 'technician',
    departmentAr: 'وحدة الفحوصات التشخيصية وتخطيط الليزك',
    departmentEn: 'Diagnostic Refractive Unit',
    status: 'on_duty',
    roomAssignedAr: 'مختبر التشخيص 2 (Pentacam & Biometry)',
    roomAssignedEn: 'Diagnostic Suite 2',
    shift: '08:30 - 16:30',
    patientCountToday: 31,
    surgeriesCountToday: 0,
    phone: '+218 91 776 5544',
    email: 'h.barasi@konooz-hospital.ly',
    avatar: '/avatars/photo-1559839734-2b71ea197ec2.jpg',
    rating: 4.94
  },
  {
    id: 'st-10',
    nameAr: 'فني تصوير: عبد الرؤوف القماطي',
    nameEn: 'Abdelraouf Al-Gmati',
    roleAr: 'فني أول تصوير الشبكية المقطعي (OCT & FFA)',
    roleEn: 'Senior Ophthalmic Angiographer & OCT Tech',
    category: 'technician',
    departmentAr: 'وحدة الأشعة المقطعية لشبكية العين والعصب',
    departmentEn: 'OCT & Fluorescein Angiography',
    status: 'on_duty',
    roomAssignedAr: 'مختبر التصوير المقطعي (Heidelberg SPECTRALIS)',
    roomAssignedEn: 'OCT Imaging Suite (SPECTRALIS)',
    shift: '09:00 - 17:00',
    patientCountToday: 27,
    surgeriesCountToday: 0,
    phone: '+218 92 112 3344',
    email: 'a.gmati@konooz-hospital.ly',
    avatar: '/avatars/photo-1507003211169-0a1dd7228f2d.jpg',
    rating: 4.90
  },
  {
    id: 'st-11',
    nameAr: 'م. سالم المجبري',
    nameEn: 'Eng. Salem Al-Majbari',
    roleAr: 'رئيس قسم الهندسة الطبية ومعايرة الليزر',
    roleEn: 'Lead Biomedical & Laser Systems Engineer',
    category: 'technician',
    departmentAr: 'قسم الهندسة والصيانة الدورية الحيوية',
    departmentEn: 'Biomedical & Laser Engineering',
    status: 'on_duty',
    roomAssignedAr: 'غرفة التحكم الهندسي ومعايرة الأجهزة',
    roomAssignedEn: 'Biomedical Control Room',
    shift: '08:00 - 16:00',
    patientCountToday: 0,
    surgeriesCountToday: 0,
    phone: '+218 91 765 4321',
    email: 'biomed@konooz-hospital.ly',
    avatar: '/avatars/photo-1500648767791-00dcc994a43e.jpg',
    rating: 4.99
  },
  {
    id: 'st-12',
    nameAr: 'أ. هشام الدرسي',
    nameEn: 'Hisham Al-Dersi',
    roleAr: 'مسؤول الاستقبال والحجوزات الفورية',
    roleEn: 'Front Desk & Patient Flow Coordinator',
    category: 'admin',
    departmentAr: 'إدارة الاستقبال وعلاقات المرضى',
    departmentEn: 'Patient Admission & Reception',
    status: 'on_duty',
    roomAssignedAr: 'صالة الاستقبال الرئيسية (طريق طرابلس)',
    roomAssignedEn: 'Main Reception & Triage Lounge',
    shift: '08:00 - 20:00 (Rotational)',
    patientCountToday: 48,
    surgeriesCountToday: 0,
    phone: '+218 91 529 9170',
    email: 'reception@konooz-hospital.ly',
    avatar: '/avatars/photo-1472099645785-5658abf4ff4e.jpg',
    rating: 4.89
  }
];

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

export const RESOURCE_AVAILABILITY_SUMMARY = {
  surgeonsTotal: 12,
  surgeonsOnDuty: 8,
  surgeonsInOR: 3,
  surgeonsOnCall: 2,
  roomsTotal: 4,
  roomsOccupied: 3,
  roomsReadyClean: 1,
  equipmentTotal: 10,
  equipmentOperational: 10,
  equipmentInUse: 4,
  pacuBedsTotal: 8,
  pacuBedsOccupied: 4,
  sterileSetsReady: 28,
  sterileSetsTotal: 30,
  averageOrTurnaroundMin: 16.5, // Changeover time between procedures
  benchmarkOrTurnaroundMin: 20.0,
  pacuAverageStayMin: 38.0,
  infectionControlCompliancePercent: 99.9
};

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

export const DUMMY_INSURANCES: InsuranceProviderInfo[] = [
  {
    id: 'ins-wahda',
    nameAr: 'شركة الوحدة للتأمين الصحي',
    nameEn: 'Al-Wahda Health Insurance Co.',
    coveragePercentage: 85,
    preAuthRequired: true,
    contactDesk: 'بوابة التأمين الفورية - فرع بنغازي الرئيسي',
    logo: '🛡️'
  },
  {
    id: 'ins-sahara',
    nameAr: 'شركة الصحراء للتأمين الطبي',
    nameEn: 'Sahara Medical Insurance',
    coveragePercentage: 90,
    preAuthRequired: true,
    contactDesk: 'خدمة العملاء الإلكترونية 24/7',
    logo: '🌴'
  },
  {
    id: 'ins-libyan-co',
    nameAr: 'شركة ليبيا للتأمين (ش.م.ل)',
    nameEn: 'Libya Insurance Company',
    coveragePercentage: 80,
    preAuthRequired: false,
    contactDesk: 'مكتب الارتباط المباشر بالمستشفى',
    logo: '🇱🇾'
  },
  {
    id: 'ins-noc-oil',
    nameAr: 'المؤسسة الوطنية للنفط وشركة الخليج العربي',
    nameEn: 'NOC & Arabian Gulf Oil Company (AGOCO)',
    coveragePercentage: 100,
    preAuthRequired: true,
    contactDesk: 'الإدارة الطبية لشؤون العاملين بالنفط',
    logo: '⛽'
  }
];

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

export const DUMMY_INVOICES: HospitalBillingInvoice[] = [
  {
    id: 'inv-3001',
    invoiceNumber: 'INV-2026-0811',
    ticketNumber: 'KZ-8841',
    patientNameAr: 'الحاج فرج مصطفى المجبري',
    patientNameEn: 'Faraj M. Al-Majbari',
    procedureAr: 'جراحة استئصال زجاجية 25G + ليزر باطن العين + زيت سيليكون',
    procedureEn: '25G Vitrectomy + Endolaser + Silicone Oil',
    insuranceNameAr: 'المؤسسة الوطنية للنفط (NOC / AGOCO)',
    insuranceNameEn: 'NOC & Arabian Gulf Oil Company',
    dateIssued: '2026-08-18',
    surgeonFeeLYD: 3500,
    orFacilityFeeLYD: 1800,
    anesthesiaFeeLYD: 800,
    lensOrDeviceFeeLYD: 1200,
    consumablesFeeLYD: 600,
    totalGrossLYD: 7900,
    insuranceCoveredLYD: 7900,
    patientCoPayLYD: 0,
    status: 'pre_auth_approved'
  },
  {
    id: 'inv-3002',
    invoiceNumber: 'INV-2026-0812',
    ticketNumber: 'KZ-8902',
    patientNameAr: 'مروة عبد القادر الورفلي',
    patientNameEn: 'Marwa A. Al-Warfalli',
    procedureAr: 'تصحيح الإبصار بالفيمتو ليزك المخصص بكلتا العينين (Custom-Q)',
    procedureEn: 'Bilateral Wavefront-Guided Femto-LASIK',
    insuranceNameAr: 'دفع خاص نقدي (سداد كامل)',
    insuranceNameEn: 'Private Cash Payment',
    dateIssued: '2026-08-18',
    surgeonFeeLYD: 2200,
    orFacilityFeeLYD: 1400,
    anesthesiaFeeLYD: 200,
    lensOrDeviceFeeLYD: 0,
    consumablesFeeLYD: 400,
    totalGrossLYD: 4200,
    insuranceCoveredLYD: 0,
    patientCoPayLYD: 4200,
    status: 'paid'
  },
  {
    id: 'inv-3003',
    invoiceNumber: 'INV-2026-0813',
    ticketNumber: 'KZ-8955',
    patientNameAr: 'سالم إبراهيم بوزيد',
    patientNameEn: 'Salem I. Bouzaid',
    procedureAr: 'فاكو وإزالة مياه بيضاء وزراعة عدسة صفراء Alcon AcrySof IQ',
    procedureEn: 'Phacoemulsification + Alcon AcrySof IQ IOL',
    insuranceNameAr: 'شركة الوحدة للتأمين الصحي',
    insuranceNameEn: 'Al-Wahda Health Insurance Co.',
    dateIssued: '2026-08-18',
    surgeonFeeLYD: 1800,
    orFacilityFeeLYD: 1200,
    anesthesiaFeeLYD: 400,
    lensOrDeviceFeeLYD: 950,
    consumablesFeeLYD: 350,
    totalGrossLYD: 4700,
    insuranceCoveredLYD: 3995,
    patientCoPayLYD: 705,
    status: 'paid'
  }
];

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

export const DUMMY_PACS_ORDERS: DiagnosticPacsOrder[] = [
  {
    id: 'pacs-501',
    orderNumber: 'OCT-2026-9901',
    ticketNumber: 'KZ-8841',
    patientNameAr: 'الحاج فرج مصطفى المجبري',
    patientNameEn: 'Faraj M. Al-Majbari',
    scanTypeAr: 'أشعة مقطعية لشبكية العين والماقولا (High-Res Macular OCT)',
    scanTypeEn: 'Spectralis Macular OCT HD Cross-Section',
    deviceUsed: 'Heidelberg SPECTRALIS® OCT2',
    orderingDoctorAr: 'أ.د. محمود الحسيني',
    orderingDoctorEn: 'Prof. Dr. Mahmoud Al-Husseini',
    technicianAr: 'فني عبد الرؤوف القماطي',
    technicianEn: 'Tech Abdelraouf Al-Gmati',
    status: 'completed',
    findingsSummaryAr: 'تأكيد وجود انفصال حسي عصبي بالشبكية مع تراكم سوائل تحت الشبكية ومطابقة معطيات الجراحة العاجلة.',
    findingsSummaryEn: 'Subretinal fluid and neurosensory retinal detachment verified. Macula-off.',
    timeCompleted: '08:45',
    imageThumbnail: '/avatars/photo-1579684385127-1ef15d508118.jpg'
  },
  {
    id: 'pacs-502',
    orderNumber: 'PNT-2026-9902',
    ticketNumber: 'KZ-8902',
    patientNameAr: 'مروة عبد القادر الورفلي',
    patientNameEn: 'Marwa A. Al-Warfalli',
    scanTypeAr: 'خريطة تضاريس القرنية الملونة ثلاثية الأبعاد (Pentacam HR 4-Maps Refractive)',
    scanTypeEn: 'Oculus Pentacam HR 4-Maps Refractive Topography',
    deviceUsed: 'Oculus Pentacam® HR High Resolution',
    orderingDoctorAr: 'أ.د. طارق قطامش',
    orderingDoctorEn: 'Prof. Dr. Tarek Katamish',
    technicianAr: 'أخصائية هدى البرعصي',
    technicianEn: 'Optometrist Huda Al-Barasi',
    status: 'completed',
    findingsSummaryAr: 'تحدب قرنية متماثل تماماً بدون أي علامات قرنية مخروطية مخفية (Belin/Ambrósio BAD-D: 0.82 طبيعي).',
    findingsSummaryEn: 'Symmetric bow-tie with regular astigmatism. Belin/Ambrosio BAD-D 0.82 (Normal).',
    timeCompleted: '09:30',
    imageThumbnail: '/avatars/photo-1516549655169-df83a0774514.jpg'
  }
];


