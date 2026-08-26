export interface PatientCondition {
  id: string;
  labelAr: string;
  labelEn: string;
  icon: string;
  specialtyId: string;
  badgeAr?: string;
  badgeEn?: string;
}

export interface Specialty {
  id: string;
  iconName: string;
  image?: string;
  titleAr: string;
  titleEn: string;
  shortDescAr: string;
  shortDescEn: string;
  fullDescAr: string;
  fullDescEn: string;
  badgeAr: string;
  badgeEn: string;
  proceduresAr: string[];
  proceduresEn: string[];
  technologiesAr: string[];
  technologiesEn: string[];
  durationAr: string;
  durationEn: string;
  recoveryAr: string;
  recoveryEn: string;
  suitableForAr: string[];
  suitableForEn: string[];
  /** Per-department intake form schema (null = use platform defaults) */
  intakeSchema?: import('@/lib/types/intake-schema').IntakeSchema | null;
}

export interface Doctor {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  doctorType: 'visiting' | 'local';
  specialtyId: string;
  specialtyAr: string;
  specialtyEn: string;
  originAr: string;
  originEn: string;
  universityAr: string;
  universityEn: string;
  status: 'available_now' | 'upcoming_visit' | 'regular';
  visitScheduleAr: string;
  visitScheduleEn: string;
  experienceYears: number;
  surgeriesCount: string;
  photoSeed: string;
  highlightsAr: string[];
  highlightsEn: string[];
}

export interface TechnologyItem {
  id: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  descAr: string;
  descEn: string;
  featuresAr: string[];
  featuresEn: string[];
  precision: string;
  imageSeed: string;
  image?: string;
}

export interface Testimonial {
  id: string;
  patientNameAr: string;
  patientNameEn: string;
  cityAr: string;
  cityEn: string;
  procedureAr: string;
  procedureEn: string;
  doctorAr: string;
  doctorEn: string;
  commentAr: string;
  commentEn: string;
  rating: number;
  dateAr: string;
  dateEn: string;
}

export const HOSPITAL_IMAGES = {
  heroSurgery: '/images/hospital_hero_surgery_1787188107940.webp',
  hospitalExterior: '/images/hospital_exterior_facade_1787188119953.webp',
  femtoLaserTech: '/images/femto_laser_tech_1787188144731.webp',
  eyeDiagnostics: '/images/ophthalmology_diagnostics_1787188133030.webp',
  cataractSurgery: '/images/cataract_lens_surgery_1787188187884.webp',
  retinaScanOct: '/images/retina_scan_oct_1787188201209.webp',
  corneaCrosslink: '/images/cornea_crosslink_1787190931823.webp',
  pediatricEyeCare: '/images/pediatric_eye_care_1787190917908.webp',
  oculoplasticsEye: '/images/oculoplastics_eye_1787190943890.webp',
  pentacamMachine: '/images/pentacam_machine_1787190957984.webp',
};

import { tenantConfig } from '@/config/tenant';

/**
 * Compatibility view over the tenant config — identity + contact fields
 * under one object so existing consumers keep their import path.
 * Single source of truth lives in config/tenant.ts.
 */
export const HOSPITAL_CONTACTS = {
  ...tenantConfig.identity,
  ...tenantConfig.contacts,
  facebookUrl: tenantConfig.urls.facebookUrl,
  spitarUrl: tenantConfig.urls.partnerUrl,
  googleMapsUrl: tenantConfig.urls.googleMapsUrl,
  coordinates: {
    lat: tenantConfig.geo.lat,
    lng: tenantConfig.geo.lng,
  },
} as const;

// SPECIALTIES removed — now served from the Department table via
// lib/departments.ts. The Specialty interface remains as the shared DTO.

export const TECHNOLOGIES: TechnologyItem[] = [
  {
    id: 'femto-laser',
    titleAr: 'منظومة الفيمتو ليزك والإكسيمر ليزر فائقة السرعة',
    titleEn: 'Ultrafast Femtosecond & 500Hz Excimer Laser',
    categoryAr: 'جراحات تصحيح الإبصار',
    categoryEn: 'Refractive Surgery',
    descAr: 'فصل طبقات القرنية بدون شفرة جراحية في 6 ثوانٍ فقط بدقة متناهية تحت سيطرة الكمبيوتر، تليها معالجة عيوب الإبصار بدقة ميكرونية فائقة.',
    descEn: 'Computer-guided bladeless flap creation in just 6 seconds, followed by 500Hz custom corneal ablation with active eye-tracking.',
    featuresAr: [
      'تتبع حركة العين خماسي الأبعاد (5D Active Eye Tracker)',
      'عدم استخدام أي شفرات معدنية (100% Bladeless)',
      'تقليل جفاف العين وسرعة تعافي قياسية',
      'معالجة الاستجماتيزم العالي بدقة لا تضاهى',
    ],
    featuresEn: [
      '5D active real-time eye tracker for safety',
      '100% all-laser bladeless treatment',
      'Reduced dry eye incidence & fast healing',
      'Exceptional high astigmatism correction',
    ],
    precision: '0.001 ملم (دقة ميكرونية)',
    imageSeed: 'laser_tech',
    image: '/images/femto_laser_tech_1787188144731.webp',
  },
  {
    id: 'phaco-centurion',
    titleAr: 'جهاز الفاكو المتقدم Alcon Centurion Vision System',
    titleEn: 'Alcon Centurion Vision System (Micro-Phaco)',
    categoryAr: 'جراحات المياه البيضاء',
    categoryEn: 'Cataract Surgery',
    descAr: 'المنظومة الأحدث عالمياً لتفتيت المياه البيضاء مع الحفاظ الصارم على استقرار ضغط العين أثناء الجراحة (Active Fluidics)، مما يوفر أقصى درجات الأمان لقرنية العين.',
    descEn: 'The gold-standard cataract platform worldwide with Active Fluidics technology, maintaining target intraocular pressure and protecting corneal endothelial cells.',
    featuresAr: [
      'تقنية الفاكو البارد بالموجات المتذبذبة التراسونيك',
      'فتحة جراحية فائقة الصغر (2.2 ملم) بدون أي غرز',
      'حماية خلايا بطانة القرنية من الإجهاد الحراري',
      'زراعة العدسات الذكية القابلة للطي بدقة أوتوماتيكية',
    ],
    featuresEn: [
      'Cold ultrasound with torsional OZil oscillation',
      'Micro-incision (2.2mm) with zero suture need',
      'Active corneal endothelium protection',
      'Smooth automated injector for premium foldable IOLs',
    ],
    precision: 'تحكم أوتوماتيكي بالضغط الجراحي',
    imageSeed: 'phaco_tech',
    image: '/images/cataract_lens_surgery_1787188187884.webp',
  },
  {
    id: 'oct-angiography',
    titleAr: 'جهاز تصوير الشبكية المقطعي عالي الدقة (HD-OCT & Angio)',
    titleEn: 'Spectral Domain HD-OCT & Angiography',
    categoryAr: 'فحوصات الشبكية وقاع العين',
    categoryEn: 'Retinal Diagnostics',
    descAr: 'تصوير طبقات الشبكية والعصب البصري بدقة مجهرية ثلاثية الأبعاد بدون الحاجة لصبغات وريدية، لكشف اعتلال السكري والتنكس البقعي في مراحله الأولى.',
    descEn: 'Non-invasive high-resolution cross-sectional retinal and optic nerve imaging without dye injection, detecting macular edema and microvascular changes early.',
    featuresAr: [
      'أكثر من 85,000 مسح ضوئي في الثانية الواحدة',
      'فحص الأوعية الدموية للشبكية بدون صبغة فلورسين',
      'قياس سماكة ألياف العصب البصري لكشف الجلوكوما المبكر',
      'متابعة استجابة المقولة لحقن الشبكية العلاجية بدقة بالغة',
    ],
    featuresEn: [
      '85,000 A-scans per second capturing fine layers',
      'Dye-free microvascular retinal angiography',
      'Optic nerve fiber layer analysis for glaucoma',
      'Precise tracking of anti-VEGF response',
    ],
    precision: 'وضوح مجهري 3 ميكرون',
    imageSeed: 'oct_tech',
    image: '/images/retina_scan_oct_1787188201209.webp',
  },
  {
    id: 'modular-or',
    titleAr: 'غرف العمليات المعيارية الكبسولية (Modular Clean OR)',
    titleEn: 'Modular Cleanroom Ophthalmic Operating Theatres',
    categoryAr: 'البيئة الجراحية والتعقيم',
    categoryEn: 'Surgical Environment',
    descAr: 'غرف عمليات معقمة بنظام تدفق الهواء العمودي فائق النقاء (Laminar Air Flow) وحوائط مضادة للبكتيريا تضمن نسبة تعقيم 100% مطابقة للمعايير الأوروبية.',
    descEn: 'Hermetically sealed operating rooms with HEPA Laminar Air Flow filtration and antibacterial panels ensuring 100% sterile ophthalmic environments.',
    featuresAr: [
      'فلاتر هواء HEPA فائقة الكفاءة بتدفق تدريجي موجب',
      'ميكروسكوبات جراحية ألمانية متطورة (Zeiss & Leica)',
      'أنظمة إضاءة ومراقبة حيوية رقمية متكاملة',
      'فصل تام لمسارات المرضى والتعقيم لمنع أي تلوث عرضي',
    ],
    featuresEn: [
      'Ultra-clean positive pressure HEPA laminar airflow',
      'High-end German Zeiss & Leica ophthalmic microscopes',
      'Integrated digital anesthesia & patient telemetry',
      'Strict unidirectional sterilization flow',
    ],
    precision: 'معايير تعقيم أوروبية Class 100',
    imageSeed: 'operating_room',
    image: '/images/hospital_hero_surgery_1787188107940.webp',
  },
  {
    id: 'pentacam-hr',
    titleAr: 'جهاز البنتاكام ثلاثي الأبعاد لتصوير القرنية (Pentacam HR)',
    titleEn: 'Oculus Pentacam HR 3D Corneal Scanner',
    categoryAr: 'فحوصات ما قبل الليزك والقرنية',
    categoryEn: 'Pre-LASIK & Cornea Screening',
    descAr: 'المعيار الذهبي عالمياً لفحص سمك وانحناء القرنية الأمامي والخلفي قبل عمليات الليزر، وكشف القرنية المخروطية المبكرة قبل ظهور أي أعراض.',
    descEn: 'The global gold standard Scheimpflug camera for complete anterior segment analysis, corneal thickness mapping, and pre-LASIK safety clearance.',
    featuresAr: [
      'مسح كامل لسطح القرنية في ثانيتين بتقنية شيمبفلوج',
      'كشف أرق نقطة في القرنية بدقة الميكرون',
      'برنامج بيلين أمبروسيو للكشف المبكر عن المخروطية (BAD)',
      'تحديد أفضل تقنية ليزك مناسبة لكل عين بأمان تام',
    ],
    featuresEn: [
      'Rotating Scheimpflug camera capturing 25,000 points',
      'Micron-accurate thinnest point corneal location',
      'Belin/Ambrósio Enhanced Ectasia display',
      'Custom safety profiling for LASIK candidacy',
    ],
    precision: 'خريطة شاملة لـ 25,000 نقطة قياس',
    imageSeed: 'pentacam_tech',
    image: '/images/pentacam_machine_1787190957984.webp',
  },
];

export const PATIENT_CONDITIONS: PatientCondition[] = [
  {
    id: 'lasik',
    labelAr: 'ضعف نظر / رغبة في الليزك',
    labelEn: 'Blurry Vision / Want LASIK',
    icon: '👓',
    specialtyId: 'refractive-lasik',
    badgeAr: 'تصحيح إبصار',
    badgeEn: 'Refractive',
  },
  {
    id: 'cataract',
    labelAr: 'مياه بيضاء / غشاوة وضبابية',
    labelEn: 'Cataract / Cloudy Vision',
    icon: '🌫️',
    specialtyId: 'cataract-phaco',
    badgeAr: 'فاكو وزراعة عدسات',
    badgeEn: 'Phaco & IOL',
  },
  {
    id: 'retina-diabetes',
    labelAr: 'اعتلال سكري / خيوط أو فلاشات',
    labelEn: 'Diabetes / Retina Floaters',
    icon: '🩺',
    specialtyId: 'retina-vitreous',
    badgeAr: 'شبكية وجسم زجاجي',
    badgeEn: 'Retina & Vitreous',
  },
  {
    id: 'glaucoma',
    labelAr: 'ضغط العين / مياه زرقاء',
    labelEn: 'High Eye Pressure / Glaucoma',
    icon: '💧',
    specialtyId: 'glaucoma',
    badgeAr: 'مياه زرقاء',
    badgeEn: 'Glaucoma',
  },
  {
    id: 'cornea',
    labelAr: 'قرنية مخروطية / احمرار وجفاف',
    labelEn: 'Keratoconus / Severe Dryness',
    icon: '👁️',
    specialtyId: 'cornea-external',
    badgeAr: 'القرنية وتثبيتها',
    badgeEn: 'Cornea Care',
  },
  {
    id: 'pediatric',
    labelAr: 'حَوَل أو كسل عين للأطفال',
    labelEn: 'Child Squint / Lazy Eye',
    icon: '👶',
    specialtyId: 'pediatric-strabismus',
    badgeAr: 'عيون الأطفال',
    badgeEn: 'Pediatrics',
  },
  {
    id: 'injury',
    labelAr: 'إصابة طارئة / دخول جسم غريب',
    labelEn: 'Eye Trauma / Foreign Body',
    icon: '🚨',
    specialtyId: 'emergency-trauma',
    badgeAr: 'طوارئ عاجلة',
    badgeEn: 'Emergency',
  },
  {
    id: 'general',
    labelAr: 'فحص دوري شامل / استشارة',
    labelEn: 'General Checkup / Consultation',
    icon: '📋',
    specialtyId: 'refractive-lasik',
    badgeAr: 'كشف عام',
    badgeEn: 'General',
  },
];

export const AFFECTED_EYE_OPTIONS = [
  { id: 'both', labelAr: 'كلتا العينين 👀', labelEn: 'Both Eyes 👀', shortAr: 'كلتا العينين', shortEn: 'Both Eyes' },
  { id: 'right', labelAr: 'العين اليمنى 👁️ (يمين)', labelEn: 'Right Eye 👁️ (OD)', shortAr: 'العين اليمنى', shortEn: 'Right Eye' },
  { id: 'left', labelAr: 'العين اليسرى 👁️ (يسار)', labelEn: 'Left Eye 👁️ (OS)', shortAr: 'العين اليسرى', shortEn: 'Left Eye' },
];

export const AGE_GROUP_OPTIONS = [
  { id: 'child', labelAr: 'طفل / أقل من 16 سنة 👶', labelEn: 'Child / Under 16 👶', shortAr: 'طفل (<16)', shortEn: 'Child (<16)' },
  { id: 'adult', labelAr: 'بالغ / 16 - 50 سنة 🧑', labelEn: 'Adult / 16 - 50 🧑', shortAr: 'بالغ (16-50)', shortEn: 'Adult (16-50)' },
  { id: 'senior', labelAr: 'كبير سن / 50+ سنة 🧓', labelEn: 'Senior / 50+ 🧓', shortAr: 'فوق 50 سنة', shortEn: 'Senior (50+)' },
];

export const GENDER_OPTIONS = [
  { id: 'male', labelAr: 'ذكر 👨', labelEn: 'Male 👨', shortAr: 'ذكر', shortEn: 'Male' },
  { id: 'female', labelAr: 'أنثى 👩', labelEn: 'Female 👩', shortAr: 'أنثى', shortEn: 'Female' },
];

export const SYMPTOM_DURATION_OPTIONS = [
  { id: 'recent', labelAr: 'طارئة / حديثة (ساعات - أيام) ⚡', labelEn: 'Recent / Sudden (Hours - Days) ⚡', shortAr: 'حديثة / طارئة', shortEn: 'Recent / Sudden' },
  { id: 'gradual', labelAr: 'تدريجية (أسابيع - أشهر) ⏳', labelEn: 'Gradual (Weeks - Months) ⏳', shortAr: 'تدريجية (أشهر)', shortEn: 'Gradual' },
  { id: 'chronic', labelAr: 'متابعة دورية / حالة سابقة 🔄', labelEn: 'Routine / Existing condition 🔄', shortAr: 'متابعة وفحص دوري', shortEn: 'Routine Checkup' },
];


