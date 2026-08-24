import React from 'react';
import { HOSPITAL_CONTACTS, SPECIALTIES, FAQ_LIST } from '@/data/hospitalData';
import { getPublicDoctors } from '@/lib/doctors';

export default async function SEOStructuredData() {
  const doctors = await getPublicDoctors();
  const hospitalSchema = {
    '@context': 'https://schema.org',
    '@type': ['Hospital', 'MedicalBusiness', 'MedicalClinic', 'EmergencyService'],
    '@id': 'https://konozealahram-eye.ly/#hospital',
    name: HOSPITAL_CONTACTS.nameAr,
    alternateName: [
      HOSPITAL_CONTACTS.nameEn,
      'مستشفى كنوز الأهرام للعيون',
      'كنوز الأهرام لطب وجراحة العيون بنغازي',
      'Konooz Al-Ahram Eye Hospital',
      'Pyramid Eye Hospital Benghazi'
    ],
    url: 'https://konozealahram-eye.ly',
    logo: 'https://konozealahram-eye.ly/images/hospital_hero_surgery_1787188107940.webp',
    image: [
      'https://konozealahram-eye.ly/images/hospital_exterior_facade_1787188119953.webp',
      'https://konozealahram-eye.ly/images/hospital_hero_surgery_1787188107940.webp',
      'https://konozealahram-eye.ly/images/femto_laser_tech_1787188144731.webp'
    ],
    description: 'المستشفى التخصصي الرائد لطب وجراحة العيون في بنغازي - ليبيا. يقدم أحدث عمليات تصحيح الإبصار بالفيمتو ليزك والفيمتو سمايل، علاج المياه البيضاء بالفاكو والعدسات متعددة البؤر، جراحة الشبكية والجسم الزجاجي، وزراعة وتثبيت القرنية المخروطية.',
    telephone: '+218915299170',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: '+218915299170',
        contactType: 'reservations',
        areaServed: 'LY',
        availableLanguage: ['Arabic', 'English']
      },
      {
        '@type': 'ContactPoint',
        telephone: '+218945006886',
        contactType: 'emergency',
        areaServed: 'LY',
        availableLanguage: ['Arabic', 'English']
      }
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'طريق طرابلس، بجانب قوس معهد الكهرباء، مقابل أول مدخل بوصنيب',
      addressLocality: 'بنغازي',
      addressRegion: 'Benghazi District',
      addressCountry: 'LY'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: HOSPITAL_CONTACTS.coordinates.lat,
      longitude: HOSPITAL_CONTACTS.coordinates.lng
    },
    hasMap: HOSPITAL_CONTACTS.googleMapsUrl,
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '09:00',
        closes: '21:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        description: 'طوارئ العيون والإصابات الحرجة',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday'
        ],
        opens: '00:00',
        closes: '23:59'
      }
    ],
    priceRange: '$$',
    currenciesAccepted: 'LYD',
    paymentAccepted: 'Cash, Bank Transfer, Certified Cheque, Spitar App, Tadawul',
    medicalSpecialty: [
      'http://schema.org/Ophthalmologic',
      'Refractive Surgery',
      'Cataract & Lens Surgery',
      'Vitreoretinal Surgery',
      'Pediatric Ophthalmology & Strabismus',
      'Cornea & External Eye Diseases',
      'Glaucoma & Intraocular Pressure',
      'Oculoplastics & Orbital Surgery'
    ],
    availableService: SPECIALTIES.map((s) => ({
      '@type': 'MedicalProcedure',
      name: s.titleAr,
      alternateName: s.titleEn,
      description: s.shortDescAr,
      procedureType: 'http://schema.org/SurgicalProcedure'
    })),
    sameAs: [
      HOSPITAL_CONTACTS.facebookUrl,
      HOSPITAL_CONTACTS.googleMapsUrl,
      HOSPITAL_CONTACTS.spitarUrl
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_LIST.map((faq) => ({
      '@type': 'Question',
      name: faq.qAr,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.aAr
      }
    }))
  };

  const doctorsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'استشاريو وأطباء جراحة العيون بمستشفى كنوز الأهرام',
    itemListElement: doctors.map((doc, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Physician',
        name: doc.nameAr,
        alternateName: doc.nameEn,
        medicalSpecialty: doc.titleAr,
        worksFor: {
          '@id': 'https://konozealahram-eye.ly/#hospital'
        },
        description: `${doc.titleAr} - ${doc.titleEn}`
      }
    }))
  };

  const medicalWebPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: 'مستشفى كنوز الأهرام لطب وجراحة العيون | بنغازي ليبيا',
    url: 'https://konozealahram-eye.ly',
    about: {
      '@type': 'MedicalCondition',
      name: 'أمراض وجراحات العيون وتصحيح البصر'
    },
    specialty: 'Ophthalmology',
    inLanguage: ['ar-LY', 'en-US'],
    lastReviewed: '2026-08-20'
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hospitalSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorsSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(medicalWebPageSchema) }}
      />
    </>
  );
}

