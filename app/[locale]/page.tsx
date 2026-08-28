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

function SectionSkeleton() {
  return (
    <div className="animate-pulse min-h-[500px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 space-y-6">
        <div className="h-8 bg-bone-200 rounded-xl w-64" />
        <div className="h-4 bg-bone-200 rounded-lg w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-bone-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
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
            <Suspense fallback={<SectionSkeleton />}>
              <ServicesGrid locale={locale} specialties={specialties} />
            </Suspense>
          }
          technologiesSlot={
            <Suspense fallback={<SectionSkeleton />}>
              <TechnologiesSection />
            </Suspense>
          }
          testimonialsSlot={
            <Suspense fallback={<SectionSkeleton />}>
              <TestimonialsSection />
            </Suspense>
          }
          faqsSlot={
            <Suspense fallback={<SectionSkeleton />}>
              <FaqsSection />
            </Suspense>
          }
        />
      </PatientAuthProvider>
    </LanguageProvider>
  );
}

