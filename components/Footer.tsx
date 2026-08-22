'use client';

import React, { useState } from 'react';
import Logo from './Logo';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { HOSPITAL_CONTACTS, SPECIALTIES, DOCTORS } from '@/data/hospitalData';
import { MapPin, Clock, ExternalLink, ShieldCheck, Mail, Smartphone, CheckCircle2, Sparkles, User } from 'lucide-react';

export default function Footer() {
  const { lang, t, openBookingModal } = useLanguage();
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
    <footer className="bg-[#07172B] text-slate-300 border-t border-slate-800 pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        
        {/* Interactive Newsletter & WhatsApp Subscription Banner */ }
        <div className="bg-gradient-to-r from-[#0C2340] via-[#163660] to-[#0C2340] rounded-2xl p-6 md:p-8 border border-slate-700 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('نشرة العيون وتنبيهات الواتساب', 'Eye Health Digest & WhatsApp Alerts')}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {t('اشترك لتصلك نصائح صحة العيون وتنبيهات المواعيد والعمليات', 'Subscribe for Ophthalmic Health Tips & WhatsApp Alerts')}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              {t(
                'احصل على إرشادات الوقاية من جفاف العين في المناخ الليبي، أحدث تقنيات الفيمتو ليزك، وتذكيرات مواعيد الكشوفات الدورية.', 'Receive dry eye prevention guides for North African climate, laser advances, and direct WhatsApp reminders.'
              ) }
            </p>
          </div>

          <div className="w-full lg:w-auto flex flex-col gap-3">
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-60">
                <Mail className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder={t('بريدك الإلكتروني..', 'Your email address..')}
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full py-2.5 ps-9 pe-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="relative w-full sm:w-48">
                <Smartphone className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={t('واتساب 091XXXXXXX', 'WhatsApp 091XXXXXXX')}
                  value={newsletterPhone}
                  onChange={(e) => setNewsletterPhone(e.target.value)}
                  className="w-full py-2.5 ps-9 pe-3 bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-md flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>{t('اشتراك فوري', 'Subscribe')}</span>
              </button>
            </form>

            {feedbackMessage && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{feedbackMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={() => openPatientPortal('profile')}
                className="text-xs font-bold text-teal-300 hover:text-teal-200 flex items-center gap-1 underline"
              >
                <User className="w-3.5 h-3.5" />
                <span>{t('أو افتح ملفك الطبي وبوابة المريض', 'Or Access Your Patient Medical Portal')}</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* Brand & Mission Column */}
          <div className="lg:col-span-4 space-y-4">
            <Logo variant="footer" className="brightness-125" />

            <p className="text-slate-400 leading-relaxed text-xs">
              {lang === 'ar' ? HOSPITAL_CONTACTS.taglineAr : HOSPITAL_CONTACTS.taglineEn}
            </p>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold">
                <Clock className="w-4 h-4" />
                <span>{t('طوارئ العيون والإصابات:', '24/7 Eye Emergency:')}</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-snug">
                {lang === 'ar' ? HOSPITAL_CONTACTS.workingHoursAr : HOSPITAL_CONTACTS.workingHoursEn}
              </p>
            </div>

            {/* Facebook & Social */}
            <div className="flex items-center gap-2 pt-1">
              <a
                href={HOSPITAL_CONTACTS.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition-colors flex items-center gap-1.5 font-bold"
              >
                <span>فيسبوك @hospitalpyramid</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={HOSPITAL_CONTACTS.spitarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/40 text-teal-300 border border-teal-500/30 transition-colors flex items-center gap-1.5 font-bold"
              >
                <span>تطبيق سبيتار</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Clinical Specialties Links */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              {t('التخصصات الجراحية', 'Surgical Specialties')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              {SPECIALTIES.map((spec) => (
                <li key={spec.id}>
                  <a
                    href="#specialties"
                    className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-teal-500" />
                    <span>{lang === 'ar' ? spec.titleAr.split('(')[0] : spec.titleEn}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Visiting Doctors Column */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              {t('الاستشاريون الزائرون', 'Visiting Faculty')}
            </h4>
            <ul className="space-y-2 text-slate-400">
              {DOCTORS.slice(0, 5).map((doc) => (
                <li key={doc.id}>
                  <a
                    href="#doctors"
                    className="hover:text-teal-400 transition-colors block text-[11px]"
                  >
                    <span className="text-slate-200 font-semibold">{lang === 'ar' ? doc.nameAr : doc.nameEn}</span>
                    <span className="block text-slate-500 text-[10px]">{lang === 'ar' ? doc.originAr : doc.originEn}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Address Column */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-sm font-extrabold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              {t('العنوان والاتصال (بنغازي)', 'Address & Contact')}
            </h4>
            
            <div className="space-y-2 text-slate-400 text-xs">
              <p className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {lang === 'ar' ? HOSPITAL_CONTACTS.addressAr : HOSPITAL_CONTACTS.addressEn}
                </span>
              </p>

              <div className="pt-2 space-y-1">
                <p className="text-[11px] font-bold text-slate-300">{t('أرقام الهواتف المباشرة:', 'Direct Hotlines:')}</p>
                <div className="grid grid-cols-2 gap-1 font-mono text-[11px] text-amber-400" dir="ltr">
                  {HOSPITAL_CONTACTS.phoneNumbers.map((p) => (
                    <a key={p.number} href={`tel:${p.number}`} className="hover:underline">
                      {p.display}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => openBookingModal()}
              className="w-full py-2.5 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold rounded-xl transition-colors text-xs mt-2"
            >
              {t('احجز موعد كشف الآن', 'Book Consultation')}
            </button>
          </div>

        </div>

        {/* Bottom Bar & License Notice */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2 text-center sm:text-start">
            <ShieldCheck className="w-4 h-4 text-teal-500 flex-shrink-0" />
            <span>
              {t(
                'مستشفى كنوز الأهرام التخصصي لطب وجراحة العيون - بنغازي، ليبيا. جميع الحقوق محفوظة © 2026',
                'Konooz Al-Ahram Specialized Eye & Ophthalmic Surgery Hospital - Benghazi, Libya. All Rights Reserved © 2026'
              )}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 font-semibold">
              {t('رؤية أوضح لحياة أفضل', 'Clearer Vision for a Better Life')}
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
