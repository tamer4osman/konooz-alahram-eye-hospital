import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { PatientAuthProvider } from '@/context/PatientAuthContext';

export default async function PortalLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw === 'en' ? 'en' : 'ar';

  return (
    <LanguageProvider key={locale} initialLocale={locale} initialDoctors={[]} initialSpecialties={[]}>
      <PatientAuthProvider>{children}</PatientAuthProvider>
    </LanguageProvider>
  );
}
