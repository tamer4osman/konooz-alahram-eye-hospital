'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';
import { Phone, ArrowUp, MessageCircle, Calendar, X, User } from 'lucide-react';

export default function FloatingWidgets() {
  const { lang, t, openBookingModal } = useLanguage();
  const { openPatientPortal } = usePatientAuth();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [callMenuOpen, setCallMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed z-40 bottom-4 inset-x-3 flex flex-col items-center pointer-events-none lg:inset-x-auto lg:bottom-6 lg:start-6 lg:items-stretch lg:gap-0">
      
      {/* Emergency Call Quick Menu */}
      {callMenuOpen && (
        <div className="pointer-events-auto bg-white rounded-xl shadow-2xl ring-1 ring-pine-900/10 p-4 w-72 max-w-full space-y-3 animate-fadeIn mb-2">
          <div className="flex items-center justify-between border-b border-pine-900/10 pb-2">
            <h4 className="text-xs font-extrabold text-pine-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-pine-700" />
              <span>{t('اتصال سريع بالمستشفى (بنغازي)', 'Direct Hospital Lines')}</span>
            </h4>
            <button
              onClick={() => setCallMenuOpen(false)}
              className="p-1 text-ink-400 hover:text-ink-700 rounded"
              aria-label="Close call menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-1.5">
            {HOSPITAL_CONTACTS.phoneNumbers.slice(0, 3).map((p, idx) => (
              <a
                key={idx}
                href={`tel:${p.number}`}
                className="p-2 bg-bone-50 hover:bg-pine-50 ring-1 ring-pine-900/10 rounded-lg flex items-center justify-between text-xs transition-colors"
              >
                <span className="font-semibold text-ink-700">{lang === 'ar' ? p.labelAr : p.labelEn}</span>
                <span className="tnum font-bold text-pine-800" dir="ltr">{p.display}</span>
              </a>
            ))}
          </div>

          <button
            onClick={() => {
              setCallMenuOpen(false);
              openBookingModal();
            }}
            className="w-full py-2 bg-pine-900 hover:bg-pine-700 text-bone-50 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-brass-300" />
            <span>{t('حجز فوري ومباشر', 'Instant Direct Booking')}</span>
          </button>
        </div>
      )}

      {/* Floating Action Buttons Group */}
      <div className="flex items-center gap-2 pointer-events-auto rounded-full bg-white/90 backdrop-blur-md ring-1 ring-pine-900/15 shadow-xl px-2 py-1.5 lg:bg-transparent lg:p-0 lg:ring-0 lg:shadow-none lg:flex-col-reverse lg:gap-2.5">
        
        {/* Back to Top */}
        {showBackToTop && (
          <button
            id="btn-back-to-top"
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-bone-100 hover:bg-bone-200 text-ink-700 flex items-center justify-center transition-colors shrink-0 lg:w-11 lg:h-11 lg:bg-white/95 lg:hover:bg-bone-200 lg:shadow-lg lg:ring-1 lg:ring-pine-900/15 lg:hover:-translate-y-1"
            title={t('العودة لأعلى الصفحة', 'Back to top')}
            aria-label="Back to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* Patient Portal Floating Icon */}
        <button
          id="btn-floating-patient-portal"
          onClick={() => openPatientPortal('profile')}
          className="w-10 h-10 rounded-full bg-pine-800 hover:bg-pine-700 text-bone-50 shadow-md ring-1 ring-brass-400/60 shrink-0 lg:w-12 lg:h-12 lg:ring-2 lg:shadow-xl flex items-center justify-center transition-all transform hover:scale-105 relative cursor-pointer"
          title={t('بوابة المريض والملف الطبي وتنبيهات الواتساب', 'Patient Medical Profile & WhatsApp Alerts')}
          aria-label="Patient Portal"
        >
          <User className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 w-3.5 h-3.5 rounded-full bg-brass-400 ring-2 ring-white" aria-hidden="true" />
        </button>

        {/* Quick Call Speed-Dial Toggle */}
        <button
          id="btn-floating-call"
          onClick={() => setCallMenuOpen(!callMenuOpen)}
          className="w-10 h-10 rounded-full bg-pine-900 text-bone-50 hover:bg-pine-700 shadow-sm shrink-0 lg:w-12 lg:h-12 lg:ring-2 lg:ring-brass-400 lg:shadow-xl flex items-center justify-center transition-all transform hover:scale-105 cursor-pointer"
          title={t('أرقام الاتصال بالطوارئ والاستقبال', 'Emergency & Reception Lines')}
          aria-label="Call Hospital"
        >
          <Phone className="w-5 h-5 text-brass-300" />
        </button>

        {/* WhatsApp Direct Pulsing Floating Button */}
        <a
          id="btn-floating-whatsapp"
          href={`https://wa.me/${HOSPITAL_CONTACTS.primaryWhatsApp.replace('+', '')}?text=${encodeURIComponent(
            lang === 'ar'
              ? 'السلام عليكم، أرغب في الاستفسار وحجز موعد في مستشفى كنوز الأهرام لطب وجراحة العيون.'
              : 'Hello, I would like to inquire about treatments and appointments at Konooz Al-Ahram Eye Hospital.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative w-12 h-12 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-lg flex items-center justify-center transition-all shrink-0 lg:w-14 lg:h-14"
          title={t(`تواصل فوري عبر الواتساب: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`, `Direct WhatsApp Chat`)}
          aria-label="Chat on WhatsApp"
        >
          {/* Pulsing Ripple Rings */}
          <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" aria-hidden="true" />
          <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 w-4 h-4 rounded-full bg-brass-400 ring-2 ring-white" aria-hidden="true" />
          
          <MessageCircle className="relative z-10 w-6 h-6 lg:w-7 lg:h-7" />
        </a>

      </div>
    </div>
  );
}
