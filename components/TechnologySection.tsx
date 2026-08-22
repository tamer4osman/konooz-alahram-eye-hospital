'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { TECHNOLOGIES, TechnologyItem } from '@/data/hospitalData';
import { Sparkles, CheckCircle2, Microscope, Cpu } from 'lucide-react';

export default function TechnologySection() {
  const { lang, t, openBookingModal } = useLanguage();
  const [activeTechIndex, setActiveTechIndex] = useState(0);

  const activeTech: TechnologyItem = TECHNOLOGIES[activeTechIndex];

  return (
    <section id="technology" className="py-16 sm:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Ambient background glows */ }
      <div className="absolute inset-0 opacity-15 pointer-events-none">
        <div className="absolute top-1/3 left-10 w-96 h-96 bg-teal-500 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-900/80 border border-teal-500/40 text-teal-300 text-xs font-bold">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('أحدث التجهيزات الطبية والتشخيصية', 'Cutting-Edge Ophthalmic Tech') }</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {t(
              'تكنولوجيا عالمية متطورة تضمن أعلى نسب الأمان والنجاح', 'World-Class Surgical Platforms & Diagnostic Systems'
            )}
          </h2>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            {t(
              'حرصنا على تجهيز مستشفى كنوز الأهرام بأحدث منظومات الفيمتو ليزك، الفاكو البارد، وتصوير الشبكية المقطعي ثلاثي الأبعاد وغرف العمليات الكبسولية.', 'Equipped with industry-leading Femto-laser, cold micro-phaco platforms, ultra-widefield OCT imaging, and positive-pressure cleanrooms.'
            ) }
          </p>
        </div>

        {/* Technology Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mb-10">
          {TECHNOLOGIES.map((tech, idx) => {
            const isActive = idx === activeTechIndex;
            return (
              <button
                key={tech.id}
                onClick={() => setActiveTechIndex(idx) }
                className={`p-3 sm:p-4 rounded-xl border text-start transition-all flex flex-col justify-between gap-2 ${
                  isActive
                    ? 'bg-gradient-to-br from-[#163660] to-teal-900/90 border-teal-400 text-white shadow-lg ring-1 ring-teal-400/50'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-amber-400 uppercase">
                    0{idx + 1 }
                  </span>
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isActive ? 'bg-teal-400 shadow-[0_0_8px_#2dd4bf]' : 'bg-slate-600'
                    }`}
                  />
                </div>
                <h4 className="text-xs sm:text-sm font-bold line-clamp-2 leading-snug">
                  {lang === 'ar' ? tech.titleAr : tech.titleEn}
                </h4>
                <span className="text-[10px] text-slate-400">
                  {lang === 'ar' ? tech.categoryAr : tech.categoryEn}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Technology Showcase Card */}
        <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-6 sm:p-10 shadow-2xl backdrop-blur-md">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-extrabold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full mb-3 inline-block">
                  {lang === 'ar' ? activeTech.categoryAr : activeTech.categoryEn}
                </span>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
                  {lang === 'ar' ? activeTech.titleAr : activeTech.titleEn}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                {lang === 'ar' ? activeTech.descAr : activeTech.descEn}
              </p>

              {/* Key Features */}
              <div className="space-y-2.5 pt-2">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  {t('المواصفات ومميزات الأمان للمريض:', 'Key Patient Safety Features:')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(lang === 'ar' ? activeTech.featuresAr : activeTech.featuresEn).map((f, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 text-xs text-slate-200"
                    >
                      <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accuracy metric banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-teal-950/70 border border-teal-500/30">
                <div>
                  <span className="text-[11px] text-slate-400 block">{t('معيار الدقة والأمان', 'Precision Standard')}</span>
                  <span className="text-sm sm:text-base font-extrabold text-teal-300">{activeTech.precision}</span>
                </div>
                <button
                  onClick={() => openBookingModal()}
                  className="px-4 py-2 bg-teal-400 hover:bg-teal-300 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {t('طلب فحص بهذه التقنية', 'Request Diagnostic')}
                </button>
              </div>
            </div>

            {/* Right Graphic / Image Showcase Box */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center">
              <div className="w-full aspect-4/3 rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700/80 relative overflow-hidden group shadow-2xl">
                
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
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Microscope className="w-16 h-16 text-teal-400" />
                  </div>
                )}

                {/* Floating Meta Details */}
                <div className="absolute bottom-4 inset-x-4 space-y-1.5 z-10">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0C2340]/90 border border-teal-400/50 backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-extrabold text-teal-200">
                      {t('نظام جراحي وتشخيصي معتمد', 'Certified High-Precision Platform')}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-white drop-shadow-md">
                    {lang === 'ar' ? activeTech.titleAr : activeTech.titleEn}
                  </h4>
                  <p className="text-[11px] text-teal-300 font-medium">
                    {t('متاح في مستشفى كنوز الأهرام - بنغازي', 'Available at Konooz Al-Ahram - Benghazi')}
                  </p>
                </div>

                {/* Laser scanline overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-400/10 to-transparent h-12 w-full pointer-events-none" />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
