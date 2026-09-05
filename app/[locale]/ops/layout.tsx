import React from 'react';
import { LanguageProvider } from '@/context/LanguageContext';
import { StaffAuthProvider } from '@/context/StaffAuthContext';

export default async function OpsLayout({
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
      <StaffAuthProvider>
        {children}
      </StaffAuthProvider>
    </LanguageProvider>
  );
}
