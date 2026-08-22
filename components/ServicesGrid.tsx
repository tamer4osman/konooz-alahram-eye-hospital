'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { SPECIALTIES, Specialty, HOSPITAL_CONTACTS } from '@/data/hospitalData';
import {
  Sparkles,
  Eye,
  Activity,
  Scan,
  Smile,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Zap,
  Info,
  Calendar
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-6 h-6 text-teal-500" />,
  Eye: <Eye className="w-6 h-6 text-teal-500" />,
  Activity: <Activity className="w-6 h-6 text-teal-500" />,
  Scan: <Scan className="w-6 h-6 text-teal-500" />,
  Smile: <Smile className="w-6 h-6 text-teal-500" />,
  ShieldAlert: <ShieldAlert className="w-6 h-6 text-teal-500" />,
};

export default function ServicesGrid() {
  const { lang, t, isRTL, openSpecialtyModal, openBookingModal } = useLanguage();

  return (
    <section id="specialties" className="py-16 sm:py-24 bg-slate-50 relative">
      {/* Background Decor */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-teal-600" />
            <span>{t('الأقسام الطبية والجراحية الدقيقة', 'Advanced Clinical Departments')}</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0C2340]">
            {t(
              'أحدث جراحات وعلاجات العيون في بنغازي',
              'Advanced Ophthalmic Surgical Specialties'
            )}
          </h2>
          
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t(
              'نقدم باقة متكاملة من الجراحات التخصصية الدقيقة باستخدام أحدث تكنولوجيا الليزر والموجات فوق الصوتية والتعقيم الجراحي العالمي.',
              'Delivering comprehensive surgical and diagnostic eye care powered by cutting-edge laser platforms and international sterilization protocols.'
            )}
          </p>
        </div>

        {/* 6 Interactive Specialty Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {SPECIALTIES.map((spec: Specialty) => {
            return (
              <div
                key={spec.id}
                id={`card-specialty-${spec.id}`}
                className="group relative bg-white rounded-2xl border border-slate-200/80 hover:border-teal-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
              >
                {/* Specialty Image Header */}
                {spec.image && (
                  <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
                    <Image
                      src={spec.image}
                      alt={lang === 'ar' ? spec.titleAr : spec.titleEn}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    
                    {/* Badge on Image */}
                    <div className="absolute top-3 end-3 z-10">
                      <span className="text-[11px] font-bold text-amber-900 bg-amber-400/90 border border-amber-300 px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                        {lang === 'ar' ? spec.badgeAr : spec.badgeEn}
                      </span>
                    </div>

                    {/* Icon Badge on Image */}
                    <div className="absolute bottom-3 start-3 z-10 w-10 h-10 rounded-xl bg-[#0C2340]/90 border border-teal-400/40 flex items-center justify-center text-teal-300 backdrop-blur-md">
                      {iconMap[spec.iconName] || <Eye className="w-5 h-5 text-teal-400" />}
                    </div>
                  </div>
                )}

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  {/* Title & Description */}
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0C2340] group-hover:text-teal-700 transition-colors leading-snug mb-2">
                      {lang === 'ar' ? spec.titleAr : spec.titleEn}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                      {lang === 'ar' ? spec.shortDescAr : spec.shortDescEn}
                    </p>
                  </div>

                  {/* Bullet Highlights */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {t('أبرز الإجراءات:', 'Key Procedures:')}
                    </span>
                    <ul className="space-y-1.5">
                      {(lang === 'ar' ? spec.proceduresAr : spec.proceduresEn)
                        .slice(0, 3)
                        .map((proc, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-xs text-slate-700 font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                            <span className="leading-snug">{proc}</span>
                          </li>
                        ))}
                    </ul>
                  </div>

                  {/* Duration & Recovery Footnote */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-teal-600" />
                      <span>{lang === 'ar' ? spec.durationAr : spec.durationEn}</span>
                    </span>
                    <span className="font-semibold text-teal-800">
                      {lang === 'ar' ? spec.recoveryAr : spec.recoveryEn}
                    </span>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    id={`btn-details-${spec.id}`}
                    onClick={() => openSpecialtyModal(spec)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 group/btn transition-colors"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>{t('تفاصيل الخدمة', 'Full Details')}</span>
                    {isRTL ? (
                      <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover/btn:-translate-x-1" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                    )}
                  </button>

                  <button
                    id={`btn-book-spec-${spec.id}`}
                    onClick={() => openBookingModal(spec.id)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0C2340] hover:bg-teal-700 transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <Calendar className="w-3 h-3 text-teal-300" />
                    <span>{t('حجز كشف', 'Book')}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Bottom Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0C2340] via-[#163660] to-teal-950 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border border-teal-500/20">
          <div className="space-y-1 text-center md:text-start">
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {t('هل تحتاج إلى فحص متخصص أو استشارة لحالة معقدة؟', 'Need a specialized evaluation for a complex case?')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              {t(
                'استشاريونا الزائرون من قصر العيني وعين شمس جاهزون لمناظرة حالتك بأحدث التقنيات التشخيصية.',
                'Our visiting professors from Cairo and Ain Shams are available for high-level consultations in Benghazi.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openBookingModal()}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-teal-400 hover:bg-teal-300 text-slate-950 transition-all shadow-md"
            >
              {t('حجز استشارة استشاري', 'Book Consultant Visit')}
            </button>
            <a
              href={`tel:${HOSPITAL_CONTACTS.primaryWhatsApp}`}
              className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border border-slate-500 hover:border-white text-white transition-all flex items-center gap-1.5"
            >
              <span>{t(`استفسار مباشر: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`, `Direct Call: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`)}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}
