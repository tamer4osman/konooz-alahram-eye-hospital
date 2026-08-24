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

export const HOSPITAL_CONTACTS = {
  nameAr: 'مستشفى كنوز الأهرام لطب وجراحة العيون',
  nameEn: 'Konooz Al-Ahram Eye & Ophthalmic Surgery Hospital',
  taglineAr: 'رؤية أوضح لحياة أفضل.. أحدث جراحات العيون بأيدي نخبة استشاريين دوليين',
  taglineEn: 'Clearer Vision for a Better Life.. Advanced Eye Surgery by International Consultants',
  addressAr: 'طريق طرابلس، بجانب قوس معهد الكهرباء، مقابل أول مدخل بوصنيب، بنغازي، ليبيا',
  addressEn: 'Tripoli Road, next to the Electrical Institute Arch, opposite Bu Sneib 1st entrance, Benghazi, Libya',
  cityAr: 'بنغازي، ليبيا',
  cityEn: 'Benghazi, Libya',
  primaryWhatsApp: '+218915299170',
  primaryWhatsAppDisplay: '091 529 9170',
  secondaryWhatsApp: '+218925299170',
  phoneNumbers: [
    { number: '+218915299170', display: '091 529 9170', labelAr: 'الاستقبال والحجز 1 (واتساب)', labelEn: 'Reception & Booking 1 (WhatsApp)' },
    { number: '+218925299170', display: '092 529 9170', labelAr: 'الاستقبال والحجز 2 (واتساب)', labelEn: 'Reception & Booking 2 (WhatsApp)' },
    { number: '+218921490999', display: '092 149 0999', labelAr: 'خدمة العملاء والعمليات', labelEn: 'Customer Care & Surgeries' },
    { number: '+218911390999', display: '091 139 0999', labelAr: 'قسم العيادات التخصصية', labelEn: 'Specialized Clinics' },
    { number: '+218930999040', display: '093 099 9040', labelAr: 'قسم الليزك والفحوصات', labelEn: 'LASIK & Diagnostics' },
    { number: '+218945006886', display: '094 500 6886', labelAr: 'طوارئ العيون والاستفسارات', labelEn: 'Eye Emergency & Inquiries' },
  ],
  facebookUrl: 'https://www.facebook.com/hospitalpyramid/',
  spitarUrl: 'https://spitar.com',
  googleMapsUrl: 'https://www.google.com/maps/place/%D9%85%D8%B3%D8%AA%D8%B4%D9%81%D9%89+%D9%83%D9%86%D9%88%D8%B2+%D8%A7%D9%84%D8%A7%D9%87%D8%B1%D8%A7%D9%85+%D9%84%D8%B7%D8%A8+%D8%A7%D9%84%D8%B9%D9%8A%D9%88%D9%86%E2%80%AD/@32.036767,20.0541282,17z/data=!3m1!4b1!4m6!3m5!1s0x13831b2d8363f7dd:0x7365037638369b1b!8m2!3d32.0367625!4d20.0567031!16s%2Fg%2F11sxyg5zwp',
  workingHoursAr: 'العيادات والفحوصات: يومياً من 9:00 صباحاً حتى 9:00 مساءً | الطوارئ: 24 ساعة',
  workingHoursEn: 'Clinics & Diagnostics: Daily 9:00 AM – 9:00 PM | Emergency: 24/7',
  coordinates: {
    lat: 32.0367625,
    lng: 20.0567031,
  }
};

export const SPECIALTIES: Specialty[] = [
  {
    id: 'refractive-lasik',
    iconName: 'Sparkles',
    image: '/images/femto_laser_tech_1787188144731.webp',
    titleAr: 'تصحيح الإبصار وزراعة العدسات (Refractive & ICL)',
    titleEn: 'Refractive Surgery & ICL Implants',
    badgeAr: 'أحدث أجهزة الفيمتو ليزر',
    badgeEn: 'Latest Femtosecond Tech',
    shortDescAr: 'تخلص نهائياً من النظارات والعدسات اللاصقة بأحدث تقنيات الفيمتو ليزك، الكاستم ليزك، وزراعة عدسات ICL لدرجات الضعف الشديدة.',
    shortDescEn: 'Eliminate glasses and contact lenses with advanced Femto-LASIK, Ultra-LASIK, PRK, and intraocular ICL lens implants.',
    fullDescAr: 'نقدم في مستشفى كنوز الأهرام أحدث حلول تصحيح عيوب الإبصار (قصر النظر، طول النظر، والاستجماتيزم) باستخدام تقنية الفيمتو ليزك بدون شفرة جراحية مع دقة ميكرونية متناهية، بالإضافة لزراعة عدسات ICL الفائقة لمن لا تناسبهم عمليات الليزر أو يعانون من قرنيات رقيقة.',
    fullDescEn: 'Konooz Al-Ahram offers cutting-edge refractive solutions for myopia, hyperopia, and astigmatism using blade-free Femto-LASIK with micron-level precision, plus phakic ICL implants for high refractive errors or thin corneas.',
    proceduresAr: [
      'فيمتو ليزك (Femto-LASIK) بدون شفرة',
      'كاستم ليزك تفصيلي ببصمة العين (Custom LASIK)',
      'الليزك السطحي وتثبيت القرنية (PRK + CXL)',
      'زراعة العدسات داخل العين (ICL / IPCL)',
      'تصحيح الاستجماتيزم العالي وضعف النظر الشديد',
    ],
    proceduresEn: [
      'Blade-Free Femto-LASIK',
      'Wavefront Custom Contoura LASIK',
      'Surface PRK with Corneal Strengthening',
      'Intraocular Collamer Lens (ICL) Implants',
      'High Astigmatism & Extreme Myopia Correction',
    ],
    technologiesAr: ['Excimer Laser 500Hz', 'Femtosecond Bladeless System', 'Pentacam Cornea Scanner', 'Corneal Wavefront Analyzer'],
    technologiesEn: ['Excimer Laser 500Hz', 'Femtosecond Bladeless System', 'Pentacam Cornea Scanner', 'Corneal Wavefront Analyzer'],
    durationAr: '10 - 15 دقيقة للعينين معاً',
    durationEn: '10 - 15 mins for both eyes',
    recoveryAr: 'استعادة الرؤية خلال 24 ساعة فقط',
    recoveryEn: 'Vision restored within 24 hours',
    suitableForAr: ['أصحاب قصر أو طول النظر من 18 سنة فما فوق', 'من يعانون من سمك قرنية رقيق عبر عدسات ICL', 'الرياضيون وأصحاب المهن الحركية'],
    suitableForEn: ['Ages 18+ with stable refractive errors', 'Thin cornea patients via ICL implants', 'Active individuals & athletes'],
  },
  {
    id: 'cataract-phaco',
    iconName: 'Eye',
    image: '/images/cataract_lens_surgery_1787188187884.webp',
    titleAr: 'جراحة المياه البيضاء بالفاكو (Cataract & Phaco)',
    titleEn: 'Cataract Surgery & Micro-Phaco',
    badgeAr: 'تخدير موضعي بدون ألم',
    badgeEn: 'Painless Topical Anesthesia',
    shortDescAr: 'تفتيت وسحب المياه البيضاء بالموجات فوق الصوتية الدقيقة بدون خياطة جراحية، مع زراعة أحدث العدسات الذكية متعددة البؤر والـ Toric.',
    shortDescEn: 'Ultrasound micro-incisional cataract extraction (Phaco) with premium foldable monofocal, multifocal, and toric IOL implants.',
    fullDescAr: 'تجرى عمليات المياه البيضاء بتقنية الفاكو البارد الحديثة عبر فتحة جراحية ميكرونية لا تتجاوز 2.2 ملم، بدون الحاجة للتخدير الكلي أو الغرز الجراحية، مع خيارات متعددة للعدسات الأمريكية والأوروبية التي تعيد الرؤية للقريب والبعيد معاً دون الحاجة لنظارة قراءة.',
    fullDescEn: 'Cataract extraction is performed via cold ultrasound micro-phaco through a tiny 2.2mm incision with zero stitches or general anesthesia, pairing with premium multifocal and toric lenses to restore near and far vision.',
    proceduresAr: [
      'تفتيت المياه البيضاء بالموجات فوق الصوتية (Phaco)',
      'زراعة العدسات الأمريكية والأوروبية متعددة البؤر (Multifocal IOL)',
      'زراعة عدسات تصحيح الاستجماتيزم (Toric IOL)',
      'علاج المياه البيضاء المصحوبة بارتفاع ضغط العين (الجلوكوما)',
      'مسح عتامة المحفظة الخلفية بليزر الياج (YAG Laser Capsulotomy)',
    ],
    proceduresEn: [
      'Micro-Incisional Phacoemulsification',
      'Premium Multifocal & Trifocal IOL Implantation',
      'Toric Astigmatism-Correcting Lenses',
      'Combined Cataract & Glaucoma Procedures',
      'YAG Laser Capsulotomy for After-Cataract',
    ],
    technologiesAr: ['Alcon Centurion Vision System', 'Zeiss Lumera Surgical Microscope', 'Optical Biometry IOL Master', 'YAG Laser'],
    technologiesEn: ['Alcon Centurion Vision System', 'Zeiss Lumera Surgical Microscope', 'Optical Biometry IOL Master', 'YAG Laser'],
    durationAr: '15 دقيقة فقط تحت تخدير قطرات موضعي',
    durationEn: '15 mins with topical drop anesthesia',
    recoveryAr: 'عودة للحياة الطبيعية في اليوم التالي',
    recoveryEn: 'Return to normal activities next day',
    suitableForAr: ['مرضى المياه البيضاء وتراجع وضوح الرؤية', 'كبار السن الراغبين في الاستغناء عن نظارة القراءة', 'مرضى السكري المصابين بعتامة العدسة'],
    suitableForEn: ['Patients with clouded vision / cataracts', 'Seniors seeking freedom from reading glasses', 'Diabetic patients with lens opacities'],
  },
  {
    id: 'retina-vitreous',
    iconName: 'Activity',
    image: '/images/retina_scan_oct_1787188201209.webp',
    titleAr: 'جراحات الشبكية والجسم الزجاجي (Retina & Vitreous)',
    titleEn: 'Retinal Surgery & Vitrectomy',
    badgeAr: 'استشاريون دوليون متخصصون',
    badgeEn: 'Specialized International Team',
    shortDescAr: 'علاج اعتلال الشبكية السكري، انفصال الشبكية، نزيف الجسم الزجاجي، وثقب مركز الإبصار بأحدث أجهزة استئصال الزجاجي الميكرونية والحقن العلاجي.',
    shortDescEn: 'Treatment of retinal detachment, diabetic retinopathy, vitreous hemorrhage, and macular holes using 25G/27G micro-vitrectomy and anti-VEGF injections.',
    fullDescAr: 'يضم قسم الشبكية بمستشفى كنوز الأهرام أحدث منظومات جراحات الشبكية الدقيقة بدون خياطة (Micro-Incision Vitrectomy)، إلى جانب ليزر الشبكية المتطور وحقن الأدوية المضادة لارتشاح المقولة والاعتلال السكري (Lucentis, Eylea, Ozurdex)، بالتعاون مع نخبة أساتذة جراحة الشبكية من الجامعات المصرية.',
    fullDescEn: 'Our Retina Unit features state-of-the-art sutureless 25G/27G vitrectomy systems, retinal photocoagulation lasers, and therapeutic intravitreal anti-VEGF injections in close collaboration with top Egyptian retinal professors.',
    proceduresAr: [
      'عمليات استئصال الجسم الزجاجي الميكروني (Micro-Vitrectomy 25G/27G)',
      'إصلاح وعلاج انفصال الشبكية بالليزر وحقن الغاز وزيت السيليكون',
      'علاج ارتشاح مركز الإبصار واعتلال الشبكية السكري',
      'جلسات ليزر الأرجون لحماية وتثبيت الشبكية (Argon Laser)',
      'حقن الأدوية الحديثة داخل العين (Anti-VEGF & Steroid Implants)',
      'علاج ثقوب وأغشية مركز الإبصار والتنكس البقعي (AMD)',
    ],
    proceduresEn: [
      '25G/27G Sutureless Micro-Vitrectomy',
      'Retinal Detachment Repair with Silicone Oil / Gas',
      'Diabetic Macular Edema & Retinopathy Care',
      'Argon Laser Photocoagulation',
      'Intravitreal Injections (Anti-VEGF / Implants)',
      'Macular Hole & Epiretinal Membrane Peeling',
    ],
    technologiesAr: ['Constellation Vision Vitrectomy', 'Spectral Domain OCT Angiography', 'Widefield Fundus Imaging', 'Argon Green Laser'],
    technologiesEn: ['Constellation Vision Vitrectomy', 'Spectral Domain OCT Angiography', 'Widefield Fundus Imaging', 'Argon Green Laser'],
    durationAr: '30 - 60 دقيقة حسب نوع الحالة',
    durationEn: '30 - 60 mins depending on case',
    recoveryAr: 'متابعة دورية مع التزام بوضعيات الرأس الموصوفة',
    recoveryEn: 'Follow-up with posture compliance',
    suitableForAr: ['مرضى السكري الذين يعانون من تراجع الرؤية', 'حالات وميض الضوء والستارة السوداء (انفصال الشبكية)', 'حالات نزيف وتليفات قاع العين'],
    suitableForEn: ['Diabetic patients with vision drop', 'Sudden flashes / floaters / curtain shadows', 'Macular hole & hemorrhage patients'],
  },
  {
    id: 'cornea-keratoconus',
    iconName: 'Scan',
    image: '/images/cornea_crosslink_1787190931823.webp',
    titleAr: 'علاج القرنية المخروطية (Cornea & Keratoconus)',
    titleEn: 'Cornea & Keratoconus Management',
    badgeAr: 'تثبيت وحماية القرنية',
    badgeEn: 'Corneal Cross-Linking (CXL)',
    shortDescAr: 'بروتوكولات متكاملة لتشخيص وعلاج القرنية المخروطية: التثبيت الضوئي (CXL)، زراعة الحلقات الدقيقة بالليزر، وزراعة القرنية.',
    shortDescEn: 'Comprehensive management of keratoconus: Corneal Cross-Linking (CXL), Femtosecond intracorneal ring segments (ICRS), and keratoplasty.',
    fullDescAr: 'نقدم كشفاً مبكراً فائق الدقة للقرنية المخروطية باستخدام خريطة البنتاكام ثلاثية الأبعاد، ونوفر علاج التثبيت الضوئي لمنع تدهور الحالة، مع زراعة حلقات القرنية الدقيقة بالفيمتوليزر لتحسين انحناء سطح العين ورفع جودة الرؤية.',
    fullDescEn: 'Early diagnosis using 3D Pentacam corneal tomography, paired with accelerated UV Corneal Cross-Linking to halt disease progression, and Femto-Ring implantation to regularize corneal curvature.',
    proceduresAr: [
      'التثبيت الضوئي للقرنية بالريبوفلافين والأشعة فوق البنفسجية (CXL)',
      'زراعة حلقات القرنية بالفيمتوليزر (Ferrara / Keraring)',
      'العدسات الصلبة والصلبية المتطورة للقرنية المخروطية (Scleral Lenses)',
      'زراعة القرنية الطبقية والكلية (DALK / PKP)',
      'تصوير طبوغرافي عالي الدقة (Pentacam HD)',
    ],
    proceduresEn: [
      'Accelerated Corneal Cross-Linking (CXL)',
      'Femto-Assisted Intracorneal Ring Segments (ICRS)',
      'Custom Scleral & Rigid Gas Permeable Lenses',
      'Lamellar & Full-Thickness Keratoplasty (DALK/PKP)',
      'High-Resolution 3D Pentacam Tomography',
    ],
    technologiesAr: ['Avedro KXL Cross-linking', 'Femtosecond Ring Channel Creator', 'Oculus Pentacam HR', 'Corneal Biomechanics'],
    technologiesEn: ['Avedro KXL Cross-linking', 'Femtosecond Ring Channel Creator', 'Oculus Pentacam HR', 'Corneal Biomechanics'],
    durationAr: '20 - 30 دقيقة للإجراء',
    durationEn: '20 - 30 mins per procedure',
    recoveryAr: 'تحسن تدريجي واستقرار في شكل القرنية',
    recoveryEn: 'Progressive stabilization of cornea',
    suitableForAr: ['المصابون بتغير متكرر في مقاسات النظارة', 'المراهقون والشباب المشخصون بالقرنية المخروطية', 'من يعانون من تشتت شديد في الضوء وهالات ليلية'],
    suitableForEn: ['Patients with frequently changing prescriptions', 'Youth diagnosed with progressive keratoconus', 'Severe ghosting and glare sufferers'],
  },
  {
    id: 'pediatric-strabismus',
    iconName: 'Smile',
    image: '/images/pediatric_eye_care_1787190917908.webp',
    titleAr: 'طب عيون الأطفال والحول (Pediatric Ophthalmology)',
    titleEn: 'Pediatric Ophthalmology & Strabismus',
    badgeAr: 'عيادات مجهزة للأطفال',
    badgeEn: 'Child-Friendly Specialized Unit',
    shortDescAr: 'علاج وتعديل درجات الحول الجراحي وغير الجراحي، علاج كسل العين (Amblyopia)، وفحص عيوب الإبصار ومتابعة حديثي الولادة والمبتسرين.',
    shortDescEn: 'Surgical and non-surgical squint correction, lazy eye (amblyopia) rehabilitation, pediatric refractive screening, and ROP follow-up.',
    fullDescAr: 'وحدة متخصصة تراعي نفسية الطفل وراحته، تقدم أحدث الطرق لتعديل عضلات العين وتصحيح الحول الإنسي والوحشي، بالإضافة لبرامج تدريب وتنشيط العين الكسولة وعلاج انسداد مجرى الدموع الخلقي لدى الرضع.',
    fullDescEn: 'A dedicated, child-friendly unit delivering advanced extraocular muscle adjustment for esotropia and exotropia, vision therapy for lazy eyes, and congenital nasolacrimal duct probing for infants.',
    proceduresAr: [
      'جراحات تعديل عضلات العين وتصحيح الحول (Strabismus Surgery)',
      'برامج علاج كسل العين وتنشيط الرؤية الثنائية (Amblyopia Therapy)',
      'تسليك مجرى الدموع وتوسيع القنوات لحديثي الولادة',
      'فحص قاع العين للأطفال المبتسرين وحديثي الولادة (ROP Screening)',
      'علاج المياه البيضاء والمياه الزرقاء الخلقية لدى الأطفال',
    ],
    proceduresEn: [
      'Strabismus & Squint Realignment Surgeries',
      'Amblyopia (Lazy Eye) Therapy & Patching Regimens',
      'Pediatric Tear Duct Probing & Silicone Intubation',
      'Retinopathy of Prematurity (ROP) Screening',
      'Congenital Cataract & Glaucoma Interventions',
    ],
    technologiesAr: ['Handheld Pediatric Autorefractor', 'Synoptophore Binocular Trainer', 'Pediatric Indirect Ophthalmoscope'],
    technologiesEn: ['Handheld Pediatric Autorefractor', 'Synoptophore Binocular Trainer', 'Pediatric Indirect Ophthalmoscope'],
    durationAr: '30 - 45 دقيقة',
    durationEn: '30 - 45 mins',
    recoveryAr: 'نتائج فورية وجمالية ممتازة مع تحسن محاذاة العين',
    recoveryEn: 'Prompt alignment and cosmetic recovery',
    suitableForAr: ['الأطفال المصابون بميل أو انحراف بإحدى العينين', 'الأطفال الذين يعانون من تشتت التركيز وكسل العين', 'المواليد الجدد الذين يعانون من إفرازات مستمرة بالعين'],
    suitableForEn: ['Children with misaligned or crossed eyes', 'Kids with unequal vision / lazy eye', 'Infants with chronic tearing or discharge'],
  },
  {
    id: 'oculoplastics',
    iconName: 'ShieldAlert',
    image: '/images/oculoplastics_eye_1787190943890.webp',
    titleAr: 'تجميل العيون ومجرى الدموع (Oculoplastics & Orbit)',
    titleEn: 'Oculoplastics & Lacrimal Surgery',
    badgeAr: 'دقة جراحية ونتائج جمالية',
    badgeEn: 'Esthetic & Functional Precision',
    shortDescAr: 'شد ورفع الجفون المتهدلة (Blepharoplasty)، علاج ارتخاء الجفون، جراحات تسليك وتركيب دعامات مجرى الدموع، وأورام وتجاويف الحجاج.',
    shortDescEn: 'Eyelid lift (blepharoplasty), ptosis correction, endoscopic DCR tear duct surgery, orbital reconstruction, and cosmetic periorbital care.',
    fullDescAr: 'تجمع جراحات تجميل العين بين إصلاح الوظيفة الحيوية للجفن واستعادة المظهر الطبيعي المريح، كإزالة الجلد الزائد والدهون حول العين التي تعيق مجال الرؤية، وتعديل الجفون المنقلبة للداخل أو الخارج، وعلاج الدمعان المزمن بعمليات DCR الدقيقة.',
    fullDescEn: 'Oculoplastics merges functional optical protection with aesthetic rejuvenation, including blepharoplasty to expand visual field, ptosis repair, and endonasal DCR for chronic tearing.',
    proceduresAr: [
      'قص وشد الجفون التجميلي والوظيفي (Blepharoplasty)',
      'إصلاح ارتخاء وهبوط الجفن العلوي (Ptosis Repair)',
      'جراحة توصيل مجرى الدموع بالمنظار وتركيب الدعامات (DCR)',
      'تعديل الجفن المنقلب للداخل أو الخارج (Entropion / Ectropion)',
      'إزالة الأكياس الدهنية والأورام السطحية حول العين بدقة متناهية',
      'حقن البوتوكس العلاجي لتقلصات وتشنجات عضلات الجفن (Blepharospasm)',
    ],
    proceduresEn: [
      'Upper & Lower Eyelid Blepharoplasty',
      'Ptosis (Droopy Eyelid) Repair',
      'Endoscopic Dacryocystorhinostomy (DCR)',
      'Entropion & Ectropion Realignment',
      'Benign Lesion & Chalazion Excision with Micro-Suturing',
      'Therapeutic Botox for Blepharospasm & Hemifacial Spasm',
    ],
    technologiesAr: ['Radiofrequency Micro-Cautery', 'High-Res Endoscopic Tower', 'Microsurgical Reconstructive Instruments'],
    technologiesEn: ['Radiofrequency Micro-Cautery', 'High-Res Endoscopic Tower', 'Microsurgical Reconstructive Instruments'],
    durationAr: '30 - 50 دقيقة',
    durationEn: '30 - 50 mins',
    recoveryAr: 'العودة للعمل خلال 5 إلى 7 أيام',
    recoveryEn: 'Return to normal activities in 5-7 days',
    suitableForAr: ['من يعانون من ترهل الجفون وحجب الرؤية العلوية', 'مرضى الدمعان المستمر وانسداد القنوات الدمعية', 'حالات ارتخاء الجفن الولادي أو المكتسب'],
    suitableForEn: ['Patients with droopy lids obstructing vision', 'Chronic tearing and epiphora sufferers', 'Patients with eyelid spasms or asymmetry'],
  },
];

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

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    patientNameAr: 'الأستاذ عبد الله السنوسي',
    patientNameEn: 'Mr. Abdallah El-Senussi',
    cityAr: 'بنغازي',
    cityEn: 'Benghazi',
    procedureAr: 'عملية فيمتو ليزك لتصحيح قصر النظر والاستجماتيزم',
    procedureEn: 'Femto-LASIK for Myopia & Astigmatism',
    doctorAr: 'د. طارق الشناوي',
    doctorEn: 'Dr. Tarek El-Shennawy',
    commentAr: 'تجربة استثنائية غيرت حياتي.. كنت أعاني من ضعف نظر حاد منذ أكثر من 15 عاماً. تمت العملية خلال 10 دقائق فقط وبدون أي ألم، وفي اليوم التالي قمت بقيادة سيارتي برؤية 6/6 نقية تماماً. شكراً لمستشفى كنوز الأهرام على المعاملة الراقية والاهتمام الفائق.',
    commentEn: 'A truly life-changing experience. I had severe myopia for over 15 years. The surgery took only 10 minutes with zero pain, and the next morning I was driving with crisp 20/20 vision. Deep gratitude to Konooz Al-Ahram for their utmost professionalism.',
    rating: 5,
    dateAr: 'منذ شهرين',
    dateEn: '2 months ago',
  },
  {
    id: 't2',
    patientNameAr: 'الحاجة خديجة الورفلي',
    patientNameEn: 'Hajja Khadija El-Warfali',
    cityAr: 'بنغازي (طريق طرابلس)',
    cityEn: 'Benghazi (Tripoli Rd)',
    procedureAr: 'إزالة مياه بيضاء بالفاكو وزراعة عدسة أمريكية ثلاثية البؤر',
    procedureEn: 'Micro-Phaco with American Trifocal Lens Implant',
    doctorAr: 'د. فاطمة الفيتوري',
    doctorEn: 'Dr. Fatima Al-Fitouri',
    commentAr: 'كنت خائفة جداً من العملية بسبب تقدم سني وإصابتي بالسكر، لكن الدكتورة فاطمة وفريق المستشفى طمأنوني. العملية تمت بتخدير قطرات وبدون أي خياطة. الآن أقرأ القرآن الكريم وأشاهد التلفاز بوضوح تام دون الحاجة لأي نظارة.',
    commentEn: 'I was very anxious due to my age and diabetes, but Dr. Fatima and the team made me feel completely safe. The surgery was done in minutes with just eye drops and no stitches. Today I read clearly without glasses!',
    rating: 5,
    dateAr: 'منذ 3 أسابيع',
    dateEn: '3 weeks ago',
  },
  {
    id: 't3',
    patientNameAr: 'المهندس سالم المنفي',
    patientNameEn: 'Eng. Salem El-Manfi',
    cityAr: 'طبرق / بنغازي',
    cityEn: 'Tobruk / Benghazi',
    procedureAr: 'جراحة استئصال الزجاجي وتثبيت انفصال الشبكية بالليزر',
    procedureEn: 'Micro-Vitrectomy & Retinal Detachment Laser Repair',
    doctorAr: 'أ.د. حسام عبد الرحمن',
    doctorEn: 'Prof. Dr. Hossam Abdelrahman',
    commentAr: 'أصبت بانفصال مفاجئ في الشبكية وفقدت الرؤية في عيني اليمنى. نصحني الأطباء بالذهاب مباشرة لكنوز الأهرام لوجود الاستشاري المصري د. حسام. أجرى لي العملية بنجاح تام وتم استعادة النظر وتفادي السفر للخارج وتكاليفه الباهظة.',
    commentEn: 'I suffered a sudden retinal detachment and lost vision in my right eye. Doctors referred me immediately to Konooz Al-Ahram. Prof. Hossam operated on me successfully, saving my vision and sparing me expensive travel abroad.',
    rating: 5,
    dateAr: 'منذ أسبوعين',
    dateEn: '2 weeks ago',
  },
  {
    id: 't4',
    patientNameAr: 'أم يوسف (والدة الطفل يوسف)',
    patientNameEn: 'Um Youssef (Mother of Youssef)',
    cityAr: 'المرج / بنغازي',
    cityEn: 'Al-Marj / Benghazi',
    procedureAr: 'تعديل الحول الإنسي للطفل يوسف (5 سنوات)',
    procedureEn: 'Pediatric Strabismus Alignment for 5-year-old',
    doctorAr: 'أ.د. مصطفى كمال الدين',
    doctorEn: 'Prof. Dr. Mostafa Kamaleldin',
    commentAr: 'ابني كان يعاني من حول شديد في عينه اليسرى أثر على ثقته بنفسه. أجرى له الدكتور مصطفى عملية تعديل العضلات، والنتيجة كانت مبهرة ومطابقة تماماً. أسلوب التعامل مع الأطفال في المستشفى راقٍ ومطمئن جداً.',
    commentEn: 'My son had marked squint in his left eye affecting his confidence. Prof. Mostafa performed the alignment surgery and the cosmetic and visual result is wonderful. The staff treats children with incredible gentleness.',
    rating: 5,
    dateAr: 'منذ شهر',
    dateEn: '1 month ago',
  },
];

export const TRUST_STATS = [
  { value: '+10,000', labelAr: 'عملية عيون ناجحة', labelEn: 'Successful Surgeries', icon: 'CheckCircle2' },
  { value: '6+', labelAr: 'عيادات تخصصية دقيقة', labelEn: 'Sub-Specialized Clinics', icon: 'Building' },
  { value: '100%', labelAr: 'بروتوكولات تعقيم دولية', labelEn: 'Sterilization Compliance', icon: 'ShieldCheck' },
  { value: '24/7', labelAr: 'طوارئ إصابات العيون', labelEn: 'Emergency Eye Support', icon: 'Clock' },
];

export const FAQ_LIST = [
  {
    qAr: 'هل عملية الفيمتو ليزك مؤلمة وكم تستغرق؟',
    qEn: 'Is Femto-LASIK painful and how long does it take?',
    aAr: 'العملية غير مؤلمة تماماً حيث تجرى تحت تخدير موضعي بقطرات مخدرة للعين دون أي حقن. تستغرق العملية حوالي 10 إلى 15 دقيقة للعينين معاً، ويشعر المريض بتحسن كبير في الرؤية خلال ساعات قليلة.',
    aEn: 'The procedure is completely painless, performed under topical anesthetic eye drops with zero needles. It takes about 10-15 minutes for both eyes, with significant visual recovery within hours.',
  },
  {
    qAr: 'ما الفرق بين المياه البيضاء والمياه الزرقاء؟',
    qEn: 'What is the difference between Cataracts and Glaucoma?',
    aAr: 'المياه البيضاء (الكاتاراكت) هي عتامة تصيب عدسة العين الطبيعية ويتم علاجها نهائياً بعملية الفاكو البسيطة وزراعة عدسة بديلة. أما المياه الزرقاء (الجلوكوما) فهي ارتفاع في ضغط العين يؤثر على العصب البصري ويتطلب فحصاً دورياً وعلاجاً مبكراً بالقطرات أو الليزر أو الجراحة للحفاظ على مجال الرؤية.',
    aEn: 'Cataract is the clouding of the eye’s natural lens, cured definitively via micro-phaco and lens implantation. Glaucoma is elevated intraocular pressure threatening the optic nerve, managed through drops, laser, or surgery to preserve visual fields.',
  },
  {
    qAr: 'كيف يمكنني حجز موعد مع الاستشاريين الزائرين من مصر؟',
    qEn: 'How can I book an appointment with visiting Egyptian consultants?',
    aAr: `يمكنك الحجز بسهولة عبر نموذج الحجز المباشر في هذا الموقع، أو التواصل مباشرة عبر الواتساب على الرقم ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay} أو ${HOSPITAL_CONTACTS.phoneNumbers[1].display}، أو من خلال تطبيق "سبيتار" المعتمد. يفضل الحجز المسبق لضمان توفر موعد مناسب قبل اكتمال القوائم.`,
    aEn: `You can easily book through our online quick booking form, direct WhatsApp (${HOSPITAL_CONTACTS.primaryWhatsApp} / ${HOSPITAL_CONTACTS.secondaryWhatsApp}), or via the Spitar healthcare app. Early booking is advised due to high demand during consultant visit windows.`,
  },
  {
    qAr: 'هل يتوفر لديكم علاج لمن لا تناسبهم عمليات الليزك؟',
    qEn: 'Do you offer alternatives for patients not eligible for LASIK?',
    aAr: 'نعم بكل تأكيد! نوفر أحدث تقنيات زراعة العدسات داخل العين (ICL / IPCL) بدون المساس بسماكة القرنية، وهي الحل الأمثل لدرجات الضعف الشديدة (-10 إلى -20) والقرنيات الرقيقة، بالإضافة لعلاج تثبيت القرنية المخروطية (CXL) وزراعة الحلقات.',
    aEn: 'Yes, absolutely! We offer advanced Phakic ICL/IPCL lens implants preserving corneal integrity—ideal for extreme myopia (-10 to -20D) or thin corneas—alongside corneal cross-linking and intracorneal rings.',
  },
  {
    qAr: 'أين يقع المستشفى بالتحديد في بنغازي؟',
    qEn: 'Where is the hospital located in Benghazi?',
    aAr: 'يقع مستشفى كنوز الأهرام في موقع استراتيجي سهل الوصول على طريق طرابلس الرئيسي في بنغازي، بجانب قوس معهد الكهرباء، مباشرة مقابل أول مدخل منطقة بوصنيب، وتتوفر مواقف سيارات مريحة للمرضى.',
    aEn: 'Konooz Al-Ahram is conveniently located on Tripoli Road in Benghazi, next to the Electrical Institute Arch, opposite the 1st Bu Sneib entrance, with ample patient parking available.',
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


