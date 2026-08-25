'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Specialty } from '@/data/hospitalData';
import type { Doctor } from '@/data/hospitalData';

type Language = 'ar' | 'en';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  isRTL: boolean;
  t: (ar: string, en: string) => string;
  doctors: Doctor[];
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
  
  // Active Main View (Public Hospital Portal vs Admin Control Dashboard)
  activeView: 'portal' | 'dashboard';
  setActiveView: (view: 'portal' | 'dashboard') => void;
  toggleView: () => void;

  // Booking modal state
  isBookingModalOpen: boolean;
  bookingDoctorId: string | null;
  bookingSpecialtyId: string | null;
  openBookingModal: (specialtyId?: string, doctorId?: string) => void;
  closeBookingModal: () => void;

  // Specialty details modal state
  isSpecialtyModalOpen: boolean;
  activeSpecialty: Specialty | null;
  openSpecialtyModal: (specialty: Specialty) => void;
  closeSpecialtyModal: () => void;

  // Vision Test Modal
  isVisionTestModalOpen: boolean;
  openVisionTestModal: () => void;
  closeVisionTestModal: () => void;

  // Live Patient Queue Tracker Modal
  isQueueModalOpen: boolean;
  openQueueModal: () => void;
  closeQueueModal: () => void;

  // Surgical Cost & Insurance Calculator Modal
  isCostCalculatorModalOpen: boolean;
  openCostCalculatorModal: () => void;
  closeCostCalculatorModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCALE_COOKIE = 'konooz_lang';

export function LanguageProvider({
  children,
  initialLocale = 'ar',
  initialDoctors = [],
}: {
  children: React.ReactNode;
  initialLocale?: Language;
  initialDoctors?: Doctor[];
}) {
  const router = useRouter();
  // The URL segment is the single source of truth for language. The server
  // renders <html lang dir> from it; switching locales navigates to the
  // sibling path and this provider remounts (keyed by locale upstream).
  const [lang] = useState<Language>(initialLocale);
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [readingRuler, setReadingRuler] = useState<boolean>(false);
  const [rulerY, setRulerY] = useState<number>(200);

  // App Main View: 'portal' (Public Patient Portal) or 'dashboard' (Hospital Control & Resource Management)
  const [activeView, setActiveView] = useState<'portal' | 'dashboard'>('portal');
  const toggleView = () => setActiveView((prev) => (prev === 'portal' ? 'dashboard' : 'portal'));

  // Modal States
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);
  const [bookingSpecialtyId, setBookingSpecialtyId] = useState<string | null>(null);

  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState<Specialty | null>(null);

  const [isVisionTestModalOpen, setIsVisionTestModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isCostCalculatorModalOpen, setIsCostCalculatorModalOpen] = useState(false);

  // Doctors come from the server component tree (ISR-revalidated homepage) —
  // no client-side fetch waterfall for content that rarely changes.
  const [doctors] = useState<Doctor[]>(initialDoctors ?? []);

  const isRTL = lang === 'ar';

  const setLang = (newLang: Language) => {
    if (newLang === lang) return;
    try {
      document.cookie = `${LOCALE_COOKIE}=${newLang}; path=/; max-age=31536000; samesite=lax`;
    } catch {
      // cookie blocked - navigation still switches the visible locale
    }
    router.push(`/${newLang}`);
  };

  const t = (ar: string, en: string) => (lang === 'ar' ? ar : en);

  const increaseFontSize = () => {
    setFontSize((prev) => {
      if (prev === 'sm') return 'base';
      if (prev === 'base') return 'lg';
      if (prev === 'lg') return 'xl';
      return 'xl';
    });
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => {
      if (prev === 'xl') return 'lg';
      if (prev === 'lg') return 'base';
      if (prev === 'base') return 'sm';
      return 'sm';
    });
  };

  const resetFontSize = () => setFontSize('base');
  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const toggleReadingRuler = () => setReadingRuler((prev) => !prev);

  // Open booking modal helper
  const openBookingModal = (specialtyId?: string, doctorId?: string) => {
    if (specialtyId) setBookingSpecialtyId(specialtyId);
    if (doctorId) {
      setBookingDoctorId(doctorId);
      const doc = doctors.find((d) => d.id === doctorId);
      if (doc && !specialtyId) {
        setBookingSpecialtyId(doc.specialtyId);
      }
    }
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingDoctorId(null);
    setBookingSpecialtyId(null);
  };

  // Specialty modal helper
  const openSpecialtyModal = (specialty: Specialty) => {
    setActiveSpecialty(specialty);
    setIsSpecialtyModalOpen(true);
  };

  const closeSpecialtyModal = () => {
    setIsSpecialtyModalOpen(false);
    setActiveSpecialty(null);
  };

  const openVisionTestModal = () => setIsVisionTestModalOpen(true);
  const closeVisionTestModal = () => setIsVisionTestModalOpen(false);

  const openQueueModal = () => setIsQueueModalOpen(true);
  const closeQueueModal = () => setIsQueueModalOpen(false);

  const openCostCalculatorModal = () => setIsCostCalculatorModalOpen(true);
  const closeCostCalculatorModal = () => setIsCostCalculatorModalOpen(false);

  // Mouse move handler for reading ruler
  useEffect(() => {
    if (!readingRuler) return;
    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingRuler]);

  // Progressive-enhancement hook previously set by an inline <head> script:
  // CSS gates reveal/animation styles behind html.js
  useEffect(() => {
    document.documentElement.classList.add('js');
  }, []);

  // Sync document root attributes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  }, [highContrast]);

  const fontSizeClass = {
    sm: 'text-[14px]',
    base: 'text-[16px]',
    lg: 'text-[18px]',
    xl: 'text-[20px]',
  }[fontSize];

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        isRTL,
        t,
        doctors,
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        readingRuler,
        toggleReadingRuler,
        activeView,
        setActiveView,
        toggleView,
        isBookingModalOpen,
        bookingDoctorId,
        bookingSpecialtyId,
        openBookingModal,
        closeBookingModal,
        isSpecialtyModalOpen,
        activeSpecialty,
        openSpecialtyModal,
        closeSpecialtyModal,
        isVisionTestModalOpen,
        openVisionTestModal,
        closeVisionTestModal,
        isQueueModalOpen,
        openQueueModal,
        closeQueueModal,
        isCostCalculatorModalOpen,
        openCostCalculatorModal,
        closeCostCalculatorModal,
      }}
    >
      <div className={`${fontSizeClass} min-h-screen transition-all duration-200`}>
        {readingRuler && (
          <div
            className="reading-guide-line"
            style={{ top: `${rulerY}px` }}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
