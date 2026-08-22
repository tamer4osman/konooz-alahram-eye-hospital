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
    <div className="fixed bottom-5 left-5 rtl:left-auto rtl:right-5 z-40 flex flex-col items-end gap-3 pointer-events-none">
      
      {/* Emergency Call Quick Menu */}
      {callMenuOpen && (
        <div className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 w-72 space-y-3 animate-fadeIn mb-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="text-xs font-extrabold text-[#0C2340] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-teal-600" />
              <span>{t('اتصال سريع بالمستشفى (بنغازي)', 'Direct Hospital Lines')}</span>
            </h4>
            <button
              onClick={() => setCallMenuOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded"
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
                className="p-2 bg-slate-50 hover:bg-teal-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs transition-colors"
              >
                <span className="font-semibold text-slate-700">{lang === 'ar' ? p.labelAr : p.labelEn}</span>
                <span className="font-mono font-bold text-teal-800" dir="ltr">{p.display}</span>
              </a>
            ))}
          </div>

          <button
            onClick={() => {
              setCallMenuOpen(false);
              openBookingModal();
            }}
            className="w-full py-2 bg-[#0C2340] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 text-teal-300" />
            <span>{t('حجز فوري ومباشر', 'Instant Direct Booking')}</span>
          </button>
        </div>
      )}

      {/* Floating Action Buttons Group */}
      <div className="flex flex-col gap-2.5 pointer-events-auto items-center">
        
        {/* Back to Top */}
        {showBackToTop && (
          <button
            id="btn-back-to-top"
            onClick={scrollToTop}
            className="w-11 h-11 rounded-full bg-white/95 text-slate-800 hover:bg-slate-100 shadow-lg border border-slate-200 flex items-center justify-center transition-all transform hover:-translate-y-1"
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
          className="w-12 h-12 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-xl border-2 border-teal-300 flex items-center justify-center transition-all transform hover:scale-105 relative cursor-pointer"
          title={t('بوابة المريض والملف الطبي وتنبيهات الواتساب', 'Patient Medical Profile & WhatsApp Alerts')}
          aria-label="Patient Portal"
        >
          <User className="w-5 h-5 text-white" />
          <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white shadow-xs" />
        </button>

        {/* Quick Call Speed-Dial Toggle */}
        <button
          id="btn-floating-call"
          onClick={() => setCallMenuOpen(!callMenuOpen)}
          className="w-12 h-12 rounded-full bg-[#0C2340] text-white hover:bg-teal-900 shadow-xl border-2 border-amber-400 flex items-center justify-center transition-all transform hover:scale-105 cursor-pointer"
          title={t('أرقام الاتصال بالطوارئ والاستقبال', 'Emergency & Reception Lines')}
          aria-label="Call Hospital"
        >
          <Phone className="w-5 h-5 text-amber-300" />
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
          className="group relative w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-2xl flex items-center justify-center transition-all transform hover:scale-110"
          title={t(`تواصل فوري عبر الواتساب: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`, `Direct WhatsApp Chat`)}
          aria-label="Chat on WhatsApp"
        >
          {/* Pulsing Ripple Rings */}
          <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping pointer-events-none" />
          <span className="absolute -top-1 -right-1 rtl:-right-auto rtl:-left-1 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow-xs" />
          
          <MessageCircle className="w-7 h-7 relative z-10" />
        </a>

      </div>
    </div>
  );
}
