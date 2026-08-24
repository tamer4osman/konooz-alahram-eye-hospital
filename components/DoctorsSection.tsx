'use client';

import React, { useState } from 'react';
import Reveal from './Reveal';
import { useLanguage } from '@/context/LanguageContext';
import type { Doctor } from '@/data/hospitalData';
import { Calendar, Award, GraduationCap, Clock, CheckCircle2, Star, Hospital } from 'lucide-react';

export default function DoctorsSection() {
  const { lang, t, openBookingModal, doctors } = useLanguage();
  const [doctorTypeFilter, setDoctorTypeFilter] = useState<'all' | 'visiting' | 'local'>('all');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = [
    { id: 'all', labelAr: 'جميع التخصصات', labelEn: 'All Specialties' }, { id: 'retina-vitreous', labelAr: 'الشبكية والجسم الزجاجي', labelEn: 'Retina & Vitreous' }, { id: 'refractive-lasik', labelAr: 'الفيمتو ليزك وتصحيح الإبصار', labelEn: 'LASIK & Refractive' }, { id: 'cataract-phaco', labelAr: 'المياه البيضاء والفاكو', labelEn: 'Cataract & Phaco' }, { id: 'pediatric-strabismus', labelAr: 'حول وعيون الأطفال', labelEn: 'Pediatric Strabismus' }, { id: 'oculoplastics', labelAr: 'تجميل الجفون ومجرى الدموع', labelEn: 'Oculoplastics' }, { id: 'cornea-keratoconus', labelAr: 'القرنية المخروطية', labelEn: 'Cornea' }, ];

  const filteredDoctors = doctors.filter((doctor) => {
    const matchType = doctorTypeFilter === 'all' || doctor.doctorType === doctorTypeFilter;
    const matchSpecialty = selectedFilter === 'all' || doctor.specialtyId === selectedFilter;
    return matchType && matchSpecialty; });

  // Initial monogram from the localized name
  const monogramOf = (doc: Doctor) => {
    const name = lang === 'ar' ? doc.nameAr : doc.nameEn;
    const cleaned = name.replace(/^(د\.|Dr\.?|أ\.د\.|Prof\.?)\s*/u, '').trim();
    return cleaned.charAt(0);
  };

  return (
    <section id="doctors" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section Header */}
        <Reveal className="max-w-3xl mb-10 sm:mb-12 space-y-3">
          <h2 className="text-2xl sm:text-3xl lg:text-[2.4rem] lg:leading-tight font-extrabold text-pine-900 tracking-tight text-balance">
            {t(
              'أكبر كادر جراحي متخصص في طب العيون ببنغازي', 'Distinguished International & National Surgical Faculty'
            ) }
          </h2>

          <p className="text-sm sm:text-base text-ink-500 leading-relaxed max-w-2xl font-normal">
            {t(
              'ينفرد مستشفى كنوز الأهرام باستضافة دورية لكبار أساتذة جراحة العيون من كليات طب قصر العيني وعين شمس والإسكندرية، بجانب نخبة استشاريي بنغازي.', 'Hosting senior university professors from Cairo, Kasr Al-Ainy, Ain Shams, and Alexandria, alongside renowned Libyan senior consultants.'
            )}
          </p>
        </Reveal>

        {/* Doctor Category Segmented Switch */}
        <Reveal>
          <div className="max-w-2xl mb-6 bg-bone-100 p-1.5 rounded-xl flex items-center gap-1.5 border border-pine-900/10">
            <button
              type="button"
              id="tab-doctors-all"
              onClick={() => setDoctorTypeFilter('all')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
                doctorTypeFilter === 'all'
                  ? 'bg-white text-pine-900 shadow-sm'
                  : 'text-ink-500 hover:text-ink-900'
              }`}
            >
              {t('جميع الأطباء', 'All Doctors')} ({doctors.length})
            </button>

            <button
              type="button"
              id="tab-doctors-visiting"
              onClick={() => setDoctorTypeFilter('visiting')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                doctorTypeFilter === 'visiting'
                  ? 'bg-brass-400 text-pine-950 shadow-sm'
                  : 'text-brass-600 hover:bg-brass-50'
              }`}
            >
              <Star className="w-4 h-4" />
              <span>{t('الاستشاريون الزوار (مصر 🇪🇬)', 'Visiting Consultants (Egypt)')}</span>
            </button>

            <button
              type="button"
              id="tab-doctors-local"
              onClick={() => setDoctorTypeFilter('local')}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
                doctorTypeFilter === 'local'
                  ? 'bg-pine-900 text-bone-50 shadow-sm'
                  : 'text-pine-800 hover:bg-pine-100'
              }`}
            >
              <Hospital className="w-4 h-4" />
              <span>{t('الأطباء المحليون (بنغازي 🇱🇾)', 'Local Doctors (Benghazi)')}</span>
            </button>
          </div>
        </Reveal>

        {/* Specialty Filter Tabs */}
        <Reveal delay={60}>
          <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer active:scale-[0.98] ${
                  selectedFilter === filter.id
                    ? 'bg-pine-900 text-bone-50 shadow-sm'
                    : 'bg-bone-100 text-ink-700 hover:bg-bone-200 border border-pine-900/10'
                }`}
              >
                <span>{lang === 'ar' ? filter.labelAr : filter.labelEn}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
          {filteredDoctors.map((doc: Doctor, idx) => {
            const isAvailableNow = doc.status === 'available_now';
            const isVisiting = doc.doctorType === 'visiting';

            return (
              <Reveal key={doc.id} delay={(idx % 3) * 80}>
                <article
                  id={`card-doctor-${doc.id}`}
                  className="bg-bone-50 rounded-2xl ring-1 ring-pine-900/10 hover:ring-pine-900/20 hover:shadow-[0_20px_48px_-16px_rgba(8,33,28,0.22)] transition-all duration-300 flex flex-col justify-between overflow-hidden h-full"
                >
                  <div className="p-6 space-y-4">
                    {/* Status Indicator & Country Tag */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-md ${
                          isAvailableNow
                            ? 'bg-pine-100 text-pine-800 border border-pine-900/15'
                            : 'bg-brass-50 text-brass-600 border border-brass-300/60'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isAvailableNow ? 'bg-pine-600' : 'bg-brass-400'
                          }`}
                          aria-hidden="true"
                        />
                        <span>
                          {isAvailableNow
                            ? t('متاح للحجز الآن', 'Available for Booking')
                            : t('زيارة مرتقبة ومجدولة', 'Scheduled Visit')}
                        </span>
                      </span>

                      <span className="text-xs font-bold text-ink-700 bg-white px-2.5 py-0.5 rounded-md border border-pine-900/10">
                        {lang === 'ar' ? doc.originAr : doc.originEn}
                      </span>
                    </div>

                    {/* Doctor Profile Header with Monogram Tile */}
                    <div className="flex items-center gap-3.5 pt-2">
                      <div
                        className={`relative w-14 h-14 rounded-xl flex items-center justify-center font-extrabold text-2xl flex-shrink-0 select-none ${
                          isVisiting
                            ? 'bg-pine-900 text-bone-50 ring-2 ring-brass-400 ring-offset-2 ring-offset-bone-50'
                            : 'bg-pine-700 text-bone-50'
                        }`}
                        aria-hidden="true"
                      >
                        {monogramOf(doc)}
                      </div>

                      <div>
                        <h3 className="text-base sm:text-lg font-extrabold text-pine-900 leading-snug text-balance">
                          {lang === 'ar' ? doc.nameAr : doc.nameEn}
                        </h3>
                        <p className="text-xs font-bold text-pine-700 mt-0.5">
                          {lang === 'ar' ? doc.specialtyAr : doc.specialtyEn}
                        </p>
                      </div>
                    </div>

                    {/* Academic Title & University */}
                    <div className="space-y-1.5 bg-white p-3 rounded-lg border border-pine-900/10 text-xs">
                      <p className="text-ink-900 font-semibold flex items-start gap-1.5">
                        <Award className="w-3.5 h-3.5 text-brass-500 flex-shrink-0 mt-0.5" />
                        <span>{lang === 'ar' ? doc.titleAr : doc.titleEn}</span>
                      </p>
                      <p className="text-[11px] text-ink-500 flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3 text-ink-400 flex-shrink-0" />
                        <span>{lang === 'ar' ? doc.universityAr : doc.universityEn}</span>
                      </p>
                    </div>

                    {/* Highlights / Credentials */}
                    <div className="space-y-1.5 pt-1">
                      {(lang === 'ar' ? doc.highlightsAr : doc.highlightsEn).map((h, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-ink-500">
                          <CheckCircle2 className="w-3.5 h-3.5 text-pine-600 flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{h}</span>
                        </div>
                      ))}
                    </div>

                    {/* Schedule Box */}
                    <div className="bg-pine-50 border border-pine-900/10 p-2.5 rounded-lg text-xs flex items-center gap-2 text-pine-900">
                      <Clock className="w-4 h-4 text-pine-700 flex-shrink-0" />
                      <span className="font-bold">
                        {lang === 'ar' ? doc.visitScheduleAr : doc.visitScheduleEn}
                      </span>
                    </div>

                    {/* Experience & Surgeries Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1 tnum">
                      <div className="bg-white p-2 rounded-lg border border-pine-900/10">
                        <span className="text-[10px] text-ink-400 block">{t('سنوات الخبرة', 'Experience')}</span>
                        <span className="font-extrabold text-pine-900">+{doc.experienceYears} {t('عاماً', 'Years')}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-pine-900/10">
                        <span className="text-[10px] text-ink-400 block">{t('العمليات المنجزة', 'Surgeries')}</span>
                        <span className="font-extrabold text-pine-700">{doc.surgeriesCount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-4 bg-white border-t border-pine-900/10 flex items-center gap-2 mt-auto">
                    <button
                      id={`btn-doctor-book-${doc.id}`}
                      onClick={() => openBookingModal(doc.specialtyId, doc.id)}
                      className="w-full py-2.5 px-4 rounded-lg text-xs sm:text-sm font-extrabold text-bone-50 bg-pine-900 hover:bg-pine-700 transition-colors flex items-center justify-center gap-2 active:scale-[0.99]"
                    >
                      <Calendar className="w-4 h-4 text-brass-300" />
                      <span>{t('حجز استشارة مع الطبيب', 'Book Doctor Consultation')}</span>
                    </button>
                  </div>

                </article>
              </Reveal>
            );
          })}
        </div>

      </div>
    </section>
  );
}
