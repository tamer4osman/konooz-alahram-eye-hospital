/**
 * Tenant configuration — the single source of truth for everything that
 * varies between white-label deployments.
 *
 * A new hospital/clinic ships by editing THIS FILE (plus seed content),
 * never by touching components. See docs/onboarding checklist (Phase 5).
 */

export type TenantProfile = 'hospital' | 'polyclinic' | 'clinic';

export interface TenantContactNumber {
  number: string;
  display: string;
  labelAr: string;
  labelEn: string;
}

export interface TenantIdentity {
  /** Full official name, Arabic */
  nameAr: string;
  /** Full official name, English */
  nameEn: string;
  /** Short display name used in tight UI spaces */
  shortNameAr: string;
  shortNameEn: string;
  /** Organization-type word threaded through UI copy: مستشفى / مركز طبي / عيادة */
  orgTypeAr: string;
  orgTypeEn: string;
  taglineAr: string;
  taglineEn: string;
  /** Path to logo image (public/). If undefined, renders default SVG emblem. */
  logoImage?: string;
}

export interface TenantSeoCopy {
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  applicationNameAr: string;
  applicationNameEn: string;
  keywords: string[];
  ogImages: Array<{ path: string; width: number; height: number; altAr: string; altEn: string }>;
  twitterHandle?: string;
}

export interface TenantContacts {
  addressAr: string;
  addressEn: string;
  cityAr: string;
  cityEn: string;
  primaryWhatsApp: string;
  primaryWhatsAppDisplay: string;
  secondaryWhatsApp: string;
  /** Emergency-line number exposed to schema.org contact points */
  emergencyPhone?: string;
  emergencyPhoneDisplay?: string;
  phoneNumbers: TenantContactNumber[];
  workingHoursAr: string;
  workingHoursEn: string;
}

export interface TenantUrls {
  baseUrl: string;
  facebookUrl?: string;
  partnerUrl?: string;
  googleMapsUrl: string;
}

export interface TenantGeo {
  regionCode: string;
  placename: string;
  lat: number;
  lng: number;
  medicalSpecialty: string;
}

/** Semantic brand palette. Injected onto :root as --tc-* by the root layout. */
export interface TenantTheme {
  primary: Record<
    '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900' | '950',
    string
  >;
  surface: Record<'50' | '100' | '200', string>;
  text: Record<'900' | '700' | '500' | '400' | '300', string>;
  accent: Record<'50' | '100' | '300' | '400' | '500' | '600', string>;
  /** Google Font family name (e.g. "Cairo", "Tajawal", "Inter"). Falls back to Alexandria. */
  fontFamily?: string;
}

export interface TenantCapabilities {
  /** Interactive visual-acuity test module */
  visionTest: boolean;
  /** Surgical cost calculator modal */
  costCalculator: boolean;
  /** Staff dashboard at /dashboard */
  dashboard: boolean;
  /** Show the technology/equipment showcase section */
  showTechnologies?: boolean;
  /** Show the testimonials section */
  showTestimonials?: boolean;
  /** Show the FAQ section */
  showFaq?: boolean;
}

export interface TenantManifest {
  nameAr: string;
  nameEn: string;
  shortNameAr: string;
  shortNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  iconPath: string;
  themeColor: string;
  backgroundColor: string;
}

export interface TenantLlms {
  /** Contact line for llms.txt (e.g. email or URL) */
  contact: string;
}

export interface TenantConfig {
  slug: string;
  profile: TenantProfile;
  identity: TenantIdentity;
  seo: TenantSeoCopy;
  contacts: TenantContacts;
  urls: TenantUrls;
  geo: TenantGeo;
  theme: TenantTheme;
  capabilities: TenantCapabilities;
  manifest: TenantManifest;
  llms: TenantLlms;
}

/* ────────────────────────────────────────────────────────────────────────
 * KONOOZ AL-AHRAM EYE HOSPITAL — tenant #1
 * Values migrated verbatim from data/hospitalData.ts + layout metadata.
 * ──────────────────────────────────────────────────────────────────── */

export const tenantConfig: TenantConfig = {
  slug: 'konooz-alahram',
  profile: 'hospital',
  identity: {
    nameAr: 'مستشفى كنوز الأهرام لطب وجراحة العيون',
    nameEn: 'Konooz Al-Ahram Eye & Ophthalmic Surgery Hospital',
    shortNameAr: 'كنوز الأهرام',
    shortNameEn: 'Konooz Al-Ahram',
    orgTypeAr: 'مستشفى',
    orgTypeEn: 'Hospital',
    taglineAr:
      'رؤية أوضح لحياة أفضل.. أحدث جراحات العيون بأيدي نخبة استشاريين دوليين',
    taglineEn:
      'Clearer Vision for a Better Life.. Advanced Eye Surgery by International Consultants',
  },
  seo: {
    titleAr: 'مستشفى كنوز الأهرام لطب وجراحة العيون | بنغازي - ليبيا',
    titleEn: 'Konooz Al-Ahram Eye Hospital | Ophthalmology - Benghazi, Libya',
    descriptionAr:
      'أكثر من عشرين عاماً من التميز في طب وجراحة العيون في بنغازي. فريق من كبار الاستشاريين، أحدث التقنيات، ورعاية شاملة للشبكية والقرنية والجلوكوما وتصحيح الإبصار.',
    descriptionEn:
      'Over twenty years of excellence in eye care and surgery in Benghazi. Senior consultants, advanced technology, and comprehensive care for retina, cornea, glaucoma, and vision correction.',
    applicationNameAr: 'مستشفى كنوز الأهرام الطبي',
    applicationNameEn: 'Konooz Al-Ahram Medical Complex',
    keywords: [
      'مستشفى كنوز الأهرام',
      'مستشفى كنوز العيون',
      'عيون بنغازي',
      'ليزك بنغازي',
      'فمتو ليزك بنغازي',
      'جراحة الشبكية بنغازي',
      'Konooz Al-Ahram Eye Hospital',
      'Benghazi Eye Hospital',
      'Ophthalmology Libya',
      'Femto LASIK Benghazi',
    ],
    ogImages: [
      {
        path: '/images/hospital_hero_surgery_1787188107940.webp',
        width: 1200,
        height: 630,
        altAr: 'عملية جراحية في مستشفى كنوز الأهرام للعيون',
        altEn: 'Eye surgery at Konooz Al-Ahram Eye Hospital',
      },
      {
        path: '/images/hospital_exterior_facade_1787188119953.webp',
        width: 1200,
        height: 630,
        altAr: 'مبنى مستشفى كنوز الأهرام للعيون',
        altEn: 'Konooz Al-Ahram Eye Hospital building',
      },
    ],
    twitterHandle: '@hospitalpyramid',
  },
  contacts: {
    addressAr:
      'طريق طرابلس، بجانب قوس معهد الكهرباء، مقابل أول مدخل بوصنيب، بنغازي، ليبيا',
    addressEn:
      'Tripoli Road, next to the Electrical Institute Arch, opposite Bu Sneib 1st entrance, Benghazi, Libya',
    cityAr: 'بنغازي، ليبيا',
    cityEn: 'Benghazi, Libya',
    primaryWhatsApp: '+218915299170',
    primaryWhatsAppDisplay: '091 529 9170',
    secondaryWhatsApp: '+218925299170',
    emergencyPhone: '+218945006886',
    emergencyPhoneDisplay: '094 500 6886',
    phoneNumbers: [
      { number: '+218915299170', display: '091 529 9170', labelAr: 'الاستقبال والحجز 1 (واتساب)', labelEn: 'Reception & Booking 1 (WhatsApp)' },
      { number: '+218925299170', display: '092 529 9170', labelAr: 'الاستقبال والحجز 2 (واتساب)', labelEn: 'Reception & Booking 2 (WhatsApp)' },
      { number: '+218921490999', display: '092 149 0999', labelAr: 'خدمة العملاء والعمليات', labelEn: 'Customer Care & Surgeries' },
      { number: '+218911390999', display: '091 139 0999', labelAr: 'قسم العيادات التخصصية', labelEn: 'Specialized Clinics' },
      { number: '+218930999040', display: '093 099 9040', labelAr: 'قسم الليزك والفحوصات', labelEn: 'LASIK & Diagnostics' },
      { number: '+218945006886', display: '094 500 6886', labelAr: 'طوارئ العيون والاستفسارات', labelEn: 'Eye Emergency & Inquiries' },
    ],
    workingHoursAr: 'العيادات والفحوصات: يومياً من 9:00 صباحاً حتى 9:00 مساءً | الطوارئ: 24 ساعة',
    workingHoursEn: 'Clinics & Diagnostics: Daily 9:00 AM – 9:00 PM | Emergency: 24/7',
  },
  urls: {
    baseUrl: 'https://konozealahram-eye.ly',
    facebookUrl: 'https://www.facebook.com/hospitalpyramid/',
    partnerUrl: 'https://spitar.com',
    googleMapsUrl:
      'https://www.google.com/maps/place/%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89+%D9%83%D9%86%D9%88%D8%B2+%D8%A7%D9%84%D8%A7%D9%87%D8%B1%D8%A7%D9%85+%D9%84%D8%B7%D8%A8+%D8%A7%D9%84%D8%B9%D9%8A%D9%88%D9%86%E2%80%AD/@32.036767,20.0541282,17z/data=!3m1!4b1!4m6!3m5!1s0x13831b2d8363f7dd:0x7365037638369b1b!8m2!3d32.0367625!4d20.0567031!16s%2Fg%2F11sxyg5zwp',
  },
  geo: {
    regionCode: 'LY-BA',
    placename: 'Benghazi',
    lat: 32.0367625,
    lng: 20.0567031,
    medicalSpecialty: 'Ophthalmology, Refractive Surgery, Vitreoretinal, Cataract',
  },
  theme: {
    primary: {
      '50': '#f2f6f4',
      '100': '#e4ede9',
      '200': '#c9dbd5',
      '300': '#a3c2b9',
      '400': '#74a096',
      '500': '#4f8076',
      '600': '#3b6860',
      '700': '#30544d',
      '800': '#1f4a40',
      '900': '#0b3d33',
      '950': '#08211c',
    },
    surface: {
      '50': '#faf8f4',
      '100': '#f4f1ea',
      '200': '#e9e4d8',
    },
    text: {
      '900': '#16211d',
      '700': '#37443f',
      '500': '#5b6b65',
      '400': '#7d8a84',
      '300': '#9aa6a0',
    },
    accent: {
      '50': '#fbf3e4',
      '100': '#f6e8cc',
      '300': '#eec98a',
      '400': '#e8a33d',
      '500': '#d99430',
      '600': '#b87a22',
    },
  },
  capabilities: {
    visionTest: true,
    costCalculator: true,
    dashboard: true,
    showTechnologies: true,
    showTestimonials: true,
    showFaq: true,
  },
  manifest: {
    nameAr: 'مستشفى كنوز الأهرام لطب وجراحة العيون',
    nameEn: 'Konooz Al-Ahram Eye Hospital',
    shortNameAr: 'كنوز الأهرام',
    shortNameEn: 'Konooz Al-Ahram',
    descriptionAr: 'المستشفى التخصصي الرائد لجراحة وطب العيون في بنغازي، ليبيا - تقنيات الفيمتو ليزك، الفاكو، وجراحات الشبكية',
    descriptionEn: 'Leading specialist hospital for eye surgery and ophthalmology in Benghazi, Libya - Femto LASIK, Phaco, and retinal surgery',
    iconPath: '/images/hospital_hero_surgery_1787188107940.webp',
    themeColor: '#0d9488',
    backgroundColor: '#0a192f',
  },
  llms: {
    contact: 'mailto:tamer4osman@gmail.com',
  },
};
