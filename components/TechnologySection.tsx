'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Reveal from './Reveal';
import { useLanguage } from '@/context/LanguageContext';
import { TECHNOLOGIES, TechnologyItem } from '@/data/hospitalData';
import { Sparkles, CheckCircle2, Microscope, Cpu } from 'lucide-react';

export default function TechnologySection() {
  const { lang, t, openBookingModal } = useLanguage();
  const [activeTechIndex, setActiveTechIndex] = useState(0);

  const activeTech: TechnologyItem = TECHNOLOGIES[activeTechIndex];

  return (
    <section id="technology" className="py-16 sm:py-24 bg-bone-50 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <Reveal className="max-w-3xl mb-12 sm:mb-16 space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-[2.4rem] lg:leading-tight font-extrabold text-pine-900 tracking-tight text-balance flex items-start gap-3">
            <Cpu className="w-7 h-7 text-pine-600 mt-1.5 flex-shrink-0" />
            <span>
              {t(
                'تكنولوجيا عالمية متطورة تضمن أعلى نسب الأمان والنجاح', 'World-Class Surgical Platforms & Diagnostic Systems'
              )}
            </span>
          </h2>

          <p className="text-sm sm:text-base text-ink-500 leading-relaxed max-w-2xl font-normal">
            {t(
              'حرصنا على تجهيز مستشفى كنوز الأهرام بأحدث منظومات الفيمتو ليزك، الفاكو البارد، وتصوير الشبكية المقطعي ثلاثي الأبعاد وغرف العمليات الكبسولية.', 'Equipped with industry-leading Femto-laser, cold micro-phaco platforms, ultra-widefield OCT imaging, and positive-pressure cleanrooms.'
            ) }
          </p>
        </Reveal>

        {/* Technology Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-10">
          {TECHNOLOGIES.map((tech, idx) => {
            const isActive = idx === activeTechIndex;
            return (
              <button
                key={tech.id}
                onClick={() => setActiveTechIndex(idx) }
                aria-pressed={isActive}
                className={`p-3 sm:p-4 rounded-xl border text-start transition-all flex flex-col justify-between gap-2 cursor-pointer active:scale-[0.99] ${
                  isActive
                    ? 'bg-white border-brass-400 ring-1 ring-brass-400/50 shadow-md shadow-pine-950/10'
                    : 'bg-white/60 border-pine-900/10 text-ink-700 hover:bg-white hover:border-pine-900/25'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[10px] font-bold uppercase tnum ${isActive ? 'text-brass-500' : 'text-ink-300'}`}>
                    0{idx + 1 }
                  </span>
                  <span
                    className={`w-2 h-2 rounded-full ${isActive ? 'bg-brass-400' : 'bg-pine-900/15'}`}
                    aria-hidden="true"
                  />
                </div>
                <h4 className={`text-xs sm:text-sm font-bold line-clamp-2 leading-snug ${isActive ? 'text-pine-900' : ''}`}>
                  {lang === 'ar' ? tech.titleAr : tech.titleEn}
                </h4>
                <span className="text-[10px] text-ink-400">
                  {lang === 'ar' ? tech.categoryAr : tech.categoryEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Technology Showcase — the page's single contained dark moment */}
        <Reveal delay={80}>
          <div className="bg-pine-950 rounded-2xl p-6 sm:p-10 shadow-2xl shadow-pine-950/30 ring-1 ring-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Left Info Column */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <span className="text-xs font-extrabold text-brass-300 bg-pine-900 border border-brass-400/30 px-3 py-1 rounded-md mb-3 inline-block">
                    {lang === 'ar' ? activeTech.categoryAr : activeTech.categoryEn}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-bone-50 leading-snug text-balance">
                    {lang === 'ar' ? activeTech.titleAr : activeTech.titleEn}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-pine-200 leading-relaxed font-normal max-w-2xl">
                  {lang === 'ar' ? activeTech.descAr : activeTech.descEn}
                </p>

                {/* Key Features */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-pine-300 uppercase tracking-wider">
                    {t('المواصفات ومميزات الأمان للمريض:', 'Key Patient Safety Features:')}
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(lang === 'ar' ? activeTech.featuresAr : activeTech.featuresEn).map((f, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 p-2.5 rounded-lg bg-white/5 ring-1 ring-white/10 text-xs text-pine-100"
                      >
                        <CheckCircle2 className="w-4 h-4 text-brass-300 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Accuracy metric banner */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-pine-900 ring-1 ring-white/10">
                  <div>
                    <span className="text-[11px] text-pine-300 block">{t('معيار الدقة والأمان', 'Precision Standard')}</span>
                    <span className="text-sm sm:text-base font-extrabold text-brass-300 tnum">{activeTech.precision}</span>
                  </div>
                  <button
                    onClick={() => openBookingModal()}
                    className="px-4 py-2 bg-bone-50 hover:bg-white text-pine-950 font-bold rounded-lg text-xs transition-colors cursor-pointer active:scale-[0.98]"
                  >
                    {t('طلب فحص بهذه التقنية', 'Request Diagnostic')}
                  </button>
                </div>
              </div>

              {/* Right Graphic / Image Showcase Box */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="w-full aspect-4/3 rounded-xl overflow-hidden ring-1 ring-white/15 relative group shadow-xl">
                  {/* Real Medical Technology Photo */}
                  {activeTech.image ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={activeTech.image}
                        alt={lang === 'ar' ? activeTech.titleAr : activeTech.titleEn}
                        fill
                        sizes="(max-width: 1024px) 100vw, 550px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-pine-950 via-transparent to-transparent" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-pine-900">
                      <Microscope className="w-16 h-16 text-brass-300" />
                    </div>
                  )}

                  {/* Floating Meta Details */}
                  <div className="absolute bottom-4 inset-x-4 space-y-1.5 z-10">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pine-950/90 ring-1 ring-brass-400/40">
                      <Sparkles className="w-3.5 h-3.5 text-brass-300" />
                      <span className="text-[11px] font-extrabold text-brass-200">
                        {t('نظام جراحي وتشخيصي معتمد', 'Certified High-Precision Platform')}
                      </span>
                    </div>
                    <p className="text-[11px] text-pine-200 font-medium">
                      {t('متاح في مستشفى كنوز الأهرام - بنغازي', 'Available at Konooz Al-Ahram - Benghazi')}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
