'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { HOSPITAL_CONTACTS, HOSPITAL_IMAGES, FAQ_LIST } from '@/data/hospitalData';
import { MapPin, Phone, Clock, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, Navigation, Building2 } from 'lucide-react';

export default function LocationAndContact() {
  const { lang, t } = useLanguage();
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaqIdx(openFaqIdx === idx ? null : idx);
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-slate-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-16">
        
        {/* Section Header */ }
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-teal-100 text-teal-900 text-xs font-bold">
            <MapPin className="w-3.5 h-3.5 text-teal-700" />
            <span>{t('الموقع وطرق التواصل والحجز', 'Location & Contact Directory')}</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0C2340]">
            {t(
              'مستشفى كنوز الأهرام لطب وجراحة العيون في بنغازي', 'Konooz Al-Ahram Specialized Eye Hospital'
            ) }
          </h2>

          <p className="text-sm sm:text-base text-slate-600 font-normal">
            {t(
              'يسعدنا استقبالكم وتقديم أرقى مستويات الرعاية الطبية. تواصل معنا مباشرة عبر الأرقام المخصصة أو تفضل بزيارتنا.', 'We welcome you to our modern facility on Tripoli Road. Contact our department hotlines directly or book through Spitar.'
            )}
          </p>
        </div>

        {/* Hospital Facade Architecture Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200 group bg-slate-900">
          <div className="relative h-64 sm:h-80 md:h-96 w-full">
            <Image
              src={HOSPITAL_IMAGES.hospitalExterior}
              alt={lang === 'ar' ? 'المبنى الرئيسي لمستشفى كنوز الأهرام لطب العيون في بنغازي' : 'Konooz Al-Ahram Eye Hospital Main Building' }
              fill
              sizes="(max-width: 1280px) 100vw, 1200px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          </div>

          {/* Floating Details on Banner */}
          <div className="absolute bottom-6 inset-x-6 sm:bottom-8 sm:inset-x-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 z-10 text-white">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/90 text-slate-950 text-xs font-black backdrop-blur-md">
                <Building2 className="w-3.5 h-3.5" />
                <span>{t('المقر الرئيسي التخصصي في بنغازي', 'Main Specialized Hospital Facility')}</span>
              </div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white drop-shadow-md">
                {lang === 'ar' ? 'مستشفى كنوز الأهرام لطب وجراحة العيون' : 'Konooz Al-Ahram Eye & Surgery Hospital'}
              </h3>
              <p className="text-xs sm:text-sm text-teal-200 max-w-xl font-medium">
                {lang === 'ar'
                  ? 'صرح طبي متكامل يضم 4 غرف عمليات كبسولية، أحدث أجهزة الليزر التشخيصية، وعيادات خارجية مجهزة بأعلى المقاييس.'
                  : 'A premier ophthalmic center featuring 4 laminar flow ORs, cutting-edge diagnostic laser platforms, and fully equipped outpatient clinics.'}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <a
                href={HOSPITAL_CONTACTS.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 bg-white hover:bg-teal-50 text-slate-900 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('فتح الاتجاهات', 'Get Directions')}</span>
              </a>
            </div>
          </div>
        </div>

        {/* 6 Phone Numbers Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-extrabold text-[#0C2340] flex items-center gap-2">
              <Phone className="w-5 h-5 text-teal-600" />
              <span>{t('دليل هواتف المستشفى للحجز والاستعلام (بنغازي):', 'Hospital Phone & Inquiries Directory:')}</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {t('اضغط على أي رقم للاتصال المباشر', 'Tap any number to call')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOSPITAL_CONTACTS.phoneNumbers.map((phone, idx) => (
              <a
                key={idx}
                id={`btn-call-phone-${idx}`}
                href={`tel:${phone.number}`}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 hover:border-teal-500 hover:shadow-lg transition-all flex items-center justify-between group"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 block">
                    {lang === 'ar' ? phone.labelAr : phone.labelEn}
                  </span>
                  <span
                    className="text-base sm:text-lg font-black text-[#0C2340] group-hover:text-teal-700 transition-colors"
                    dir="ltr"
                  >
                    {phone.display}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors flex-shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Location & Spitar & Facebook 2-Column Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Location Card with Map Graphic */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Navigation className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-lg font-black text-[#0C2340]">
                    {t('موقع المستشفى بالتفصيل في بنغازي', 'Detailed Location in Benghazi')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{t('طريق طرابلس الرئيسي', 'Main Tripoli Road')}</p>
                </div>
              </div>

              {/* Exact Text Address Box */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs sm:text-sm text-slate-800">
                <p className="font-bold flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                  <span>{lang === 'ar' ? HOSPITAL_CONTACTS.addressAr : HOSPITAL_CONTACTS.addressEn}</span>
                </p>
                <div className="flex items-center gap-2 text-slate-600 text-xs pt-1 border-t border-slate-200">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{lang === 'ar' ? HOSPITAL_CONTACTS.workingHoursAr : HOSPITAL_CONTACTS.workingHoursEn}</span>
                </div>
              </div>

              {/* Google Maps Embed in Map Card */}
              <div className="relative w-full h-72 sm:h-80 md:h-96 rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100 group">
                <iframe
                  title={lang === 'ar' ? 'موقع مستشفى كنوز الأهرام لطب العيون على خرائط جوجل' : 'Konooz Al-Ahram Eye Hospital Location on Google Maps'}
                  src={`https://maps.google.com/maps?q=${HOSPITAL_CONTACTS.coordinates.lat},${HOSPITAL_CONTACTS.coordinates.lng}&hl=${lang === 'ar' ? 'ar' : 'en'}&z=16&output=embed`}
                  className="w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />

                {/* Floating Hospital Location Tag Overlay */}
                <div className="absolute top-3 start-3 bg-[#0C2340]/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-teal-500/30 text-white shadow-lg pointer-events-none flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-ping" />
                  <div>
                    <p className="text-xs font-black text-white">
                      {lang === 'ar' ? 'مستشفى كنوز الأهرام لطب وجراحة العيون' : 'Konooz Al-Ahram Eye Hospital'}
                    </p>
                    <p className="text-[10px] text-teal-300">
                      {lang === 'ar' ? 'طريق طرابلس - مقابل أول مدخل بوصنيب' : 'Tripoli Road - Benghazi'}
                    </p>
                  </div>
                </div>

                {/* Floating Open Full Map Button */}
                <a
                  href={HOSPITAL_CONTACTS.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-3 end-3 bg-white/95 hover:bg-white text-slate-800 hover:text-teal-700 px-3 py-1.5 rounded-lg shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all backdrop-blur"
                >
                  <span>{t('عرض في خرائط Google', 'View in Google Maps')}</span>
                  <ExternalLink className="w-3 h-3 text-teal-600" />
                </a>
              </div>
            </div>

            {/* Direction Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href={HOSPITAL_CONTACTS.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-[#0C2340] hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <Navigation className="w-3.5 h-3.5 text-teal-300" />
                <span>{t('فتح الموقع في خرائط Google', 'Open in Google Maps')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <a
                href={`https://wa.me/${HOSPITAL_CONTACTS.primaryWhatsApp.replace('+', '')}?text=${encodeURIComponent(
                  lang === 'ar'
                    ? 'السلام عليكم، يرجى إرسال موقع المستشفى المباشر (Location) على الواتساب.'
                    : 'Hello, please send the hospital direct location on WhatsApp.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>{t('طلب اللوكيشن عبر واتساب', 'Send Location on WhatsApp')}</span>
              </a>
            </div>
          </div>

          {/* Right: Spitar Booking & Official Facebook Card */}
          <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
            
            {/* Spitar Integration Box */}
            <div
              id="spitar"
              className="bg-gradient-to-br from-[#0C2340] to-teal-950 text-white rounded-3xl p-6 sm:p-7 border border-teal-500/30 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-amber-300 bg-amber-950/60 border border-amber-400/40 px-3 py-1 rounded-full">
                  {t('شريك الحجز المعتمد', 'Official Booking Partner')}
                </span>
                <div className="text-right">
                  <span className="text-base font-black text-white">{t('منصة سبيتار', 'Spitar Platform')}</span>
                  <span className="block text-[10px] text-teal-300">Spitar Health App</span>
                </div>
              </div>

              <h4 className="text-lg font-black text-white leading-snug">
                {t(
                  'احجز كشفك مباشرة عبر تطبيق سبيتار بكل سهولة',
                  'Book Appointments Instantly on the Spitar App'
                )}
              </h4>

              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                {t(
                  'يتيح لك تطبيق سبيتار استعراض مواعيد عيادات كنوز الأهرام، واختيار الطبيب، وتأكيد الحجز فورياً مع إشعارات الموعد.',
                  'Easily browse Konooz Al-Ahram clinics, choose your doctor and visiting consultant schedule, and confirm your slot instantly.'
                )}
              </p>

              <div className="space-y-2 text-xs text-slate-200 pt-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>{t('اختيار الطبيب وتاريخ الزيارة بسهولة', 'Select specialist & visit date')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                  <span>{t('تنبيهات مسبقة قبل موعد الكشف', 'Automated SMS & app reminders')}</span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={HOSPITAL_CONTACTS.spitarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl font-black text-slate-950 bg-gradient-to-r from-teal-300 to-cyan-300 hover:from-teal-200 hover:to-cyan-200 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm shadow-md"
                >
                  <span>{t('فتح تطبيق سبيتار للحجز الآن', 'Open Spitar Platform to Book')}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Official Facebook Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-lg space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 font-black text-lg">
                  f
                </div>
                <div>
                  <h4 className="text-sm font-extrabold text-[#0C2340]">
                    {t('الصفحة الرسمية على فيسبوك', 'Official Facebook Community')}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-mono">@hospitalpyramid</p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {t(
                  'تابع مواعيد وصول الاستشاريين الزائرين من مصر، والعروض والخدمات الجراحية الجديدة، وإرشادات صحة العيون اليومية.',
                  'Stay updated on visiting Egyptian consultant schedules, surgical offers, and daily eye care tips on our official Facebook page.'
                )}
              </p>

              <a
                href={HOSPITAL_CONTACTS.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{t('زيارة صفحة فيسبوك الرسمية', 'Visit Official Facebook Page')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

          </div>

        </div>

        {/* Frequently Asked Questions Accordion */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-lg space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-[#0C2340]">
              {t('الأسئلة الشائعة حول الفحوصات والعمليات', 'Frequently Asked Questions')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              {t('إجابات شاملة لأهم استفسارات المرضى حول جراحات العيون والحجز', 'Key information regarding procedures, recovery, and bookings')}
            </p>
          </div>

          <div className="space-y-3 max-w-3xl mx-auto">
            {FAQ_LIST.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 overflow-hidden transition-all"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-start font-bold text-xs sm:text-sm text-[#0C2340] hover:bg-slate-50 flex items-center justify-between gap-4 transition-colors"
                  >
                    <span>{lang === 'ar' ? faq.qAr : faq.qEn}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50 font-normal">
                      {lang === 'ar' ? faq.aAr : faq.aEn}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
