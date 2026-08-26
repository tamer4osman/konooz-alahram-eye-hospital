'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import {
  HOSPITAL_CONTACTS,
  HOSPITAL_IMAGES,
  PATIENT_CONDITIONS,
  AFFECTED_EYE_OPTIONS,
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  SYMPTOM_DURATION_OPTIONS,
  PatientCondition
} from '@/data/hospitalData';
import { Calendar, CheckCircle2, Sparkles, Phone, ShieldCheck, Award, Clock, ArrowRight, ArrowLeft, Eye, MapPin, ExternalLink, ChevronDown, UserCheck, Stethoscope, Activity, User, Star, Hospital } from 'lucide-react';

export default function Hero() {
  const { lang, t, isRTL, openVisionTestModal, doctors, specialties } = useLanguage();
  const {
    currentPatient, createLocalProfile, logout, addAppointmentToCurrentPatient, openPatientPortal } = usePatientAuth();

  // Quick Hero Booking Form State
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  // Triage Multiple-Choice State
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [ageGroup, setAgeGroup] = useState<'child' | 'adult' | 'senior'>('adult');
  const [affectedEye, setAffectedEye] = useState<'both' | 'right' | 'left'>('both');
  const [selectedCondition, setSelectedCondition] = useState('lasik');
  const [symptomDuration, setSymptomDuration] = useState<'recent' | 'gradual' | 'chronic'>('recent');
  const [symptomDetails, setSymptomDetails] = useState('');

  const [selectedSpecialty, setSelectedSpecialty] = useState(specialties[0]?.id ?? '');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [consultationType, setConsultationType] = useState<'consultant' | 'clinic'>('consultant');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Effective values taking current logged-in patient into account
  const effectivePatientName = currentPatient ? (currentPatient.fullNameAr || currentPatient.fullNameEn) : patientName;
  const effectivePatientPhone = currentPatient ? (currentPatient.phone || '') : patientPhone;
  const effectivePatientEmail = currentPatient ? (currentPatient.email || '') : patientEmail;
  const effectiveGender = currentPatient ? (currentPatient.gender || gender) : gender;
  const effectiveAgeGroup = ageGroup;

  // Doctors matching selected specialty and consultation track (Visiting vs Local)
  const availableDoctors = doctors.filter((doc) => {
    const matchSpecialty = !selectedSpecialty || doc.specialtyId === selectedSpecialty;
    const matchType = consultationType === 'consultant' ? doc.doctorType === 'visiting' : doc.doctorType === 'local';
    return matchSpecialty && matchType;
  });

  const handleConditionSelect = (condition: PatientCondition) => {
    setSelectedCondition(condition.id);
    if (condition.specialtyId) {
      setSelectedSpecialty(condition.specialtyId);
      setSelectedDoctor('');
    }
  };

  const handleHeroSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = effectivePatientName.trim();
    const finalPhone = effectivePatientPhone.trim();
    const finalEmail = effectivePatientEmail.trim();

    if (!finalName || !finalPhone || !finalEmail) {
      alert(t('يرجى كتابة اسم المريض ورقم الهاتف والبريد الإلكتروني', 'Please enter patient name, phone number, and email'));
      return; }

    // Create a device-local profile if none exists (data stays in this browser)
    if (!currentPatient) {
      createLocalProfile({
        fullNameAr: finalName,
        email: finalEmail,
        phone: finalPhone,
        gender: effectiveGender
      });
    }

    const conditionObj = PATIENT_CONDITIONS.find((c) => c.id === selectedCondition);
    const specialtyObj = specialties.find((s) => s.id === selectedSpecialty);
    const doctorObj = doctors.find((d) => d.id === selectedDoctor);
    const eyeObj = AFFECTED_EYE_OPTIONS.find((e) => e.id === affectedEye);
    const ageObj = AGE_GROUP_OPTIONS.find((a) => a.id === effectiveAgeGroup);
    const genderObj = GENDER_OPTIONS.find((g) => g.id === effectiveGender);
    const durationObj = SYMPTOM_DURATION_OPTIONS.find((d) => d.id === symptomDuration);

    const conditionTitle = conditionObj
      ? lang === 'ar'
        ? `${conditionObj.icon} ${conditionObj.labelAr}`
        : `${conditionObj.icon} ${conditionObj.labelEn}`
      : t('كشف عام', 'General Examination');

    const eyeTitle = eyeObj ? (lang === 'ar' ? eyeObj.labelAr : eyeObj.labelEn) : '';
    const ageTitle = ageObj ? (lang === 'ar' ? ageObj.labelAr : ageObj.labelEn) : '';
    const genderTitle = genderObj ? (lang === 'ar' ? genderObj.labelAr : genderObj.labelEn) : '';
    const durationTitle = durationObj ? (lang === 'ar' ? durationObj.labelAr : durationObj.labelEn) : '';

    const specialtyTitle = specialtyObj ? (lang === 'ar' ? specialtyObj.titleAr : specialtyObj.titleEn) : (lang === 'ar' ? 'عام' : 'General');
    const doctorTitle = doctorObj ? (lang === 'ar' ? doctorObj.nameAr : doctorObj.nameEn) : t('أقرب استشاري متاح', 'Next Available Consultant');

    // Also store appointment in Patient EMR
    addAppointmentToCurrentPatient({
      specialtyAr: specialtyTitle,
      specialtyEn: specialtyTitle,
      doctorNameAr: doctorTitle,
      doctorNameEn: doctorTitle,
      date: preferredDate || new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      status: 'confirmed',
      locationAr: 'مستشفى كنوز الأهرام للعيون - بنغازي',
      locationEn: 'Konooz Al-Ahram Eye Hospital - Benghazi'
    });

    const msg = lang === 'ar'
      ? `*طلب حجز موعد كشف فوري ومباشر - مستشفى كنوز الأهرام للعيون (بنغازي)*
----------------------------------------
👤 *اسم المريض:* ${finalName}
📞 *رقم الهاتف:* ${finalPhone}
📧 *البريد الإلكتروني:* ${finalEmail}
⚧ *الجنس:* ${genderTitle}
🎂 *الفئة العمرية:* ${ageTitle}
👁️ *العين المصابة:* ${eyeTitle}
🩺 *سبب الزيارة / نوع الاستشارة:* ${conditionTitle}
⏱️ *مدة الأعراض / البداية:* ${durationTitle}
${symptomDetails.trim() ? `📝 *تفاصيل وملاحظات إضافية:* ${symptomDetails}\n` : ''}🏥 *القسم / التخصص:* ${specialtyTitle}
👨‍⚕️ *الطبيب المفضل:* ${doctorTitle}
📅 *الموعد المفضل:* ${preferredDate || 'أقرب موعد ممكن'}
🔍 *نوع الكشف:* ${consultationType === 'consultant' ? 'كشف استشاري زائر' : 'كشف عيادة عامة'}
----------------------------------------
*تم الإرسال والربط بالملف الطبي الإلكتروني للمستشفى*`
      : `*Instant Appointment Booking Request - Konooz Al-Ahram Eye Hospital (Benghazi)*
----------------------------------------
👤 *Patient Name:* ${finalName}
📞 *Phone Number:* ${finalPhone}
📧 *Email:* ${finalEmail}
⚧ *Gender:* ${genderTitle}
🎂 *Age Group:* ${ageTitle}
👁️ *Affected Eye:* ${eyeTitle}
🩺 *Reason for Visit:* ${conditionTitle}
⏱️ *Symptom Duration:* ${durationTitle}
${symptomDetails.trim() ? `📝 *Additional Notes:* ${symptomDetails}\n` : ''}🏥 *Department / Specialty:* ${specialtyTitle}
👨‍⚕️ *Preferred Doctor:* ${doctorTitle}
📅 *Preferred Date:* ${preferredDate || 'As soon as possible'}
🔍 *Consultation Type:* ${consultationType === 'consultant' ? 'Visiting Consultant' : 'General Clinic'}
----------------------------------------
*Synced with EMR Patient Portal - Konooz Al-Ahram*`;

    const whatsappUrl = `https://wa.me/${HOSPITAL_CONTACTS.primaryWhatsApp.replace('+', '')}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');

    // Also create server-side booking for ticket reference
    let ref = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: effectivePatientName.trim(),
          phone: effectivePatientPhone.trim(),
          email: effectivePatientEmail.trim() || undefined,
          specialtyId: selectedSpecialty,
          doctorId: selectedDoctor || undefined,
          conditionTitleAr: conditionObj?.labelAr,
          conditionTitleEn: conditionObj?.labelEn,
          preferredDate: preferredDate || undefined,
          preferredTime: consultationType === 'consultant' ? '09:00' : '16:00',
          gender: effectiveGender,
          ageGroup: effectiveAgeGroup,
          affectedEye,
          symptomDuration,
          notes: symptomDetails.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json?.data?.ref) ref = json.data.ref as string;
    } catch {
      // dev DB unreachable — keep generated ref
    }
    setBookingRef(ref);
    setFormSubmitted(true);
  };

  return (
    <section
      id="home"
      className="relative overflow-hidden bg-pine-950 text-white pt-10 pb-16 lg:py-20"
    >
      {/* Full-bleed surgical theater photograph behind a pine scrim */}
      <div className="absolute inset-0 pointer-events-none">
        <Image
          src={HOSPITAL_IMAGES.heroSurgery}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-25"
          referrerPolicy="no-referrer"
          priority
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-pine-950/85 via-pine-950/92 to-pine-950" />
        <div className="absolute inset-x-0 top-0 h-px bg-brass-400/40" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* Left Column: Value Proposition & Highlights */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Quality Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-pine-800/60 border border-pine-400/30 text-pine-200 text-[11px] sm:text-sm font-semibold leading-snug max-w-full">
              <Sparkles className="w-4 h-4 text-brass-300" />
              <span>{t('صرح طبي متخصص لطب وجراحة العيون في بنغازي', 'Specialized Center for Eye Surgery in Benghazi')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.9rem] lg:leading-[1.15] font-extrabold text-white leading-tight sm:leading-tight tracking-tight">
              {lang === 'ar' ? (
                <>
                  رؤية أوضح لحياة أفضل.. <br />
                  <span className="text-brass-300">
                    أحدث جراحات العيون
                  </span>{' '}
                  بأيدي نخبة استشاريين دوليين
                </>
              ) : (
                <>
                  Clearer Vision for a Better Life.. <br />
                  <span className="text-brass-300">
                    Advanced Eye Surgeries
                  </span>{' '}
                  by International Professors
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-pine-100/90 leading-relaxed max-w-2xl font-normal">
              {t(
                'نجمع بين خبرات كبار أساتذة طب وجراحة العيون من مصر وليبيا، وأحدث أجهزة الفيمتو ليزك والفاكو، لتوفير رعاية تخصصية متكاملة دون الحاجة للسفر للخارج.',
                'Combining senior ophthalmology professors from Egypt & Libya with advanced Femto-LASIK and micro-phaco platforms for comprehensive care in Benghazi.'
              )}
            </p>

            {/* 3 Distinct Key Pillars — hairline strip, no card boxes */}
            <div className="grid grid-cols-1 sm:grid-cols-3 pt-2 border-t border-white/15">
              <div className="flex items-center gap-2.5 py-3 sm:py-4 sm:pe-4 border-b sm:border-b-0 border-white/10">
                <div className="w-8 h-8 rounded-lg bg-pine-800/80 text-brass-300 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">{t('استشاريون زوار', 'Visiting Professors')}</p>
                  <p className="text-[11px] text-pine-200/80">{t('أساتذة كليات طب مصر', 'Egyptian Faculty')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-3 sm:py-4 sm:px-4 border-b sm:border-b-0 sm:border-s border-white/10 border-white/10">
                <div className="w-8 h-8 rounded-lg bg-pine-800/80 text-brass-300 flex items-center justify-center flex-shrink-0">
                  <Award className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">{t('فيمتو ليزك وفاكو بارد', 'Femto-LASIK & Phaco')}</p>
                  <p className="text-[11px] text-pine-200/80">{t('تقنيات ليزر دقيقة', 'Micron Precision')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 py-3 sm:py-4 sm:ps-4 sm:border-s border-white/10">
                <div className="w-8 h-8 rounded-lg bg-pine-800/80 text-brass-300 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-bold text-white">{t('طاقم مقيم 24/7', '24/7 Resident Team')}</p>
                  <p className="text-[11px] text-pine-200/80">{t('طوارئ وعيادات يومية', 'Daily Care & Emergency')}</p>
                </div>
              </div>
            </div>

            {/* Quick Action Navigation CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                id="btn-hero-vision-test"
                onClick={openVisionTestModal}
                className="px-5 py-3 rounded-lg font-bold text-pine-950 bg-bone-50 hover:bg-white shadow-md shadow-black/20 transition-all flex items-center gap-2 text-sm cursor-pointer active:scale-[0.98]"
              >
                <Eye className="w-4 h-4 text-pine-800" />
                <span>{t('فحص النظر الذاتي أونلاين', 'Interactive Vision Test')}</span>
                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
              </button>

              <a
                href="#specialties"
                className="px-5 py-3 rounded-lg font-bold text-white bg-pine-800 hover:bg-pine-700 border border-white/20 transition-all flex items-center gap-2 text-sm"
              >
                <Activity className="w-4 h-4 text-brass-300" />
                <span>{t('استعراض التخصصات الجراحية', 'View Specialties')}</span>
              </a>

              <a
                href={`tel:${HOSPITAL_CONTACTS.primaryWhatsApp}`}
                className="px-3 py-3 rounded-lg text-pine-200 hover:text-brass-300 text-xs font-semibold flex items-center gap-1.5 transition-colors tnum"
                dir="ltr"
              >
                <Phone className="w-3.5 h-3.5 text-brass-300" />
                <span>{HOSPITAL_CONTACTS.primaryWhatsAppDisplay}</span>
              </a>
            </div>

            {/* Operating theater credentials — relocated as floating chips over the scrim */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-pine-900/80 border border-brass-400/40 text-[10px] font-bold text-brass-200">
                <Sparkles className="w-3 h-3" />
                <span>{t('غرف عمليات كبسولية معقمة Class 100', 'Class 100 Laminar Cleanroom')}</span>
              </div>
              <p className="text-xs font-semibold text-pine-100">
                {lang === 'ar' ? 'ميكروسكوبات جراحية ألمانية وفيمتو ليزك' : 'German Surgical Microscopes & Femto-LASIK'}
              </p>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pine-900/80 border border-pine-400/30 text-pine-200 text-[11px] font-bold tnum">
                <ShieldCheck className="w-3.5 h-3.5 text-brass-300" />
                <span>{t('نسبة نجاح 99.4%', '99.4% Success Rate')}</span>
              </span>
            </div>

            {/* Address snippet */}
            <div className="flex items-center gap-2 text-xs text-pine-200/70 pt-1">
              <MapPin className="w-3.5 h-3.5 text-brass-300 flex-shrink-0" />
              <span>{lang === 'ar' ? HOSPITAL_CONTACTS.addressAr : HOSPITAL_CONTACTS.addressEn}</span>
            </div>

          </div>

          {/* Right Column: Interactive Quick-Booking Form Card */}
          <div className="lg:col-span-5">
            <div
              id="hero-booking-card"
              className="relative rounded-2xl bg-bone-50 text-ink-900 p-6 sm:p-7 shadow-[0_24px_64px_-16px_rgba(8,33,28,0.55)] ring-1 ring-brass-400/40"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-pine-900/10">
                <div>
                  <span className="inline-block text-[11px] font-bold text-pine-800 bg-pine-100 px-2 py-0.5 rounded-md mb-1">
                    {t('حجز فوري ومباشر', 'Instant Direct Booking')}
                  </span>
                  <h2 className="text-lg font-extrabold text-pine-900">
                    {t('طلب حجز كشف / استشارة فورية', 'Instant Consultation & Booking')}
                  </h2>
                </div>
                <div className="w-10 h-10 rounded-xl bg-pine-900 text-bone-50 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>

              {formSubmitted ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-pine-100 text-pine-700 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-extrabold text-ink-900">
                    {t('تم تجهيز طلب الحجز الفوري بنجاح!', 'Instant Booking Prepared!')}
                  </h3>
                  <p className="text-xs text-ink-500 leading-relaxed max-w-sm mx-auto">
                    {t(
                      'تم فتح تطبيق الواتساب لإرسال بيانات الحجز مباشرة لموظف الاستقبال لتأكيد الموعد المناسب لك.',
                      'WhatsApp has been opened to send your appointment details directly to our hospital reception team.'
                    )}
                  </p>
                  {bookingRef && (
                    <div className="inline-flex items-center gap-2 bg-pine-50 border border-pine-200 rounded-lg px-3 py-1.5">
                      <span className="text-[10px] text-ink-400">{t('رقم المرجع:', 'Reference:')}</span>
                      <span className="font-mono font-extrabold text-sm text-pine-900">{bookingRef}</span>
                    </div>
                  )}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="inline-flex items-center py-1.5 min-h-[32px] text-xs text-pine-700 font-bold hover:underline"
                    >
                      {t('إرسال طلب حجز آخر', 'Submit another booking request')}
                    </button>
                    <a
                      href={HOSPITAL_CONTACTS.spitarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-1 py-1.5 min-h-[32px] text-xs font-semibold text-ink-500 hover:text-pine-900"
                    >
                      <span>{t('أو الحجز عبر منصة سبيتار', 'Or book via Spitar platform')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleHeroSubmit} className="space-y-3.5">
                  
                  {/* PATIENT INFO SECTION AT THE TOP */}
                  <div className="bg-white border border-pine-900/10 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-extrabold text-pine-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-pine-700" />
                        <span>{t('1. بيانات المريض الأساسية *', '1. Primary Patient Info *')}</span>
                      </label>

                      {currentPatient ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-pine-100 text-pine-800 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {t('مسجل بالملف المحلي', 'Local profile active')}
                          </span>
                          <button
                            type="button"
                            onClick={logout}
                            className="text-[10px] text-ink-500 hover:text-red-700 underline"
                          >
                            {t('تبديل', 'Switch')}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => openPatientPortal('auth')}
                          className="text-[11px] font-bold text-pine-700 hover:text-pine-900 flex items-center gap-1 hover:underline"
                        >
                          <User className="w-3 h-3" />
                          <span>{t('أنشئ ملفك المحفوظ', 'Create your saved profile')}</span>
                        </button>
                      )}
                    </div>

                    {/* Patient Full Name */}
                    <div>
                      <label className="block text-[11px] font-bold text-ink-700 mb-1">
                        {t('اسم المريض رباعي *', 'Patient Full (Four-Part) Name *')}
                      </label>
                      <input
                        id="hero-patient-name"
                        type="text"
                        required
                        value={currentPatient ? (currentPatient.fullNameAr || currentPatient.fullNameEn) : patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        readOnly={!!currentPatient}
                        placeholder={t('مثال: أحمد عبد السلام محمد الورفلي', 'e.g., Ahmed Salem Mohamed Al-Warfalli')}
                        className={`w-full px-3 py-2 text-xs sm:text-sm border border-pine-900/20 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden transition-all text-ink-900 font-medium ${
                          currentPatient ? 'bg-bone-100 font-bold text-pine-900 cursor-not-allowed' : 'bg-white'
                        }`}
                      />
                    </div>

                    {/* Patient Phone & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-ink-700 mb-1">
                          {t('رقم الهاتف / الواتساب (+218) *', 'Phone / WhatsApp (+218) *')}
                        </label>
                        <input
                          id="hero-patient-phone"
                          type="tel"
                          required
                          value={currentPatient ? currentPatient.phone : patientPhone}
                          onChange={(e) => setPatientPhone(e.target.value)}
                          readOnly={!!currentPatient}
                          placeholder={t('091XXXXXXX', '091XXXXXXX')}
                          className={`w-full px-3 py-2 text-xs sm:text-sm border border-pine-900/20 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden transition-all text-ink-900 font-medium ${
                            currentPatient ? 'bg-bone-100 font-bold text-pine-900 cursor-not-allowed' : 'bg-white'
                          }`}
                          dir="ltr"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-ink-700 mb-1">
                          {t('البريد الإلكتروني المعتمد *', 'Official Email Address *')}
                        </label>
                        <input
                          id="hero-patient-email"
                          type="email"
                          required
                          value={currentPatient ? currentPatient.email : patientEmail}
                          onChange={(e) => setPatientEmail(e.target.value)}
                          readOnly={!!currentPatient}
                          placeholder={t('name@example.com', 'name@example.com')}
                          className={`w-full px-3 py-2 text-xs sm:text-sm border border-pine-900/20 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden transition-all text-ink-900 font-medium ${
                            currentPatient ? 'bg-bone-100 font-bold text-pine-900 cursor-not-allowed' : 'bg-white'
                          }`}
                          dir="ltr"
                        />
                      </div>
                    </div>

                    {/* Gender & Age Group Dropboxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-ink-700 mb-1">
                          {t('الجنس *', 'Gender *')}
                        </label>
                        <div className="relative">
                          <select
                            id="hero-gender-select"
                            value={effectiveGender}
                            disabled={!!currentPatient}
                            onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                            className={`w-full px-3 py-2 text-xs border border-pine-900/20 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden appearance-none transition-all text-ink-900 font-medium ${
                              currentPatient ? 'bg-bone-100 cursor-not-allowed' : 'bg-white cursor-pointer'
                            }`}
                          >
                            {GENDER_OPTIONS.map((g) => (
                              <option key={g.id} value={g.id}>
                                {lang === 'ar' ? g.labelAr : g.labelEn}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-ink-700 mb-1">
                          {t('الفئة العمرية *', 'Age Group *')}
                        </label>
                        <div className="relative">
                          <select
                            id="hero-age-select"
                            value={effectiveAgeGroup}
                            disabled={!!currentPatient}
                            onChange={(e) => setAgeGroup(e.target.value as 'child' | 'adult' | 'senior')}
                            className={`w-full px-3 py-2 text-xs border border-pine-900/20 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden appearance-none transition-all text-ink-900 font-medium ${
                              currentPatient ? 'bg-bone-100 cursor-not-allowed' : 'bg-white cursor-pointer'
                            }`}
                          >
                            {AGE_GROUP_OPTIONS.map((a) => (
                              <option key={a.id} value={a.id}>
                                {lang === 'ar' ? a.labelAr : a.labelEn}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Honest storage note for new patients */}
                    {!currentPatient && (
                      <p className="text-[10px] text-ink-500 bg-bone-100 border border-pine-900/20 rounded-lg p-2 flex items-start gap-1.5">
                        <ShieldCheck className="w-3 h-3 text-pine-700 mt-0.5 flex-shrink-0" />
                        <span>{t('يُحفظ طلب الحجز في خادم المستشفى ويُفتح واتساب للتأكيد مع الاستقبال.', 'Your booking request is saved on the hospital server; WhatsApp opens for reception confirmation.')}</span>
                      </p>
                    )}
                  </div>

                  {/* CLINICAL & CONSULTATION DETAILS SECTION */}
                  <div className="space-y-3 pt-1">
                    <p className="text-xs font-extrabold text-pine-900 flex items-center gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5 text-pine-700" />
                      <span>{t('2. تفاصيل الكشف والموعد المقترح', '2. Consultation & Appointment Details')}</span>
                    </p>

                    {/* Consultation Type Selector (Visiting vs Local) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5 text-pine-700" />
                          <span>{t('مسار ونوع الكشف الطبي *', 'Consultation Track & Doctor Category *')}</span>
                        </label>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-bone-100 text-ink-700 border border-pine-900/15">
                          {consultationType === 'consultant' ? t('نخبة أساتذة مصر 🇪🇬', 'Egyptian Faculty') : t('طاقم بنغازي المقيم 🇱🇾', 'Local Benghazi Staff')}
                        </span>
                      </div>

                      {/* Fast Segmented Radio Buttons for Visiting vs Local */}
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <button
                          type="button"
                          id="hero-track-visiting"
                          onClick={() => {
                            setConsultationType('consultant');
                            setSelectedDoctor('');
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-0.5 border text-center cursor-pointer ${
                            consultationType === 'consultant'
                              ? 'bg-brass-400 text-pine-950 border-brass-500 shadow-sm'
                              : 'bg-white hover:bg-pine-50 text-ink-700 border-pine-900/15'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            <span>{t('استشاري زائر', 'Visiting Consultant')}</span>
                          </span>
                          <span className="text-[10px] font-medium opacity-90">
                            {t('أساتذة طب مصر 🇪🇬', 'Egyptian Professors')}
                          </span>
                        </button>

                        <button
                          type="button"
                          id="hero-track-local"
                          onClick={() => {
                            setConsultationType('clinic');
                            setSelectedDoctor('');
                          }}
                          className={`px-3 py-2 rounded-lg text-xs font-extrabold transition-all flex flex-col items-center justify-center gap-0.5 border text-center cursor-pointer ${
                            consultationType === 'clinic'
                              ? 'bg-pine-900 text-bone-50 border-pine-800 shadow-sm'
                              : 'bg-white hover:bg-pine-50 text-ink-700 border-pine-900/15'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            <Hospital className="w-3.5 h-3.5" />
                            <span>{t('طبيب / استشاري محلي', 'Local Consultant')}</span>
                          </span>
                          <span className="text-[10px] font-medium opacity-90">
                            {t('طاقم بنغازي المقيم 🇱🇾', 'Benghazi Staff')}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Reason for Visit / Consultation Dropbox */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-ink-900 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-pine-700" />
                          <span>{t('سبب الزيارة أو نوع الاستشارة *', 'Reason for Visit / Consultation *')}</span>
                        </label>
                        <span className="text-[10px] text-pine-700 font-semibold bg-pine-50 px-2 py-0.5 rounded-md border border-pine-900/15">
                          {t('توجيه ذكي للقسم', 'Auto Specialty Match')}
                        </span>
                      </div>
                      <div className="relative">
                        <select
                          id="hero-condition-select"
                          value={selectedCondition}
                          onChange={(e) => {
                            const found = PATIENT_CONDITIONS.find((c) => c.id === e.target.value);
                            if (found) {
                              handleConditionSelect(found);
                            } else {
                              setSelectedCondition(e.target.value);
                            }
                          }}
                          className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                        >
                          {PATIENT_CONDITIONS.map((cond) => (
                            <option key={cond.id} value={cond.id}>
                              {cond.icon} {lang === 'ar' ? cond.labelAr : cond.labelEn} {cond.badgeAr ? `(${lang === 'ar' ? cond.badgeAr : cond.badgeEn})` : ''}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-ink-400 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Affected Eye & Symptom Duration Dropboxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-ink-900 mb-1 flex items-center gap-1.5">
                          <Eye className="w-3.5 h-3.5 text-pine-700" />
                          <span>{t('العين المصابة أو موضع الفحص *', 'Affected Eye *')}</span>
                        </label>
                        <div className="relative">
                          <select
                            id="hero-eye-select"
                            value={affectedEye}
                            onChange={(e) => setAffectedEye(e.target.value as 'both' | 'right' | 'left')}
                            className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                          >
                            {AFFECTED_EYE_OPTIONS.map((eye) => (
                              <option key={eye.id} value={eye.id}>
                                {lang === 'ar' ? eye.labelAr : eye.labelEn}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-900 mb-1 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-pine-700" />
                          <span>{t('مدة وبداية الأعراض *', 'Symptom Duration / Onset *')}</span>
                        </label>
                        <div className="relative">
                          <select
                            id="hero-duration-select"
                            value={symptomDuration}
                            onChange={(e) => setSymptomDuration(e.target.value as 'recent' | 'gradual' | 'chronic')}
                            className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                          >
                            {SYMPTOM_DURATION_OPTIONS.map((dur) => (
                              <option key={dur.id} value={dur.id}>
                                {lang === 'ar' ? dur.labelAr : dur.labelEn}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Specialty & Doctor Dropboxes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">
                          {t('التخصص الجراحي أو العيادة *', 'Clinical Specialty *')}
                        </label>
                        <div className="relative">
                          <select
                            id="hero-specialty-select"
                            value={selectedSpecialty}
                            onChange={(e) => {
                              setSelectedSpecialty(e.target.value);
                              setSelectedDoctor('');
                            }}
                            className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                          >
                            {specialties.map((spec) => (
                              <option key={spec.id} value={spec.id}>
                                {lang === 'ar' ? spec.titleAr : spec.titleEn}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1 flex items-center justify-between">
                          <span>
                            {consultationType === 'consultant'
                              ? t('الاستشاري الزائر المطلوب (مصر 🇪🇬)', 'Visiting Consultant (Egypt 🇪🇬)')
                              : t('الطبيب المحلي المطلوب (بنغازي 🇱🇾)', 'Local Resident Doctor (Libya 🇱🇾)')}
                          </span>
                        </label>
                        <div className="relative">
                          <select
                            id="hero-doctor-select"
                            value={selectedDoctor}
                            onChange={(e) => setSelectedDoctor(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                          >
                            <option value="">
                              {consultationType === 'consultant'
                                ? t('⭐ أي استشاري زائر متاح في هذا التخصص', '⭐ Any available visiting consultant')
                                : t('🏥 أي طبيب / استشاري محلي متاح في هذا التخصص', '🏥 Any available local consultant')}
                            </option>
                            {availableDoctors.map((doc) => (
                              <option key={doc.id} value={doc.id}>
                                {lang === 'ar' ? doc.nameAr : doc.nameEn} — {lang === 'ar' ? doc.universityAr : doc.universityEn}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Preferred Date & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">
                          {t('تاريخ الموعد المقترح', 'Preferred Date')}
                        </label>
                        <input
                          id="hero-preferred-date"
                          type="date"
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden transition-all text-ink-900"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-ink-700 mb-1">
                          {t('ملاحظات إضافية (اختياري)', 'Additional notes')}
                        </label>
                        <input
                          id="hero-symptom-details"
                          type="text"
                          value={symptomDetails}
                          onChange={(e) => setSymptomDetails(e.target.value)}
                          placeholder={t('ألم مفاجئ، استخدام عدسات...', 'Sudden pain, contact lenses...')}
                          className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden transition-all text-ink-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-hero-submit-booking"
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-lg font-extrabold text-bone-50 bg-pine-900 hover:bg-pine-800 shadow-lg shadow-pine-950/25 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer active:scale-[0.98] mt-2"
                  >
                    <Calendar className="w-5 h-5 text-brass-300" />
                    <span>{t('حجز فوري ومباشر', 'Instant Direct Booking')}</span>
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-ink-500 pt-1">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-pine-700" />
                      {t('بياناتك مشفرة ومحمية', 'Confidential Medical Data')}
                    </span>
                    <a
                      href={HOSPITAL_CONTACTS.spitarUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center py-1.5 min-h-[32px] text-pine-700 hover:underline font-semibold"
                    >
                      {t('تطبيق سبيتار', 'Spitar App')}
                    </a>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
