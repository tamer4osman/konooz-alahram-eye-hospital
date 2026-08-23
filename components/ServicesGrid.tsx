'use client';

import React from 'react';
import Image from 'next/image';
import Reveal from './Reveal';
import { useLanguage } from '@/context/LanguageContext';
import { SPECIALTIES, Specialty, HOSPITAL_CONTACTS, HOSPITAL_IMAGES } from '@/data/hospitalData';
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
  Info,
  Calendar
} from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-5 h-5 text-brass-300" />,
  Eye: <Eye className="w-5 h-5 text-brass-300" />,
  Activity: <Activity className="w-5 h-5 text-brass-300" />,
  Scan: <Scan className="w-5 h-5 text-brass-300" />,
  Smile: <Smile className="w-5 h-5 text-brass-300" />,
  ShieldAlert: <ShieldAlert className="w-5 h-5 text-brass-300" />,
};

export default function ServicesGrid() {
  const { lang, t, isRTL, openSpecialtyModal, openBookingModal } = useLanguage();

  return (
    <section id="specialties" className="py-16 sm:py-24 bg-bone-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <Reveal className="max-w-3xl mb-12 sm:mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-[2.4rem] lg:leading-tight font-extrabold text-pine-900 tracking-tight text-balance">
            {t(
              'أحدث جراحات وعلاجات العيون في بنغازي',
              'Advanced Ophthalmic Surgical Specialties'
            )}
          </h2>

          <p className="text-sm sm:text-base text-ink-500 leading-relaxed max-w-2xl font-normal">
            {t(
              'نقدم باقة متكاملة من الجراحات التخصصية الدقيقة باستخدام أحدث تكنولوجيا الليزر والموجات فوق الصوتية والتعقيم الجراحي العالمي.',
              'Delivering comprehensive surgical and diagnostic eye care powered by cutting-edge laser platforms and international sterilization protocols.'
            )}
          </p>
        </Reveal>

        {/* Specialty Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {SPECIALTIES.map((spec: Specialty, idx) => {
            return (
              <Reveal key={spec.id} delay={(idx % 3) * 80}>
                <article
                  id={`card-specialty-${spec.id}`}
                  className="group relative bg-white rounded-2xl ring-1 ring-pine-900/10 hover:ring-pine-900/20 hover:shadow-[0_20px_48px_-16px_rgba(8,33,28,0.22)] transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
                >
                  {/* Specialty Image Header */}
                  {spec.image && (
                    <div className="relative h-44 w-full bg-pine-950 overflow-hidden">
                      <Image
                        src={spec.image}
                        alt={lang === 'ar' ? spec.titleAr : spec.titleEn}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
                        className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-pine-950/85 via-transparent to-transparent" />

                      {/* Badge on Image */}
                      <div className="absolute top-3 end-3 z-10">
                        <span className="text-[11px] font-bold text-pine-950 bg-brass-400 px-2.5 py-1 rounded-md shadow-xs">
                          {lang === 'ar' ? spec.badgeAr : spec.badgeEn}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 -mt-8 relative z-10">
                    {/* Title & Description */}
                    <div>
                      <div className="w-10 h-10 rounded-lg bg-pine-900 ring-4 ring-white flex items-center justify-center shadow-sm mb-3">
                        {iconMap[spec.iconName] || <Eye className="w-5 h-5 text-brass-300" />}
                      </div>
                      <h3 className="text-lg font-extrabold text-pine-900 group-hover:text-pine-700 transition-colors leading-snug mb-2 text-balance">
                        {lang === 'ar' ? spec.titleAr : spec.titleEn}
                      </h3>

                      <p className="text-xs sm:text-sm text-ink-500 leading-relaxed font-normal">
                        {lang === 'ar' ? spec.shortDescAr : spec.shortDescEn}
                      </p>
                    </div>

                    {/* Bullet Highlights */}
                    <div className="space-y-2 pt-3 border-t border-pine-900/10">
                      <span className="text-[11px] font-bold text-ink-400 uppercase tracking-wider block">
                        {t('أبرز الإجراءات:', 'Key Procedures:')}
                      </span>
                      <ul className="space-y-1.5">
                        {(lang === 'ar' ? spec.proceduresAr : spec.proceduresEn)
                          .slice(0, 3)
                          .map((proc, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs text-ink-700 font-medium"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-pine-600 flex-shrink-0 mt-0.5" />
                              <span className="leading-snug">{proc}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    {/* Duration & Recovery Footnote */}
                    <div className="flex items-center justify-between text-[11px] text-ink-500 bg-bone-100 p-2.5 rounded-lg border border-pine-900/5 tnum">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-pine-700" />
                        <span>{lang === 'ar' ? spec.durationAr : spec.durationEn}</span>
                      </span>
                      <span className="font-bold text-pine-800">
                        {lang === 'ar' ? spec.recoveryAr : spec.recoveryEn}
                      </span>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="px-6 py-4 bg-white border-t border-pine-900/10 flex items-center justify-between gap-2">
                    <button
                      id={`btn-details-${spec.id}`}
                      onClick={() => openSpecialtyModal(spec)}
                      className="min-h-[32px] px-1 text-xs font-bold text-pine-800 hover:text-pine-600 flex items-center gap-1 group/btn transition-colors cursor-pointer"
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
                      className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-bone-50 bg-pine-900 hover:bg-pine-700 transition-colors flex items-center gap-1 active:scale-[0.98]"
                    >
                      <Calendar className="w-3 h-3 text-brass-300" />
                      <span>{t('حجز كشف', 'Book')}</span>
                    </button>
                  </div>

                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Bottom Banner — solid pine panel over a dimmed clinic photo */}
        <Reveal delay={120}>
          <div className="mt-12 relative p-6 sm:p-8 rounded-2xl bg-pine-900 text-white overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-pine-950/25">
            <Image
              src={HOSPITAL_IMAGES.femtoLaserTech}
              alt=""
              fill
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover opacity-15 pointer-events-none"
              aria-hidden="true"
            />
            <div className="relative space-y-1 text-center md:text-start">
              <h3 className="text-lg sm:text-xl font-bold text-bone-50">
                {t('هل تحتاج إلى فحص متخصص أو استشارة لحالة معقدة؟', 'Need a specialized evaluation for a complex case?')}
              </h3>
              <p className="text-xs sm:text-sm text-pine-200">
                {t(
                  'استشاريونا الزائرون من قصر العيني وعين شمس جاهزون لمناظرة حالتك بأحدث التقنيات التشخيصية.',
                  'Our visiting professors from Cairo and Ain Shams are available for high-level consultations in Benghazi.'
                )}
              </p>
            </div>

            <div className="relative flex flex-wrap items-center gap-3">
              <button
                onClick={() => openBookingModal()}
                className="px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold bg-bone-50 hover:bg-white text-pine-900 transition-all shadow-sm active:scale-[0.98]"
              >
                {t('حجز استشارة استشاري', 'Book Consultant Visit')}
              </button>
              <a
                href={`tel:${HOSPITAL_CONTACTS.primaryWhatsApp}`}
                className="px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border border-white/30 hover:border-white text-white transition-all flex items-center gap-1.5 tnum"
              >
                <span>{t(`استفسار مباشر: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`, `Direct Call: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`)}</span>
              </a>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
