import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { PatientAuthProvider } from '@/context/PatientAuthContext';
import HomePageClient from '@/components/HomePageClient';
import { getPublicDoctors } from '@/lib/doctors';
import { getFaqs } from '@/lib/content/faqs';
import { getPublicTestimonials, getTrustStats } from '@/lib/content/public-content';

// Public marketing content is read-mostly: render it into the page itself
// (ISR, revalidated every 5 minutes) instead of re-downloading identical JSON
// per visitor over slow connections. The /api/public/* routes remain for the
// patient portal and external consumers.
export const revalidate = 300;

export default async function Home() {
  const [doctors, testimonials, trustStats, faqs] = await Promise.all([
    getPublicDoctors(),
    getPublicTestimonials(),
    getTrustStats(),
    getFaqs(),
  ]);

  return (
    <LanguageProvider initialDoctors={doctors}>
      <PatientAuthProvider>
        <HomePageClient
          testimonials={testimonials}
          trustStats={trustStats}
          faqs={faqs}
        />
      </PatientAuthProvider>
    </LanguageProvider>
  );
}
