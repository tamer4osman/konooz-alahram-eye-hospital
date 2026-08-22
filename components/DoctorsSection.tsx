'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DOCTORS, Doctor } from '@/data/hospitalData';
import { Calendar, Award, GraduationCap, MapPin, Clock, CheckCircle2 } from 'lucide-react';

export default function DoctorsSection() {
  const { lang, t, openBookingModal } = useLanguage();
  const [doctorTypeFilter, setDoctorTypeFilter] = useState<'all' | 'visiting' | 'local'>('all');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const filterOptions = [
    { id: 'all', labelAr: 'جميع التخصصات', labelEn: 'All Specialties' }, { id: 'retina-vitreous', labelAr: 'الشبكية والجسم الزجاجي', labelEn: 'Retina & Vitreous' }, { id: 'refractive-lasik', labelAr: 'الفيمتو ليزك وتصحيح الإبصار', labelEn: 'LASIK & Refractive' }, { id: 'cataract-phaco', labelAr: 'المياه البيضاء والفاكو', labelEn: 'Cataract & Phaco' }, { id: 'pediatric-strabismus', labelAr: 'حول وعيون الأطفال', labelEn: 'Pediatric Strabismus' }, { id: 'oculoplastics', labelAr: 'تجميل الجفون ومجرى الدموع', labelEn: 'Oculoplastics' }, { id: 'cornea-keratoconus', labelAr: 'القرنية المخروطية', labelEn: 'Cornea' }, ];

  const filteredDoctors = DOCTORS.filter((doctor) => {
    const matchType = doctorTypeFilter === 'all' || doctor.doctorType === doctorTypeFilter;
    const matchSpecialty = selectedFilter === 'all' || doctor.specialtyId === selectedFilter;
    return matchType && matchSpecialty; });

  return (
    <section id="doctors" className="py-16 sm:py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12 space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold">
            <GraduationCap className="w-4 h-4 text-amber-600" />
            <span>{t('نخبة الاستشاريين وأساتذة الجامعات', 'Visiting Professors & Senior Consultants')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0C2340]">
            {t(
              'أكبر كادر جراحي متخصص في طب العيون ببنغازي', 'Distinguished International & National Surgical Faculty'
            ) }
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
            {t(
              'ينفرد مستشفى كنوز الأهرام باستضافة دورية لكبار أساتذة جراحة العيون من كليات طب قصر العيني وعين شمس والإسكندرية، بجانب نخبة استشاريي بنغازي.', 'Hosting senior university professors from Cairo, Kasr Al-Ainy, Ain Shams, and Alexandria, alongside renowned Libyan senior consultants.'
            )}
          </p>
        </div>

        {/* Doctor Category Segmented Switch (Visiting vs Local vs All) */ }
        <div className="max-w-2xl mx-auto mb-6 bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1.5 border border-slate-200">
          <button
            type="button"
            id="tab-doctors-all"
            onClick={() => setDoctorTypeFilter('all')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all text-center cursor-pointer ${
              doctorTypeFilter === 'all'
                ? 'bg-white text-[#0C2340] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {t('جميع الأطباء', 'All Doctors')} ({DOCTORS.length})
          </button>

          <button
            type="button"
            id="tab-doctors-visiting"
            onClick={() => setDoctorTypeFilter('visiting')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              doctorTypeFilter === 'visiting'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm'
                : 'text-amber-800 hover:text-amber-950 hover:bg-amber-100/50'
            }`}
          >
            <span>⭐</span>
            <span>{t('الاستشاريون الزوار (مصر 🇪🇬)', 'Visiting Consultants (Egypt)')}</span>
          </button>

          <button
            type="button"
            id="tab-doctors-local"
            onClick={() => setDoctorTypeFilter('local')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black transition-all text-center flex items-center justify-center gap-1.5 cursor-pointer ${
              doctorTypeFilter === 'local'
                ? 'bg-gradient-to-r from-teal-600 to-[#0C2340] text-white shadow-sm'
                : 'text-teal-800 hover:text-teal-950 hover:bg-teal-100/50'
            }`}
          >
            <span>🏥</span>
            <span>{t('الأطباء المحليون (بنغازي 🇱🇾)', 'Local Doctors (Benghazi)')}</span>
          </button>
        </div>

        {/* Specialty Filter Tabs */}
        <div className="flex items-center justify-start lg:justify-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {filterOptions.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                selectedFilter === filter.id
                  ? 'bg-[#0C2340] text-white shadow-md shadow-slate-900/10'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{lang === 'ar' ? filter.labelAr : filter.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredDoctors.map((doc: Doctor) => {
            const isAvailableNow = doc.status === 'available_now';

            return (
              <div
                key={doc.id}
                id={`card-doctor-${doc.id}`}
                className="bg-slate-50 rounded-2xl border border-slate-200/80 hover:border-teal-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Doctor Card Top Banner with Status Badge */}
                <div className="p-6 space-y-4">
                  {/* Status Indicator & Country Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        isAvailableNow
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300/60'
                          : 'bg-amber-100 text-amber-900 border border-amber-300/60'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isAvailableNow ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                        }`}
                      />
                      <span>
                        {isAvailableNow
                          ? t('متاح للحجز الآن', 'Available for Booking')
                          : t('زيارة مرتقبة ومجدولة', 'Scheduled Visit')}
                      </span>
                    </span>

                    <span className="text-xs font-bold text-slate-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                      {lang === 'ar' ? doc.originAr : doc.originEn}
                    </span>
                  </div>

                  {/* Doctor Profile Header */}
                  <div className="flex items-center gap-3.5 pt-2">
                    {/* Visual Avatar with Medical Badge */}
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0C2340] to-teal-700 text-white flex items-center justify-center font-bold text-lg shadow-md flex-shrink-0 border-2 border-white">
                      <GraduationCap className="w-7 h-7 text-teal-200" />
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-black text-[#0C2340] leading-snug">
                        {lang === 'ar' ? doc.nameAr : doc.nameEn}
                      </h3>
                      <p className="text-xs font-bold text-teal-700 mt-0.5">
                        {lang === 'ar' ? doc.specialtyAr : doc.specialtyEn}
                      </p>
                    </div>
                  </div>

                  {/* Academic Title & University */}
                  <div className="space-y-1.5 bg-white p-3 rounded-xl border border-slate-100 text-xs">
                    <p className="text-slate-800 font-semibold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{lang === 'ar' ? doc.titleAr : doc.titleEn}</span>
                    </p>
                    <p className="text-[11px] text-slate-500 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                      <span>{lang === 'ar' ? doc.universityAr : doc.universityEn}</span>
                    </p>
                  </div>

                  {/* Highlights / Credentials */}
                  <div className="space-y-1.5 pt-1">
                    {(lang === 'ar' ? doc.highlightsAr : doc.highlightsEn).map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{h}</span>
                      </div>
                    ))}
                  </div>

                  {/* Schedule Box */}
                  <div className="bg-teal-50/70 border border-teal-100 p-2.5 rounded-xl text-xs flex items-center gap-2 text-teal-900">
                    <Clock className="w-4 h-4 text-teal-700 flex-shrink-0" />
                    <span className="font-bold">
                      {lang === 'ar' ? doc.visitScheduleAr : doc.visitScheduleEn}
                    </span>
                  </div>

                  {/* Experience & Surgeries Metrics */}
                  <div className="grid grid-cols-2 gap-2 text-center text-xs pt-1">
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">{t('سنوات الخبرة', 'Experience')}</span>
                      <span className="font-extrabold text-[#0C2340]">+{doc.experienceYears} {t('عاماً', 'Years')}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-slate-100">
                      <span className="text-[10px] text-slate-400 block">{t('العمليات المنجزة', 'Surgeries')}</span>
                      <span className="font-extrabold text-teal-700">{doc.surgeriesCount}</span>
                    </div>
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-white border-t border-slate-200/80 flex items-center gap-2">
                  <button
                    id={`btn-doctor-book-${doc.id}`}
                    onClick={() => openBookingModal(doc.specialtyId, doc.id)}
                    className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#0C2340] hover:bg-teal-700 transition-all flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Calendar className="w-4 h-4 text-teal-300" />
                    <span>{t('حجز استشارة مع الطبيب', 'Book Doctor Consultation')}</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
