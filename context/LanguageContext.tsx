'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
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

const LANG_STORAGE_KEY = 'konooz_lang';

const normalizeLang = (value: string | null | undefined): Language | null =>
  value === 'ar' || value === 'en' ? value : null;

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');
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

  // Doctors are served from the database (single source of truth) via /api/public/doctors.
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/doctors')
      .then((res) => res.json())
      .then((json: { data?: Doctor[] }) => {
        if (!cancelled && Array.isArray(json?.data)) setDoctors(json.data);
      })
      .catch(() => {
        // offline/dev-db down — sections render empty rather than stale copies
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isRTL = lang === 'ar';

  const applyLangToDocument = (newLang: Language) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    }
  };

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    applyLangToDocument(newLang);
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, newLang);
    } catch {
      // storage unavailable — language still applies for this session
    }
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

  // Resolve language once on mount: ?lang= param > stored preference > default 'ar'.
  // Server always renders 'ar', so this runs post-hydration to avoid mismatch.
  useEffect(() => {
    try {
      const paramLang = normalizeLang(new URLSearchParams(window.location.search).get('lang'));
      const storedLang = normalizeLang(window.localStorage.getItem(LANG_STORAGE_KEY));
      const resolved = paramLang ?? storedLang;
      if (!resolved || resolved === lang) return;
      applyLangToDocument(resolved);
      setLangState(resolved);
      if (paramLang) {
        window.localStorage.setItem(LANG_STORAGE_KEY, paramLang);
      }
    } catch {
      // storage/URL parsing unavailable — keep server-rendered language
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
