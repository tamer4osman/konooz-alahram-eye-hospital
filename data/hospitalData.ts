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

// TECHNOLOGIES removed — now served from the Technology table via
// lib/technologies.ts. The TechnologyItem interface remains as the shared DTO.

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


