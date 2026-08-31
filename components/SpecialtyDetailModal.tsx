'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import Modal from '@/components/ui/Modal';
import { X, CheckCircle2, Clock, Calendar, ShieldCheck, Zap, Users, Activity } from 'lucide-react';

export default function SpecialtyDetailModal() {
  const {
    lang,
    t,
    isSpecialtyModalOpen,
    activeSpecialty,
    closeSpecialtyModal,
    openBookingModal,
  } = useLanguage();

  if (!isSpecialtyModalOpen || !activeSpecialty) return null;

  return (
    <Modal
      isOpen={isSpecialtyModalOpen}
      onClose={closeSpecialtyModal}
      labelledById="specialty-detail-title"
      panelClassName="w-full max-w-3xl overflow-hidden my-8"
    >
        {/* Modal Header with Image */}
        <div className="relative bg-ink-900 text-white overflow-hidden">
          {activeSpecialty.image && (
            <div className="absolute inset-0 w-full h-full opacity-35">
              <Image
                src={activeSpecialty.image}
                alt={lang === 'ar' ? activeSpecialty.titleAr : activeSpecialty.titleEn}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-pine-950" />

          <div className="relative p-6 sm:p-7">
            <button
              onClick={closeSpecialtyModal}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="pe-10">
              <span className="inline-block text-xs font-bold text-brass-300 bg-pine-900/80 border border-pine-500/40 px-2.5 py-1 rounded-full mb-2 backdrop-blur-xs">
                {lang === 'ar' ? activeSpecialty.badgeAr : activeSpecialty.badgeEn}
              </span>
              <h2 id="specialty-detail-title" className="text-xl sm:text-2xl font-extrabold text-white">
                {lang === 'ar' ? activeSpecialty.titleAr : activeSpecialty.titleEn}
              </h2>
              <p className="text-xs sm:text-sm text-pine-200 mt-1 font-normal">
                {lang === 'ar' ? activeSpecialty.shortDescAr : activeSpecialty.shortDescEn}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Detailed Overview */}
          <div>
            <h3 className="text-sm font-extrabold text-pine-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-pine-700" />
              <span>{t('نظرة عامة على التخصص الطبي', 'Clinical Overview')}</span>
            </h3>
            <p className="text-xs sm:text-sm text-ink-700 leading-relaxed bg-bone-50 p-4 rounded-xl border border-bone-100 font-normal">
              {lang === 'ar' ? activeSpecialty.fullDescAr : activeSpecialty.fullDescEn}
            </p>
          </div>

          {/* Key Procedures List */}
          <div>
            <h3 className="text-sm font-extrabold text-pine-950 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-pine-700" />
              <span>{t('قائمة العمليات والإجراءات المتاحة', 'Available Surgeries & Procedures')}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(lang === 'ar' ? activeSpecialty.proceduresAr : activeSpecialty.proceduresEn).map(
                (proc, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 bg-pine-50/50 border border-pine-100 rounded-xl text-xs font-semibold text-ink-700"
                  >
                    <CheckCircle2 className="w-4 h-4 text-pine-700 flex-shrink-0" />
                    <span>{proc}</span>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Suitable Candidates */}
          <div>
            <h3 className="text-sm font-extrabold text-pine-950 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brass-600" />
              <span>{t('لمن يناسب هذا العلاج؟', 'Who Is This Suitable For?')}</span>
            </h3>
            <ul className="space-y-2">
              {(lang === 'ar' ? activeSpecialty.suitableForAr : activeSpecialty.suitableForEn).map(
                (item, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-ink-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-brass-500 mt-1.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Duration, Recovery & Tech Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 bg-bone-50 rounded-xl border border-bone-100">
              <span className="text-[11px] font-bold text-ink-400 block mb-1">
                {t('مدة العملية الجراحية', 'Procedure Duration')}
              </span>
              <span className="text-xs font-extrabold text-pine-950 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-pine-700" />
                {lang === 'ar' ? activeSpecialty.durationAr : activeSpecialty.durationEn}
              </span>
            </div>

            <div className="p-3.5 bg-bone-50 rounded-xl border border-bone-100">
              <span className="text-[11px] font-bold text-ink-400 block mb-1">
                {t('فترة النقاهة والتعافي', 'Recovery Timeline')}
              </span>
              <span className="text-xs font-extrabold text-pine-800 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-pine-700" />
                {lang === 'ar' ? activeSpecialty.recoveryAr : activeSpecialty.recoveryEn}
              </span>
            </div>

            <div className="p-3.5 bg-bone-50 rounded-xl border border-bone-100">
              <span className="text-[11px] font-bold text-ink-400 block mb-1">
                {t('الأجهزة والتقنيات', 'Technology Grade')}
              </span>
              <span className="text-xs font-bold text-ink-700 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-brass-500" />
                {(lang === 'ar' ? activeSpecialty.technologiesAr : activeSpecialty.technologiesEn)[0]}
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="bg-bone-50 px-6 py-4 border-t border-pine-200 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={closeSpecialtyModal}
            className="px-4 py-2 text-xs font-bold text-ink-500 hover:text-ink-900 transition-colors"
          >
            {t('إغلاق النافذة', 'Close Window')}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                const specId = activeSpecialty.id;
                closeSpecialtyModal();
                openBookingModal(specId);
              }}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#0B3D33] hover:bg-pine-800 transition-all flex items-center gap-2 shadow-md cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-brass-300" />
              <span>{t('احجز موعد كشف في هذا التخصص', 'Book for This Specialty')}</span>
            </button>
          </div>
        </div>
    </Modal>
  );
}
