import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { PatientAuthProvider } from '@/context/PatientAuthContext';
import HomePageClient from '@/components/HomePageClient';
import ServicesGrid from '@/components/ServicesGrid';
import { getPublicDoctors } from '@/lib/doctors';
import { getDepartments } from '@/lib/departments';
import { getTechnologies } from '@/lib/technologies';
import { getFaqs } from '@/lib/content/faqs';
import { getPublicTestimonials, getTrustStats } from '@/lib/content/public-content';

export const revalidate = 300;

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw === 'en' ? 'en' : 'ar';
  const [doctors, specialties, technologies, testimonials, trustStats, faqs] = await Promise.all([
    getPublicDoctors(),
    getDepartments(),
    getTechnologies(),
    getPublicTestimonials(),
    getTrustStats(),
    getFaqs(),
  ]);

  return (
    <LanguageProvider
      key={locale}
      initialLocale={locale}
      initialDoctors={doctors}
      initialSpecialties={specialties}
    >
      <PatientAuthProvider>
        <HomePageClient
          testimonials={testimonials}
          trustStats={trustStats}
          faqs={faqs}
          technologies={technologies}
          servicesSlot={<ServicesGrid locale={locale} />}
        />
      </PatientAuthProvider>
    </LanguageProvider>
  );
}

