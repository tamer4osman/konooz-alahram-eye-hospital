import React, { Suspense } from 'react';
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

function SectionSkeleton({ minHeight }: { minHeight: string }) {
  return (
    <div
      className={`w-full ${minHeight} bg-bone-100/60 animate-pulse`}
      aria-hidden="true"
    />
  );
}

async function TechnologiesSection() {
  const technologies = await getTechnologies();
  const TechnologySection = (await import('@/components/TechnologySection')).default;
  return <TechnologySection technologies={technologies} />;
}

async function TestimonialsSection() {
  const [testimonials, trustStats] = await Promise.all([
    getPublicTestimonials(),
    getTrustStats(),
  ]);
  const TestimonialsAndStats = (await import('@/components/TestimonialsAndStats')).default;
  return <TestimonialsAndStats initialTestimonials={testimonials} initialTrustStats={trustStats} />;
}

async function FaqsSection() {
  const faqs = await getFaqs();
  const LocationAndContact = (await import('@/components/LocationAndContact')).default;
  return <LocationAndContact initialFaqs={faqs} />;
}

export default async function LocaleHome({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw === 'en' ? 'en' : 'ar';

  // Shell data: doctors + specialties (needed immediately by LanguageProvider)
  const [doctors, specialties] = await Promise.all([
    getPublicDoctors(),
    getDepartments(),
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
          servicesSlot={
              <ServicesGrid locale={locale} specialties={specialties} />
          }
          technologiesSlot={
            <Suspense fallback={<SectionSkeleton minHeight="min-h-[420px]" />}>
              <TechnologiesSection />
            </Suspense>
          }
          testimonialsSlot={
            <Suspense fallback={<SectionSkeleton minHeight="min-h-[380px]" />}>
              <TestimonialsSection />
            </Suspense>
          }
          faqsSlot={
            <Suspense fallback={<SectionSkeleton minHeight="min-h-[520px]" />}>
              <FaqsSection />
            </Suspense>
          }
        />
      </PatientAuthProvider>
    </LanguageProvider>
  );
}

