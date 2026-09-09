import React from 'react';
import { tenantConfig } from '@/config/tenant';
import { getFaqs } from '@/lib/content/faqs';
import { getPublicDoctors } from '@/lib/doctors';
import { getDepartments } from '@/lib/departments';
import { safeJsonLd } from '@/lib/security/jsonld';
import { getNonce } from '@/lib/security/csp';

export default async function SEOStructuredData({ locale = 'ar' }: { locale?: string }) {
  const [doctors, faqs, specialties, nonce] = await Promise.all([
    getPublicDoctors(),
    getFaqs(),
    getDepartments(),
    getNonce(),
  ]);
  const BASE = tenantConfig.urls.baseUrl;
  const { contacts, geo, seo, identity } = tenantConfig;
  const hospitalSchema = {
    '@context': 'https://schema.org',
    '@type': ['Hospital', 'MedicalBusiness', 'MedicalClinic', 'EmergencyService'],
    '@id': `${BASE}/#hospital`,
    name: identity.nameAr,
    alternateName: [
      identity.nameEn,
      identity.shortNameAr,
      `${identity.orgTypeAr} ${identity.shortNameAr}`,
    ],
    url: BASE,
    logo: `${BASE}${seo.ogImages[0].path}`,
    image: seo.ogImages.map((img) => `${BASE}${img.path}`),
    description: seo.descriptionAr,
    telephone: contacts.primaryWhatsApp,
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: contacts.primaryWhatsApp,
        contactType: 'reservations',
        areaServed: 'LY',
        availableLanguage: ['Arabic', 'English']
      },
      ...(contacts.emergencyPhone
        ? [
            {
              '@type': 'ContactPoint',
              telephone: contacts.emergencyPhone,
              contactType: 'emergency',
              areaServed: 'LY',
              availableLanguage: ['Arabic', 'English']
            },
          ]
        : []),
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: contacts.addressAr,
      addressLocality: contacts.cityAr,
      addressRegion: geo.placename,
      addressCountry: 'LY'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: geo.lat,
      longitude: geo.lng
    },
    hasMap: tenantConfig.urls.googleMapsUrl,
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
    paymentAccepted: 'Cash, Bank Transfer, Certified Cheque, Spitar App, Tadawul, Moamalat Cards, EDFali, Sadad (via DPAY)',
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
    availableService: specialties.map((s) => ({
      '@type': 'MedicalProcedure',
      name: s.titleAr,
      alternateName: s.titleEn,
      description: s.shortDescAr,
      procedureType: 'http://schema.org/SurgicalProcedure'
    })),
    sameAs: [
      tenantConfig.urls.facebookUrl,
      tenantConfig.urls.googleMapsUrl,
      tenantConfig.urls.partnerUrl,
    ].filter(Boolean),
  };

  const isAr = locale === 'ar';
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: isAr ? faq.qAr : faq.qEn,
      acceptedAnswer: {
        '@type': 'Answer',
        text: isAr ? faq.aAr : faq.aEn
      }
    }))
  };

  const doctorsSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `استشاريو وأطباء ${identity.orgTypeAr} ${identity.shortNameAr}`,
    itemListElement: doctors.map((doc, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      item: {
        '@type': 'Physician',
        name: doc.nameAr,
        alternateName: doc.nameEn,
        medicalSpecialty: doc.titleAr,
        worksFor: {
          '@id': `${BASE}/#hospital`
        },
        description: `${doc.titleAr} - ${doc.titleEn}`
      }
    }))
  };

  const medicalWebPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: seo.titleAr,
    url: BASE,
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
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: safeJsonLd(hospitalSchema) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: safeJsonLd(doctorsSchema) }}
      />
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: safeJsonLd(medicalWebPageSchema) }}
      />
    </>
  );
}

