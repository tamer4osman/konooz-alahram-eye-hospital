'use client';

import React, { useState } from 'react';
import Reveal from './Reveal';
import { useLanguage } from '@/context/LanguageContext';
import { Testimonial } from '@/data/hospitalData';
import type { TrustStatDTO } from '@/lib/content/public-content';
import {
  Star,
  Quote,
  ShieldCheck,
  CheckCircle2,
  Building,
  Clock,
  ChevronRight,
  ChevronLeft,
  Sliders,
  Sparkles,
  Eye,
  Search,
  Lightbulb
} from 'lucide-react';

export default function TestimonialsAndStats({
  initialTestimonials = [],
  initialTrustStats = [],
}: {
  initialTestimonials?: Testimonial[];
  initialTrustStats?: TrustStatDTO[];
}) {
  const { lang, t, isRTL } = useLanguage();
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);
  // Managed content arrives from the ISR-revalidated homepage — no client fetch.
  const [testimonials] = useState<Testimonial[]>(initialTestimonials);
  const [trustStats] = useState<TrustStatDTO[]>(initialTrustStats);

  const safeIdx = testimonials.length > 0 ? activeTestimonialIdx % testimonials.length : 0;

  // Before / After Clarity Simulation Slider
  const [clarityPosition, setClarityPosition] = useState(50); // percentage

  const nextTestimonial = () => {
    setActiveTestimonialIdx((prev) => (testimonials.length > 0 ? (prev + 1) % testimonials.length : 0));
  };

  const prevTestimonial = () => {
    setActiveTestimonialIdx((prev) => (testimonials.length > 0 ? (prev - 1 + testimonials.length) % testimonials.length : 0));
  };

  const currentTestimonial: Testimonial | undefined = testimonials[safeIdx];

  return (
    <section id="about" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-20">

        {/* Statistics — hairline-divided metric row */}
        <Reveal>
          <div className="grid grid-cols-2 lg:grid-cols-4 lg:divide-x lg:divide-pine-900/10 divide-pine-900/10 gap-y-10">
            {trustStats.map((stat, idx) => (
              <div
                key={idx}
                className={`px-6 text-center space-y-2 ${idx % 2 === 0 ? 'border-e lg:border-e-0' : ''} ${idx < trustStats.length - 1 ? 'lg:border-e-0' : ''} ${idx % 2 === 0 && idx < trustStats.length - 1 ? '' : ''}`}
              >
                <div className="w-11 h-11 rounded-xl bg-pine-100 text-pine-800 mx-auto flex items-center justify-center">
                  {stat.icon === 'Building' && <Building className="w-5 h-5" />}
                  {stat.icon === 'ShieldCheck' && <ShieldCheck className="w-5 h-5" />}
                  {stat.icon === 'Clock' && <Clock className="w-5 h-5" />}
                  {stat.icon !== 'Building' && stat.icon !== 'ShieldCheck' && stat.icon !== 'Clock' && <CheckCircle2 className="w-5 h-5" />}
                </div>
                <p className="text-3xl sm:text-4xl font-extrabold text-pine-900 tracking-tight tnum">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm font-semibold text-ink-500">
                  {lang === 'ar' ? stat.labelAr : stat.labelEn}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        {/* Visual Clarity Comparison Simulator */}
        <Reveal delay={80}>
          <div className="bg-pine-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl shadow-pine-950/25 ring-1 ring-white/10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

              {/* Left Description */}
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-pine-900 ring-1 ring-white/15 text-brass-200 text-xs font-bold">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>{t('محاكي وضوح الرؤية', 'Vision Clarity Simulator')}</span>
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-[1.7rem] lg:leading-snug font-extrabold leading-snug text-balance text-bone-50">
                  {t('شاهد الفرق: قبل وبعد جراحات تصحيح الإبصار والمياه البيضاء', 'Experience the Difference: Before & After Ophthalmic Treatment')}
                </h3>
                <p className="text-xs sm:text-sm text-pine-200 leading-relaxed">
                  {t(
                    'اسحب المؤشر لترى كيف تعيد تقنيات الفيمتو ليزك والفاكو نقاء الرؤية ودقة التفاصيل 6/6 بدون الحاجة للنظارات.',
                    'Drag the slider to preview how modern Femto-LASIK and Phaco restore vivid color contrast and 20/20 sharpness.'
                  )}
                </p>

                {/* Slider Control - In-place Opacity & Blur Adjustment */}
                <div className="pt-2 space-y-3">
                  <div className="flex justify-between items-center text-xs font-bold" dir="ltr">
                    <span className="text-brass-300 flex items-center gap-1">
                      <Search className="w-3.5 h-3.5" />
                      <span>{t('قبل العملية (ضبابية وتشوش)', 'Before (Blurred)')}</span>
                    </span>
                    <span className="text-pine-200 flex items-center gap-1">
                      <span>{t('بعد العملية (وضوح نقي 6/6)', 'After (HD 20/20)')}</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div dir="ltr" className="relative">
                    <input
                      id="vision-clarity-range-slider"
                      type="range"
                      min="0"
                      max="100"
                      value={clarityPosition}
                      onChange={(e) => setClarityPosition(Number(e.target.value))}
                      className="w-full accent-brass-400 h-2.5 bg-pine-900 rounded-lg cursor-pointer transition-all"
                      aria-label={t('محاكي وضوح الرؤية', 'Vision Clarity Simulator')}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-pine-300" dir="ltr">
                    <span className="text-brass-300/90 font-medium tnum">{t('0% قبل العملية', '0% Before')}</span>
                    <span className="font-bold text-pine-100 bg-pine-900 px-3 py-1 rounded-md ring-1 ring-white/15 tnum">
                      {t('درجة الوضوح:', 'Clarity:')} {clarityPosition}%
                    </span>
                    <span className="text-brass-300 font-medium tnum">{t('100% بعد العملية', '100% After')}</span>
                  </div>

                  {/* Quick Presets */}
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setClarityPosition(0)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                        clarityPosition === 0
                          ? 'bg-brass-400 text-pine-950 shadow-sm'
                          : 'bg-pine-900 text-pine-200 hover:bg-pine-800 ring-1 ring-white/10'
                      }`}
                    >
                      {t('قبل العملية (0%)', 'Before (0%)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setClarityPosition(50)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                        clarityPosition === 50
                          ? 'bg-bone-50 text-pine-950 shadow-sm'
                          : 'bg-pine-900 text-pine-200 hover:bg-pine-800 ring-1 ring-white/10'
                      }`}
                    >
                      {t('مرحلة التحسن (50%)', 'Halfway (50%)')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setClarityPosition(100)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer active:scale-[0.98] ${
                        clarityPosition === 100
                          ? 'bg-pine-500 text-white shadow-sm'
                          : 'bg-pine-900 text-pine-200 hover:bg-pine-800 ring-1 ring-white/10'
                      }`}
                    >
                      {t('بعد العملية 6/6 (100%)', 'After 20/20 (100%)')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Interactive Visual Stage - In-place Layer Transition */}
              <div className="lg:col-span-7">
                <div className="relative aspect-16/10 rounded-2xl overflow-hidden ring-1 ring-white/15 bg-pine-950 flex items-center justify-center select-none shadow-inner">

                  {/* 1. Base Layer: Crisp HD 20/20 Vision */}
                  <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-tr from-pine-950 via-pine-900 to-pine-800">
                    <div className="text-center space-y-3 max-w-sm">
                      <div className="w-16 h-16 rounded-full bg-pine-800 ring-1 ring-brass-400/60 flex items-center justify-center mx-auto">
                        <Eye className="w-8 h-8 text-brass-300" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg sm:text-xl font-extrabold text-bone-50 tracking-wide">
                          {t('مستشفى كنوز الأهرام - بنغازي', 'Konooz Al-Ahram Hospital')}
                        </p>
                        <p className="text-xs text-pine-300 font-bold">
                          {t('طريق طرابلس - بجانب قوس معهد الكهرباء', 'Tripoli Road - Benghazi')}
                        </p>
                      </div>
                      <div className="inline-flex items-center justify-center gap-3 pt-2 text-xs font-black tracking-widest text-brass-300 bg-pine-950/90 px-4 py-1.5 rounded-full ring-1 ring-brass-400/40">
                        <span>E</span>
                        <span>F P</span>
                        <span>T O Z</span>
                        <span>L P E D</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. Top CSS Opacity Layer: Pure Cataract/Blur Simulation Overlay */}
                  <div
                    id="vision-blur-overlay-layer"
                    className="absolute inset-0 bg-pine-950/60 backdrop-blur-md pointer-events-none transition-opacity duration-150 ease-out"
                    style={{
                      opacity: (100 - clarityPosition) / 100,
                    }}
                  />

                  {/* Dynamic Status Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    {clarityPosition >= 80 ? (
                      <span className="bg-pine-950/90 ring-1 ring-pine-400/60 text-pine-200 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-brass-300" />
                        <span>{t('بعد العملية: وضوح تام 6/6', 'After: 20/20 HD Clarity')}</span>
                      </span>
                    ) : clarityPosition <= 20 ? (
                      <span className="bg-pine-950/90 ring-1 ring-white/20 text-pine-200 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                        <Search className="w-3.5 h-3.5 text-brass-300" />
                        <span>{t('قبل العملية: تشوش وضبابية', 'Before: Blurred Vision')}</span>
                      </span>
                    ) : (
                      <span className="bg-pine-950/90 ring-1 ring-brass-400/50 text-brass-200 text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t(`تحسن تدريجي (${clarityPosition}%)`, `Improving (${clarityPosition}%)`)}</span>
                      </span>
                    )}
                  </div>

                  {/* Progress Badge */}
                  <div className="absolute bottom-4 right-4 z-20">
                    <span className="bg-pine-950/85 backdrop-blur-sm ring-1 ring-white/15 text-pine-200 text-[11px] font-bold px-2.5 py-1 rounded-lg tnum">
                      {t('محاكي النظر', 'Vision Simulator')}: {clarityPosition}%
                    </span>
                  </div>

                </div>

                <p className="text-[11px] text-pine-300 text-center mt-2.5 flex items-center justify-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-brass-300 flex-shrink-0" aria-hidden="true" />
                  <span>{t('اسحب شريط التمرير لأعلى لرؤية زوال الضبابية والوصول لحدة إبصار 6/6 فائقة الوضوح', 'Drag the slider to watch the blur layer fade away into crystal-clear 20/20 vision')}</span>
                </p>
              </div>

            </div>
          </div>
        </Reveal>

        {/* Patient Testimonials */}
        <Reveal delay={60}>
          <div className="space-y-8">
            <div className="max-w-2xl mx-auto space-y-2 text-center">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-pine-900 tracking-tight text-balance">
                {t('قصص نجاح واستعادة الإبصار', 'Real Patient Testimonials')}
              </h3>
              <p className="text-xs sm:text-sm text-ink-500 font-semibold flex items-center justify-center gap-1.5">
                <Star className="w-4 h-4 text-brass-400 fill-brass-400" />
                <span>{t('آراء وتجارب المرضى في بنغازي', 'Patient Stories & Reviews')}</span>
              </p>
            </div>

            {/* Testimonial Card Slider */}
            <div className="relative max-w-4xl mx-auto bg-bone-50 rounded-2xl ring-1 ring-pine-900/10 p-6 sm:p-10">
              <Quote className="w-12 h-12 text-pine-200 absolute top-6 right-6 rtl:right-auto rtl:left-6 -scale-x-100" aria-hidden="true" />

              {currentTestimonial && (
              <div className="space-y-4 relative z-10">
                {/* Rating Stars */}
                <div className="flex items-center gap-1" aria-label={`${currentTestimonial.rating}/5`}>
                  {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-brass-400 fill-brass-400" />
                  ))}
                </div>

                {/* Comment */}
                <blockquote className="text-base sm:text-lg text-ink-700 leading-relaxed font-medium max-w-[65ch]">
                  &ldquo;{lang === 'ar' ? currentTestimonial.commentAr : currentTestimonial.commentEn}&rdquo;
                </blockquote>

                {/* Patient and Surgery Meta */}
                <div className="pt-4 border-t border-pine-900/10 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-extrabold text-pine-900">
                      {lang === 'ar' ? currentTestimonial.patientNameAr : currentTestimonial.patientNameEn}
                    </h4>
                    <p className="text-xs text-ink-400">
                      {lang === 'ar' ? currentTestimonial.cityAr : currentTestimonial.cityEn}
                    </p>
                  </div>

                  <div className="text-start sm:text-end">
                    <span className="text-xs font-bold text-pine-800 bg-pine-100 px-2.5 py-1 rounded-md block sm:inline-block w-fit">
                      {lang === 'ar' ? currentTestimonial.procedureAr : currentTestimonial.procedureEn}
                    </span>
                    <p className="text-[11px] text-ink-400 mt-0.5 tnum">
                      {t('الطبيب المعالج:', 'Doctor:')} {lang === 'ar' ? currentTestimonial.doctorAr : currentTestimonial.doctorEn} • {lang === 'ar' ? currentTestimonial.dateAr : currentTestimonial.dateEn}
                    </p>
                  </div>
                </div>
              </div>
              )}

              {/* Slider Navigation Buttons */}
              <div className="flex items-center justify-center gap-3 pt-6">
                <button
                  onClick={prevTestimonial}
                  className="p-2 rounded-lg bg-white border border-pine-900/15 hover:bg-pine-100 text-ink-700 transition-colors active:scale-[0.96]"
                  aria-label="Previous Testimonial"
                >
                  {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>

                <div className="flex items-center gap-1.5">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonialIdx(i)}
                      className="w-6 h-6 flex items-center justify-center cursor-pointer"
                      aria-label={`Go to slide ${i + 1}`}
                    >
                      <span
                        className={`rounded-full transition-all ${
                          i === activeTestimonialIdx ? 'w-6 h-2 bg-pine-700' : 'w-2 h-2 bg-pine-900/15 hover:bg-pine-900/30'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="p-2 rounded-lg bg-white border border-pine-900/15 hover:bg-pine-100 text-ink-700 transition-colors active:scale-[0.96]"
                  aria-label="Next Testimonial"
                >
                  {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  );
}
