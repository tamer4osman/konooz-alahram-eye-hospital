'use client';

import React, { useState } from 'react';
import Logo from './Logo';
import Reveal from './Reveal';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';
import { MapPin, Clock, ExternalLink, ShieldCheck, Mail, Smartphone, CheckCircle2, Sparkles, User } from 'lucide-react';

export default function Footer() {
  const { lang, t, openBookingModal, doctors, specialties } = useLanguage();
  const { subscribeNewsletter, openPatientPortal } = usePatientAuth();

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterPhone, setNewsletterPhone] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    const res = subscribeNewsletter(newsletterEmail.trim(), newsletterPhone.trim(), 'زائر الموقع');
    setFeedbackMessage(lang === 'ar' ? res.messageAr : res.messageEn);
    if (res.success) {
      setNewsletterEmail('');
      setNewsletterPhone('');
    }
    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  return (
    <footer className="bg-pine-950 text-pine-200 border-t border-brass-400/20 pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">

        {/* Newsletter & WhatsApp Subscription Banner */}
        <Reveal>
          <div className="bg-pine-900 rounded-2xl p-6 md:p-8 ring-1 ring-white/10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/5 text-brass-200 ring-1 ring-brass-400/30 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t('نشرة العيون وتنبيهات الواتساب', 'Eye Health Digest & WhatsApp Alerts')}</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-bone-50 text-balance">
                {t('اشترك لتصلك نصائح صحة العيون وتنبيهات المواعيد والعمليات', 'Subscribe for Ophthalmic Health Tips & WhatsApp Alerts')}
              </h3>
              <p className="text-pine-300 text-xs leading-relaxed">
                {t(
                  'احصل على إرشادات الوقاية من جفاف العين في المناخ الليبي، أحدث تقنيات الفيمتو ليزك، وتذكيرات مواعيد الكشوفات الدورية.', 'Receive dry eye prevention guides for North African climate, laser advances, and direct WhatsApp reminders.'
                ) }
              </p>
            </div>

            <div className="w-full lg:w-auto flex flex-col gap-3">
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative w-full sm:w-60">
                  <Mail className="w-4 h-4 text-pine-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    placeholder={t('بريدك الإلكتروني..', 'Your email address..')}
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="w-full py-2.5 ps-9 pe-3 bg-pine-950/80 ring-1 ring-white/15 rounded-lg text-bone-50 placeholder-pine-400 text-xs focus:outline-none focus:ring-brass-400"
                  />
                </div>

                <div className="relative w-full sm:w-48">
                  <Smartphone className="w-4 h-4 text-pine-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={t('واتساب 091XXXXXXX', 'WhatsApp 091XXXXXXX')}
                    value={newsletterPhone}
                    onChange={(e) => setNewsletterPhone(e.target.value)}
                    className="w-full py-2.5 ps-9 pe-3 bg-pine-950/80 ring-1 ring-white/15 rounded-lg text-bone-50 placeholder-pine-400 text-xs focus:outline-none focus:ring-brass-400 tnum"
                    dir="ltr"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 bg-bone-50 hover:bg-white text-pine-950 font-extrabold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-[0.98]"
                >
                  <span>{t('اشتراك فوري', 'Subscribe')}</span>
                </button>
              </form>

              {feedbackMessage && (
                <div className="flex items-center gap-2 text-pine-300 text-xs font-bold" role="status">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{feedbackMessage}</span>
                </div>
              )}

              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => openPatientPortal('profile')}
                  className="min-h-[28px] text-xs font-bold text-brass-300 hover:text-brass-200 flex items-center gap-1 underline underline-offset-2"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{t('أو افتح ملفك الطبي وبوابة المريض', 'Or Access Your Patient Medical Portal')}</span>
                </button>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">

          {/* Brand & Mission Column */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="footer" />

            <p className="text-pine-300 leading-relaxed text-xs max-w-sm">
              {lang === 'ar' ? HOSPITAL_CONTACTS.taglineAr : HOSPITAL_CONTACTS.taglineEn}
            </p>

            <div className="p-3.5 rounded-xl bg-pine-900/70 ring-1 ring-white/10 space-y-2">
              <div className="flex items-center gap-2 text-brass-300 font-bold">
                <Clock className="w-4 h-4" />
                <span>{t('طوارئ العيون والإصابات:', '24/7 Eye Emergency:')}</span>
              </div>
              <p className="text-pine-200 text-[11px] leading-snug">
                {lang === 'ar' ? HOSPITAL_CONTACTS.workingHoursAr : HOSPITAL_CONTACTS.workingHoursEn}
              </p>
            </div>

            {/* Facebook & Social */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={HOSPITAL_CONTACTS.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-pine-100 ring-1 ring-white/15 transition-colors flex items-center gap-1.5 font-bold"
              >
                <span>فيسبوك @hospitalpyramid</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={HOSPITAL_CONTACTS.spitarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-pine-100 ring-1 ring-white/15 transition-colors flex items-center gap-1.5 font-bold"
              >
                <span>تطبيق سبيتار</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Clinical Specialties Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-bone-50 uppercase tracking-wider border-b border-white/10 pb-2">
              {t('التخصصات الجراحية', 'Surgical Specialties')}
            </h4>
            <ul className="space-y-2 text-pine-300">
              {specialties.map((spec) => (
                <li key={spec.id}>
                  <a
                    href="#specialties"
                    className="py-1 hover:text-brass-300 transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-brass-400 flex-shrink-0" aria-hidden="true" />
                    <span>{lang === 'ar' ? spec.titleAr.split('(')[0] : spec.titleEn}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Visiting Doctors Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-extrabold text-bone-50 uppercase tracking-wider border-b border-white/10 pb-2">
              {t('الاستشاريون الزائرون', 'Visiting Faculty')}
            </h4>
            <ul className="space-y-2 text-pine-300">
              {doctors.slice(0, 5).map((doc) => (
                <li key={doc.id}>
                  <a
                    href="#doctors"
                    className="py-2 min-h-[44px] flex items-center hover:text-brass-300 transition-colors block text-[11px]"
                  >
                    <span className="text-pine-100 font-semibold">{lang === 'ar' ? doc.nameAr : doc.nameEn}</span>
                    <span className="block text-pine-400 text-[10px]">{lang === 'ar' ? doc.originAr : doc.originEn}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Address Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-bone-50 uppercase tracking-wider border-b border-white/10 pb-2">
              {t('العنوان والاتصال (بنغازي)', 'Address & Contact')}
            </h4>

            <div className="space-y-2 text-pine-300 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-brass-300 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {lang === 'ar' ? HOSPITAL_CONTACTS.addressAr : HOSPITAL_CONTACTS.addressEn}
                </span>
              </p>

              <div className="pt-2 space-y-1">
                <p className="text-[11px] font-bold text-pine-100">{t('أرقام الهواتف المباشرة:', 'Direct Hotlines:')}</p>
                <div className="grid grid-cols-2 gap-1 font-bold text-[11px] text-brass-300 tnum" dir="ltr">
                  {HOSPITAL_CONTACTS.phoneNumbers.map((p) => (
                    <a key={p.number} href={`tel:${p.number}`} className="py-2 min-h-[44px] flex items-center hover:underline">
                      {p.display}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => openBookingModal()}
              className="w-full py-2.5 px-3 bg-bone-50 hover:bg-white text-pine-950 font-extrabold rounded-lg transition-colors text-xs mt-2 active:scale-[0.98]"
            >
              {t('احجز موعد كشف الآن', 'Book Consultation')}
            </button>
          </div>

        </div>

        {/* Bottom Bar & License Notice */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-pine-400 text-[11px]">
          <div className="flex items-center gap-2 text-center sm:text-start">
            <ShieldCheck className="w-4 h-4 text-brass-400 flex-shrink-0" />
            <span>
              {t(
                'مستشفى كنوز الأهرام التخصصي لطب وجراحة العيون - بنغازي، ليبيا. جميع الحقوق محفوظة © 2026',
                'Konooz Al-Ahram Specialized Eye & Ophthalmic Surgery Hospital - Benghazi, Libya. All Rights Reserved © 2026'
              )}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-pine-300 font-semibold">
              {t('رؤية أوضح لحياة أفضل', 'Clearer Vision for a Better Life')}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
