'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Specialty } from '@/data/hospitalData';
import type { Doctor } from '@/data/hospitalData';
import { AccessibilityProvider, useAccessibility } from '@/context/AccessibilityContext';
import { ModalProvider, useModals } from '@/context/ModalContext';
import { ViewProvider, useView } from '@/context/ViewContext';

export type Language = 'ar' | 'en';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: boolean;
  t: (ar: string, en: string) => string;
  doctors: Doctor[];
  specialties: Specialty[];
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleHighContrast: () => void;
  readingRuler: boolean;
  toggleReadingRuler: () => void;

  activeView: 'portal' | 'dashboard';
  setActiveView: (view: 'portal' | 'dashboard') => void;
  toggleView: () => void;

  isBookingModalOpen: boolean;
  bookingDoctorId: string | null;
  bookingSpecialtyId: string | null;
  openBookingModal: (specialtyId?: string, doctorId?: string) => void;
  closeBookingModal: () => void;

  isSpecialtyModalOpen: boolean;
  activeSpecialty: Specialty | null;
  openSpecialtyModal: (specialty: Specialty) => void;
  closeSpecialtyModal: () => void;

  isVisionTestModalOpen: boolean;
  openVisionTestModal: () => void;
  closeVisionTestModal: () => void;

  isQueueModalOpen: boolean;
  openQueueModal: () => void;
  closeQueueModal: () => void;

  isCostCalculatorModalOpen: boolean;
  openCostCalculatorModal: () => void;
  closeCostCalculatorModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_COOKIE = 'konooz_lang';

/**
 * Core language provider — handles locale, translation, and data.
 * Wraps AccessibilityProvider, ModalProvider, and ViewProvider.
 */
export function LanguageProvider({
  children,
  initialLocale = 'ar',
  initialDoctors = [],
  initialSpecialties = [],
}: {
  children: React.ReactNode;
  initialLocale?: Language;
  initialDoctors?: Doctor[];
  initialSpecialties?: Specialty[];
}) {
  const router = useRouter();
  const [lang] = useState<Language>(initialLocale);
  const [doctors] = useState<Doctor[]>(initialDoctors ?? []);
  const [specialties] = useState<Specialty[]>(initialSpecialties ?? []);

  const setLang = useCallback(
    (newLang: Language) => {
      if (newLang === lang) return;
      try {
        document.cookie = `${LOCALE_COOKIE}=${newLang}; path=/; max-age=31536000; samesite=lax`;
      } catch {
        // cookie blocked - navigation still switches the visible locale
      }
      router.push(`/${newLang}`);
    },
    [lang, router],
  );

  const t = useCallback((ar: string, en: string) => (lang === 'ar' ? ar : en), [lang]);

  const isRTL = lang === 'ar';

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        isRTL,
        t,
        doctors,
        specialties,
        // Placeholder values — overridden by inner providers via useLanguage shim
        fontSize: 'base',
        setFontSize: () => {},
        increaseFontSize: () => {},
        decreaseFontSize: () => {},
        resetFontSize: () => {},
        highContrast: false,
        setHighContrast: () => {},
        toggleHighContrast: () => {},
        readingRuler: false,
        toggleReadingRuler: () => {},
        activeView: 'portal',
        setActiveView: () => {},
        toggleView: () => {},
        isBookingModalOpen: false,
        bookingDoctorId: null,
        bookingSpecialtyId: null,
        openBookingModal: () => {},
        closeBookingModal: () => {},
        isSpecialtyModalOpen: false,
        activeSpecialty: null,
        openSpecialtyModal: () => {},
        closeSpecialtyModal: () => {},
        isVisionTestModalOpen: false,
        openVisionTestModal: () => {},
        closeVisionTestModal: () => {},
        isQueueModalOpen: false,
        openQueueModal: () => {},
        closeQueueModal: () => {},
        isCostCalculatorModalOpen: false,
        openCostCalculatorModal: () => {},
        closeCostCalculatorModal: () => {},
      }}
    >
      <ViewProvider>
        <ModalProvider>
          <AccessibilityProvider>
            {children}
          </AccessibilityProvider>
        </ModalProvider>
      </ViewProvider>
    </LanguageContext.Provider>
  );
}

/**
 * Compatibility shim — combines core language context with delegated
 * accessibility, modal, and view contexts. Existing consumers continue
 * to work unchanged. The openBookingModal wrapper preserves the original
 * doctor → specialty lookup behavior.
 */
export function useLanguage() {
  const core = useContext(LanguageContext);
  if (!core) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  const accessibility = useAccessibility();
  const modals = useModals();
  const view = useView();

  // Preserve original openBookingModal behavior: resolve specialty from doctor
  const openBookingModal = useCallback(
    (specialtyId?: string, doctorId?: string) => {
      let resolvedSpecialtyId = specialtyId;
      if (doctorId && !specialtyId) {
        const doc = core.doctors.find((d) => d.id === doctorId);
        if (doc) resolvedSpecialtyId = doc.specialtyId;
      }
      modals.openBookingModal(resolvedSpecialtyId, doctorId);
    },
    [core.doctors, modals],
  );

  return {
    // Core language
    lang: core.lang,
    setLang: core.setLang,
    isRTL: core.isRTL,
    t: core.t,
    doctors: core.doctors,
    specialties: core.specialties,
    // Accessibility
    fontSize: accessibility.fontSize,
    setFontSize: accessibility.setFontSize,
    increaseFontSize: accessibility.increaseFontSize,
    decreaseFontSize: accessibility.decreaseFontSize,
    resetFontSize: accessibility.resetFontSize,
    highContrast: accessibility.highContrast,
    setHighContrast: accessibility.setHighContrast,
    toggleHighContrast: accessibility.toggleHighContrast,
    readingRuler: accessibility.readingRuler,
    toggleReadingRuler: accessibility.toggleReadingRuler,
    // View
    activeView: view.activeView,
    setActiveView: view.setActiveView,
    toggleView: view.toggleView,
    // Modals (with doctor-aware openBookingModal)
    isBookingModalOpen: modals.isBookingModalOpen,
    bookingDoctorId: modals.bookingDoctorId,
    bookingSpecialtyId: modals.bookingSpecialtyId,
    openBookingModal,
    closeBookingModal: modals.closeBookingModal,
    isSpecialtyModalOpen: modals.isSpecialtyModalOpen,
    activeSpecialty: modals.activeSpecialty,
    openSpecialtyModal: modals.openSpecialtyModal,
    closeSpecialtyModal: modals.closeSpecialtyModal,
    isVisionTestModalOpen: modals.isVisionTestModalOpen,
    openVisionTestModal: modals.openVisionTestModal,
    closeVisionTestModal: modals.closeVisionTestModal,
    isQueueModalOpen: modals.isQueueModalOpen,
    openQueueModal: modals.openQueueModal,
    closeQueueModal: modals.closeQueueModal,
    isCostCalculatorModalOpen: modals.isCostCalculatorModalOpen,
    openCostCalculatorModal: modals.openCostCalculatorModal,
    closeCostCalculatorModal: modals.closeCostCalculatorModal,
  };
}
