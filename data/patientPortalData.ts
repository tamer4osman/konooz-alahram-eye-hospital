export interface PatientProfile {
  id: string;
  nationalId: string;
  fullNameAr: string;
  fullNameEn: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bloodGroup: string;
  cityAr: string;
  cityEn: string;
  insuranceProviderId: string;
  insuranceProviderName: string;
  insurancePolicyNo: string;
  allergiesAr: string[];
  allergiesEn: string[];
  chronicConditionsAr: string[];
  chronicConditionsEn: string[];
  emergencyContact: {
    name: string;
    relationAr: string;
    relationEn: string;
    phone: string;
  };
  securitySettings?: {
    passwordLastChanged: string;
    twoFactorEnabled: boolean;
    lastLoginTimestamp: string;
  };
  refractiveData: {
    odSphere: string;
    odCyl: string;
    odAxis: string;
    osSphere: string;
    osCyl: string;
    osAxis: string;
    lastChecked: string;
  };
  communicationPreferences: {
    emailNotifications: boolean;
    whatsappAlerts: boolean;
    appointmentReminders: boolean;
    eyeDropScheduleAlerts: boolean;
    postOpCareGuides: boolean;
    queueTurnAlerts: boolean;
    newsletterSubscribed: boolean;
    newsletterTopics: string[];
  };
  appointments: Array<{
    id: string;
    ticketNumber: string;
    doctorNameAr: string;
    doctorNameEn: string;
    specialtyAr: string;
    specialtyEn: string;
    date: string;
    time: string;
    status: 'confirmed' | 'completed' | 'in_queue' | 'scheduled';
    room: string;
    instructionsAr?: string;
    instructionsEn?: string;
  }>;
  prescriptions: Array<{
    id: string;
    date: string;
    doctorAr: string;
    doctorEn: string;
    diagnosisAr: string;
    diagnosisEn: string;
    medications: Array<{
      name: string;
      dosageAr: string;
      dosageEn: string;
      frequencyAr: string;
      frequencyEn: string;
      targetEye: 'OD' | 'OS' | 'Both';
      durationAr: string;
      durationEn: string;
    }>;
  }>;
  notificationHistory: Array<{
    id: string;
    channel: 'whatsapp' | 'email';
    titleAr: string;
    titleEn: string;
    bodyAr: string;
    bodyEn: string;
    timestamp: string;
    status: 'delivered' | 'sent' | 'read';
  }>;
}

export const NEWSLETTER_TOPICS = [
  {
    id: 'lasik_advances',
    titleAr: 'أحدث تقنيات الفيمتو ليزك وتصحيح الإبصار بالليزر',
    titleEn: 'Femto-LASIK & Modern Refractive Laser Advances',
    icon: 'Sparkles',
    frequencyAr: 'شهرياً',
    frequencyEn: 'Monthly'
  },
  {
    id: 'cataract_care',
    titleAr: 'دليل المياه البيضاء وزراعة العدسات الذكية ثلاثية البؤر',
    titleEn: 'Cataract Care & Premium Trifocal / Toric IOL Guide',
    icon: 'Eye',
    frequencyAr: 'نصف شهري',
    frequencyEn: 'Bi-weekly'
  },
  {
    id: 'dry_eye_climate',
    titleAr: 'وقاية وعلاج جفاف العين وإجهاد الشاشات في المناخ الليبي',
    titleEn: 'Dry Eye Relief & Screen Strain in North African Climate',
    icon: 'ShieldCheck',
    frequencyAr: 'أسبوعياً',
    frequencyEn: 'Weekly'
  },
  {
    id: 'diabetic_retina',
    titleAr: 'العناية بشبكية مرضى السكري وضغط الدم',
    titleEn: 'Diabetic Retinopathy & Hypertensive Eye Care',
    icon: 'Activity',
    frequencyAr: 'شهرياً',
    frequencyEn: 'Monthly'
  },
  {
    id: 'pediatric_vision',
    titleAr: 'صحة عيون الأطفال وعلاج كسل العين والحول مبكراً',
    titleEn: 'Pediatric Ophthalmology & Early Amblyopia Prevention',
    icon: 'Users',
    frequencyAr: 'شهرياً',
    frequencyEn: 'Monthly'
  }
];

export const NEWSLETTER_ISSUES = [
  {
    id: 'issue-01',
    date: 'أغسطس 2026 / August 2026',
    titleAr: 'دليلك الشامل لعمليات تصحيح النظر: كيف تختار بين الفيمتو ليزك والفيمتو سمايل؟',
    titleEn: 'Comprehensive Guide to Vision Correction: Femto-LASIK vs. SMILE',
    categoryAr: 'تقنيات تصحيح الإبصار',
    categoryEn: 'Refractive Surgery',
    readTimeAr: 'قراءة 4 دقائق',
    readTimeEn: '4 min read',
    summaryAr: 'شرح مبسط للفروقات التقنية بين جراحة الفيمتو ليزك وبصمة العين والفيمتو سمايل، وكيف يحدد الاستشاري الخيار الأنسب لسمك وتحدب قرنيتك في مستشفى كنوز الأهرام.',
    summaryEn: 'A breakdown of Femto-LASIK, Wavefront-Guided Custom LASIK, and SMILE to help you understand how corneal thickness determines your optimal surgical candidacy.'
  },
  {
    id: 'issue-02',
    date: 'يوليو 2026 / July 2026',
    titleAr: 'طفرة العدسات الذكية: كيف تستعيد الرؤية للقريب والبعيد دون نظارات بعد إزالة المياه البيضاء',
    titleEn: 'Premium Intraocular Lenses: Restoring Near & Far Vision Post-Cataract',
    categoryAr: 'المياه البيضاء',
    categoryEn: 'Cataract & IOLs',
    readTimeAr: 'قراءة 5 دقائق',
    summaryAr: 'استعراض لأحدث عدسات PanOptix و Alcon Vivity ثلاثية البؤر ومصححة للاستجماتيزم المتوفرة في المستشفى والتي تتيح للمريض ممارسة حياته اليومية والقراءة دون نظارة.',
    summaryEn: 'Review of modern trifocal and EDOF toric intraocular lenses available at Konooz Al-Ahram that eliminate reading and distance glasses post-cataract.'
  },
  {
    id: 'issue-03',
    date: 'يونيو 2026 / June 2026',
    titleAr: 'حماية شبكية العين لمرضى السكري في ليبيا: الفحص الدوري يمنع فقدان البصر',
    titleEn: 'Protecting the Diabetic Retina: Why Early Screening Prevents Vision Loss',
    categoryAr: 'أمراض الشبكية',
    categoryEn: 'Retinal Health',
    readTimeAr: 'قراءة 3 دقائق',
    summaryAr: 'أهمية فحص قاع العين المجهري والأشعة المقطعية OCT سنوياً لكل مريض سكري للكشف المبكر عن ارتشاح مركز الإبصار وعلاجه بحقن الإيليا أو الليزر دون جراحة.',
    summaryEn: 'The critical role of annual dilated fundus examinations and OCT imaging in detecting macular edema early and treating it with modern Anti-VEGF injections.'
  }
];
