'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { TESTIMONIALS, TRUST_STATS, Testimonial } from '@/data/hospitalData';
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
  Eye
} from 'lucide-react';

export default function TestimonialsAndStats() {
  const { lang, t, isRTL } = useLanguage();
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  // Before / After Clarity Simulation Slider
  const [clarityPosition, setClarityPosition] = useState(50); // percentage

  const nextTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonialIdx((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const currentTestimonial: Testimonial = TESTIMONIALS[activeTestimonialIdx];

  return (
    <section id="about" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Statistics Metric Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {TRUST_STATS.map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-teal-500/40 transition-all text-center space-y-2 group shadow-2xs hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                {idx === 0 && <CheckCircle2 className="w-6 h-6" />}
                {idx === 1 && <Building className="w-6 h-6" />}
                {idx === 2 && <ShieldCheck className="w-6 h-6" />}
                {idx === 3 && <Clock className="w-6 h-6" />}
              </div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0C2340] tracking-tight">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm font-semibold text-slate-600">
                {lang === 'ar' ? stat.labelAr : stat.labelEn}
              </p>
            </div>
          ))}
        </div>

        {/* Visual Clarity Comparison Simulator */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Description */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-900/80 border border-teal-500/40 text-teal-300 text-xs font-bold">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('محاكي وضوح الرؤية', 'Vision Clarity Simulator')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black leading-snug">
                {t('شاهد الفرق: قبل وبعد جراحات تصحيح الإبصار والمياه البيضاء', 'Experience the Difference: Before & After Ophthalmic Treatment')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t(
                  'اسحب المؤشر لترى كيف تعيد تقنيات الفيمتو ليزك والفاكو نقاء الرؤية ودقة التفاصيل 6/6 بدون الحاجة للنظارات.',
                  'Drag the slider to preview how modern Femto-LASIK and Phaco restore vivid color contrast and 20/20 sharpness.'
                )}
              </p>

              {/* Slider Control - In-place Opacity & Blur Adjustment */}
              <div className="pt-2 space-y-3">
                <div className="flex justify-between items-center text-xs font-bold" dir="ltr">
                  <span className="text-amber-400 flex items-center gap-1">
                    <span>🔍</span>
                    <span>{t('قبل العملية (ضبابية وتشوش)', 'Before (Blurred)')}</span>
                  </span>
                  <span className="text-teal-400 flex items-center gap-1">
                    <span>{t('بعد العملية (وضوح نقي 6/6)', 'After (HD 20/20)')}</span>
                    <span>✨</span>
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
                    className="w-full accent-teal-400 h-2.5 bg-slate-700 rounded-lg cursor-pointer transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400" dir="ltr">
                  <span className="text-amber-400/90 font-medium">{t('0% قبل العملية', '0% Before')}</span>
                  <span className="font-mono text-teal-300 font-bold bg-slate-800 px-3 py-1 rounded-full border border-teal-500/30 shadow-xs">
                    {t('درجة الوضوح:', 'Clarity:')} {clarityPosition}%
                  </span>
                  <span className="text-teal-300 font-medium">{t('100% بعد العملية', '100% After')}</span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setClarityPosition(0)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      clarityPosition === 0
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t('قبل العملية (0%)', 'Before (0%)')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setClarityPosition(50)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      clarityPosition === 50
                        ? 'bg-teal-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t('مرحلة التحسن (50%)', 'Halfway (50%)')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setClarityPosition(100)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      clarityPosition === 100
                        ? 'bg-emerald-400 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {t('بعد العملية 6/6 (100%)', 'After 20/20 (100%)')}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Interactive Visual Stage - In-place Layer Transition */}
            <div className="lg:col-span-7">
              <div className="relative aspect-16/10 rounded-2xl overflow-hidden border-2 border-slate-700 bg-slate-950 flex items-center justify-center select-none shadow-2xl">
                
                {/* 1. Base Layer: Crisp HD 20/20 Vision */}
                <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-tr from-slate-950 via-slate-900 to-[#0C2340]">
                  <div className="text-center space-y-3 max-w-sm">
                    <div className="w-16 h-16 rounded-full bg-teal-500/25 border-2 border-teal-400 flex items-center justify-center mx-auto shadow-[0_0_25px_rgba(20,184,166,0.5)]">
                      <Eye className="w-8 h-8 text-teal-300" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg sm:text-xl font-black text-white tracking-wide">
                        {t('مستشفى كنوز الأهرام - بنغازي', 'Konooz Al-Ahram Hospital')}
                      </p>
                      <p className="text-xs text-teal-300 font-bold">
                        {t('طريق طرابلس - بجانب قوس معهد الكهرباء', 'Tripoli Road - Benghazi')}
                      </p>
                    </div>
                    <div className="flex items-center justify-center gap-3 pt-2 text-xs font-mono font-black tracking-widest text-amber-300 bg-slate-900/90 px-4 py-1.5 rounded-full border border-teal-500/50 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
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
                  className="absolute inset-0 bg-slate-950/60 backdrop-blur-md pointer-events-none transition-opacity duration-150 ease-out"
                  style={{
                    opacity: (100 - clarityPosition) / 100,
                  }}
                />

                {/* Dynamic Status Badge */}
                <div className="absolute top-4 left-4 z-20">
                  {clarityPosition >= 80 ? (
                    <span className="bg-teal-950/90 border border-teal-500/80 text-teal-300 text-xs font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-fadeIn">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t('بعد العملية: وضوح تام 6/6', 'After: 20/20 HD Clarity')}</span>
                    </span>
                  ) : clarityPosition <= 20 ? (
                    <span className="bg-red-950/90 border border-red-500/80 text-red-300 text-xs font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-fadeIn">
                      <span>🔍</span>
                      <span>{t('قبل العملية: تشوش وضبابية', 'Before: Blurred Vision')}</span>
                    </span>
                  ) : (
                    <span className="bg-amber-950/90 border border-amber-500/80 text-amber-300 text-xs font-black px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5 animate-fadeIn">
                      <span>👁️</span>
                      <span>{t(`تحسن تدريجي (${clarityPosition}%)`, `Improving (${clarityPosition}%)`)}</span>
                    </span>
                  )}
                </div>

                {/* 100% HD Badge (Right side when clear) */}
                <div className="absolute bottom-4 right-4 z-20">
                  <span className="bg-slate-900/80 backdrop-blur-sm border border-slate-700 text-slate-300 text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                    {t('محاكي النظر', 'Vision Simulator')}: {clarityPosition}%
                  </span>
                </div>

              </div>

              <p className="text-[11px] text-slate-400 text-center mt-2.5">
                {t('💡 اسحب شريط التمرير لأعلى لرؤية زوال الضبابية والوصول لحدة إبصار 6/6 فائقة الوضوح', '💡 Drag the slider to watch the blur layer fade away into crystal-clear 20/20 vision')}
              </p>
            </div>

          </div>
        </div>

        {/* Patient Testimonials */}
        <div className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>{t('آراء وتجارب المرضى في بنغازي', 'Patient Stories & Reviews')}</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-[#0C2340]">
              {t('قصص نجاح واستعادة الإبصار', 'Real Patient Testimonials')}
            </h3>
          </div>

          {/* Testimonial Card Slider */}
          <div className="relative max-w-4xl mx-auto bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-lg">
            <Quote className="w-12 h-12 text-teal-200/80 absolute top-6 right-6 rtl:right-auto rtl:left-6 -scale-x-100" />

            <div className="space-y-4 relative z-10">
              {/* Rating Stars */}
              <div className="flex items-center gap-1">
                {Array.from({ length: currentTestimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-medium">
                &ldquo;{lang === 'ar' ? currentTestimonial.commentAr : currentTestimonial.commentEn}&rdquo;
              </p>

              {/* Patient and Surgery Meta */}
              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-extrabold text-[#0C2340]">
                    {lang === 'ar' ? currentTestimonial.patientNameAr : currentTestimonial.patientNameEn}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {lang === 'ar' ? currentTestimonial.cityAr : currentTestimonial.cityEn}
                  </p>
                </div>

                <div className="text-start sm:text-end">
                  <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-100 block sm:inline-block">
                    {lang === 'ar' ? currentTestimonial.procedureAr : currentTestimonial.procedureEn}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {t('الطبيب المعالج:', 'Doctor:')} {lang === 'ar' ? currentTestimonial.doctorAr : currentTestimonial.doctorEn} • {lang === 'ar' ? currentTestimonial.dateAr : currentTestimonial.dateEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center justify-center gap-3 pt-6">
              <button
                onClick={prevTestimonial}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors"
                aria-label="Previous Testimonial"
              >
                {isRTL ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-1.5">
                {TESTIMONIALS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonialIdx(i)}
                    className={`h-2 rounded-full transition-all ${
                      i === activeTestimonialIdx ? 'w-6 bg-teal-600' : 'w-2 bg-slate-300'
                    }`}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs transition-colors"
                aria-label="Next Testimonial"
              >
                {isRTL ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
