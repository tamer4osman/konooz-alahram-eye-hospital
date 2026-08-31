'use client';

import React, { useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { HOSPITAL_CONTACTS, PATIENT_CONDITIONS, AFFECTED_EYE_OPTIONS, AGE_GROUP_OPTIONS, GENDER_OPTIONS, SYMPTOM_DURATION_OPTIONS, Specialty } from '@/data/hospitalData';
import { buildBookingModalMessage, buildWhatsAppUrl } from '@/lib/whatsapp-message-builder';
import Modal from '@/components/ui/Modal';
import FormSelect from '@/components/ui/FormSelect';
import FormSection from '@/components/ui/FormSection';
import { X, Calendar, CheckCircle2, ExternalLink, Sparkles, ShieldCheck, Activity, Eye, LogOut, UserPlus, FolderLock } from 'lucide-react';
import IntakeFormRenderer from '@/components/ui/IntakeFormRenderer';
import { useBookingModalState } from '@/hooks/useBookingModalState';
import { useBookingSubmit } from '@/hooks/useBookingSubmit';

export default function BookingModal() {
  const {
    isBookingModalOpen, bookingDoctorId, bookingSpecialtyId, closeBookingModal, specialties, } = useLanguage();

  if (!isBookingModalOpen) return null;

  return (
    <BookingModalContent
      key={`${bookingSpecialtyId || ''}-${bookingDoctorId || ''}`}
      bookingSpecialtyId={bookingSpecialtyId}
      bookingDoctorId={bookingDoctorId}
      onClose={closeBookingModal}
      specialties={specialties}
    />
  );
}

function BookingModalContent({
  bookingSpecialtyId, bookingDoctorId, onClose, specialties }: {
  bookingSpecialtyId: string | null;
  bookingDoctorId: string | null;
  onClose: () => void;
  specialties: Specialty[];
}) {
  const { lang, t } = useLanguage();
  const {
    currentPatient, logout, sendNotification, openPatientPortal
  } = usePatientAuth();

  const state = useBookingModalState({ bookingSpecialtyId, bookingDoctorId });
  const { submitBooking } = useBookingSubmit();

  const handleAutoFillProfile = useCallback(() => {
    state.applyPatientProfile();
  }, [state]);

  const handleSubmitBooking = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const result = await submitBooking({
      patientName: state.patientName,
      patientPhone: state.patientPhone,
      patientEmail: state.patientEmail,
      gender: state.gender,
      ageGroup: state.ageGroup,
      affectedEye: state.affectedEye,
      selectedCondition: state.selectedCondition,
      symptomDuration: state.symptomDuration,
      selectedSpecialty: state.selectedSpecialty,
      selectedDoctor: state.selectedDoctor,
      preferredDate: state.preferredDate,
    });

    if (!result.ok) {
      alert(result.error);
      return;
    }

    const titles = result.titles;
    const slotText =
      state.preferredSlot === 'morning'
        ? (lang === 'ar' ? 'الفترة الصباحية (9:00 ص - 2:00 ظ)' : 'Morning Slot (9:00 AM - 2:00 PM)')
        : (lang === 'ar' ? 'الفترة المسائية (4:00 ع - 9:00 م)' : 'Evening Slot (4:00 PM - 9:00 PM)');

    const msg = buildBookingModalMessage({
      lang,
      bookingRef: result.bookingRef,
      queueTicket: result.queueTicket,
      patientName: state.patientName,
      phone: state.patientPhone,
      email: state.patientEmail,
      genderTitle: titles.genderTitle,
      ageTitle: titles.ageTitle,
      eyeTitle: titles.eyeTitle,
      conditionTitle: titles.conditionTitle,
      durationTitle: titles.durationTitle,
      specialtyTitle: titles.specialtyTitle,
      doctorTitle: titles.doctorTitle,
      preferredDate: state.preferredDate,
      preferredSlot: state.preferredSlot,
      slotText,
      notes: state.notes,
    });

    const whatsappUrl = buildWhatsAppUrl(HOSPITAL_CONTACTS.primaryWhatsApp, msg);
    window.open(whatsappUrl, '_blank');

    state.setConfirmedQueueTicket(result.queueTicket);
    state.setConfirmedBookingRef(result.bookingRef);

    sendNotification(
      'whatsapp',
      'تأكيد حجز موعد كشف العيون بنجاح',
      'Appointment Booking Confirmed',
      `عزيزي ${state.patientName}، تم تأكيد تسجيل موعدك في مستشفى كنوز الأهرام بنغازي لدى ${titles.doctorTitle} ليوم ${state.preferredDate || 'الأقرب'}. رقم الحجز هو #${result.bookingRef} ورقم دورك بالعيادة هو ${result.queueTicket}.`
    );

    sendNotification(
      'email',
      'تفاصيل وتأكيد موعد الكشف والتقرير الطبي المعتمد',
      'Consultation Booking Confirmation & Certified Report',
      `السيد/ة ${state.patientName}، مرفق تفاصيل حجز موعدك لـ (${titles.conditionTitle}) لدى ${titles.doctorTitle}. رقم الحجز: #${result.bookingRef}، كود المريض: ${state.patientEmail}. يرجى الحضور قبل الموعد بـ 15 دقيقة مصطحباً بطاقتك الشخصية.`
    );

    state.setIsSuccess(true);
  }, [state, submitBooking, lang, sendNotification]);

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      labelledById="booking-modal-title"
      panelClassName="w-full max-w-2xl sm:rounded-3xl overflow-hidden my-4 sm:my-8"
    >
        {/* Header - Flex layout immune to RTL/LTR overlap */}
        <div className="bg-pine-900 text-white p-5 sm:p-6 flex items-start justify-between gap-4 border-b border-pine-500/20">
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brass-300 bg-pine-900/80 border border-brass-400/40 px-3 py-1 rounded-full shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-brass-400" />
                <span>{t('حجز موعد فوري ومباشر', 'Instant Appointment Booking')}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-pine-300 bg-pine-950/70 border border-pine-500/30 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3 h-3 text-brass-400" />
                <span>{t('ملف محلي على جهازك', 'Local Device Profile')}</span>
              </span>
            </div>
            <h2 id="booking-modal-title" className="text-lg sm:text-xl font-extrabold text-white tracking-tight truncate">
              {t('مستشفى كنوز الأهرام لطب وجراحة العيون', 'Konooz Al-Ahram Eye Hospital')}
            </h2>
            <p className="text-xs text-ink-300 flex items-center gap-1.5 font-normal">
              <span>{t('طريق طرابلس - بنغازي', 'Tripoli Road - Benghazi')}</span>
              <span>•</span>
              <span>{t(`هاتف / واتساب: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`, `Phone/WhatsApp: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`)}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors flex-shrink-0 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 max-h-[78vh] overflow-y-auto space-y-5">
          {state.isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-pine-100 text-pine-700 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-ink-900">
                  {t('تم تسجيل وتأكيد حجزك الفوري بنجاح!', 'Instant Booking Confirmed Successfully!')}
                </h3>
                <p className="text-xs sm:text-sm text-ink-500 max-w-md mx-auto leading-relaxed">
                  {t(
                    'تم فتح محادثة الواتساب المباشرة مع الاستقبال لتوثيق الحجز، وتم حفظ الموعد في ملفك الطبي الإلكتروني.',
                    'WhatsApp chat opened with reception to confirm your slot, and the appointment was recorded in your medical profile.'
                  )}
                </p>
              </div>

              {/* Booking Ticket Card */}
              <div className="bg-gradient-to-br from-ink-900 to-[#0B3D33] text-white rounded-2xl p-4 max-w-md mx-auto shadow-md border border-pine-500/30 text-start space-y-3">
                <div className="flex items-center justify-between border-b border-ink-700/80 pb-2">
                  <div>
                    <span className="text-[10px] text-brass-300 uppercase tracking-wider block">{t('تذكرة الحجز الفوري', 'Booking Ticket')}</span>
                    <span className="font-mono font-extrabold text-sm text-white">{state.confirmedBookingRef}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] text-ink-300 block">{t('رقم الدور في العيادة', 'Clinic Queue')}</span>
                    <span className="font-mono font-extrabold text-base text-brass-300 bg-brass-500/20 px-2 py-0.5 rounded-lg border border-brass-400/30">
                      {state.confirmedQueueTicket}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-ink-400 text-[11px] block">{t('المريض:', 'Patient:')}</span>
                    <span className="font-bold text-white truncate block">{state.patientName}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 text-[11px] block">{t('الطبيب / التخصص:', 'Doctor / Specialty:')}</span>
                    <span className="font-bold text-brass-300 truncate block">
                      {state.activeDoctorObj ? (lang === 'ar' ? state.activeDoctorObj.nameAr : state.activeDoctorObj.nameEn) : state.activeSpecialtyObj?.titleAr || 'عام'}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-400 text-[11px] block">{t('البريد المعتمد للتقرير:', 'Report Email:')}</span>
                    <span className="font-medium text-ink-300 text-[11px] truncate block" dir="ltr">{state.patientEmail}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 text-[11px] block">{t('الفترة:', 'Slot:')}</span>
                    <span className="font-bold text-white text-[11px] block">
                      {state.preferredSlot === 'morning' ? t('الصباحية (9ص - 2ظ)', 'Morning (9AM-2PM)') : t('المسائية (4ع - 9م)', 'Evening (4PM-9PM)')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  id="btn-modal-open-portal"
                  onClick={() => {
                    onClose();
                    openPatientPortal('appointments');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-pine-700 hover:bg-pine-800 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <FolderLock className="w-4 h-4 text-pine-200" />
                  <span>{t('عرض الموعد في بوابتي الطبية', 'View in My Medical Portal')}</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0B3D33] text-white text-xs font-bold hover:bg-ink-700 transition-colors cursor-pointer"
                >
                  {t('تم، إغلاق النافذة', 'Done, Close Window')}
                </button>
                
                <a
                  href={HOSPITAL_CONTACTS.spitarUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-ink-300 text-ink-700 text-xs font-bold hover:bg-bone-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{t('منصة سبيتار', 'Spitar App')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Top Banner: Patient Status & Quick Sign-in Toggle */}
              {currentPatient ? (
                <div className="bg-gradient-to-r from-pine-50/90 via-pine-50/80 to-pine-50/90 border border-pine-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-[#0B3D33] text-brass-300 flex items-center justify-center text-lg font-extrabold shadow-xs flex-shrink-0">
                      {currentPatient.fullNameAr?.charAt(0) || '?'}
                    </div>
                    <div className="space-y-0.5 min-w-0">
                      <p className="font-extrabold text-pine-950 truncate">{currentPatient.fullNameAr}</p>
                      <p className="text-[11px] text-pine-700 truncate">{currentPatient.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleAutoFillProfile}
                      className="px-3 py-2 rounded-xl bg-pine-700 hover:bg-pine-800 text-white text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>{t('ملفي الطبي', 'My Profile')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="px-3 py-2 rounded-xl bg-white hover:bg-bone-100 border border-ink-300 text-ink-700 text-[11px] font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('خروج', 'Logout')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-bone-50 border border-pine-200 rounded-2xl p-4 flex items-center gap-3 text-xs">
                  <div className="w-10 h-10 rounded-full bg-pine-100 text-pine-700 flex items-center justify-center flex-shrink-0">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <p className="text-ink-600 leading-relaxed">
                    {t(
                      'تسجيل فوري بدون حساب — بياناتك تُحفظ محلياً على هذا الجهاز فقط.',
                      'Quick registration without an account — your data stays on this device only.'
                    )}
                  </p>
                </div>
              )}

              {/* Booking Form */}
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                
                {/* SECTION 1: PATIENT INFORMATION */}
                <FormSection number={1} title={t('بيانات المريض الأساسية', 'Patient Information')} badge={currentPatient ? t('من ملفك المحلي', 'From your local profile') : t('تسجيل فوري للموعد', 'Direct Registration')}>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('اسم المريض رباعي *', 'Patient Full Name *')}
                      </label>
                      <input
                        id="modal-patient-name"
                        type="text"
                        required
                        value={state.patientName}
                        onChange={(e) => state.setPatientName(e.target.value)}
                        placeholder={t('مثال: علي مفتاح سالم البرعصي', 'e.g., Ali Moftah Salem')}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden text-ink-900 font-medium"
                      />
                    </div>

                    <div className="sm:col-span-5">
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('رقم الهاتف / الواتساب *', 'Phone / WhatsApp *')}
                      </label>
                      <input
                        id="modal-patient-phone"
                        type="tel"
                        required
                        value={state.patientPhone}
                        onChange={(e) => state.setPatientPhone(e.target.value)}
                        placeholder="091 234 5678"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden text-ink-900 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('البريد الإلكتروني للتقارير *', 'Email for Medical Reports *')}
                      </label>
                      <input
                        id="modal-patient-email"
                        type="email"
                        required
                        value={state.patientEmail}
                        onChange={(e) => state.setPatientEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden text-ink-900 font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <FormSelect
                        id="modal-gender-select"
                        label={t('الجنس *', 'Gender *')}
                        value={state.gender}
                        onChange={(v) => state.setGender(v as 'male' | 'female')}
                        options={GENDER_OPTIONS}
                        lang={lang}
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <FormSelect
                        id="modal-age-select"
                        label={t('الفئة العمرية *', 'Age Group *')}
                        value={state.ageGroup}
                        onChange={(v) => state.setAgeGroup(v as 'child' | 'adult' | 'senior')}
                        options={AGE_GROUP_OPTIONS}
                        lang={lang}
                      />
                    </div>
                  </div>

                  {!currentPatient && (
                    <p className="text-[11px] text-ink-500 bg-white border border-pine-200 rounded-xl p-3 flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-pine-700 mt-0.5 flex-shrink-0" />
                      <span>{t('يُسجَّل طلب الحجز في خادم المستشفى، ويؤكد موظف الاستقبال الموعد عبر الواتساب.', 'Your booking request is recorded on the hospital server; reception confirms the slot via WhatsApp.')}</span>
                    </p>
                  )}
                </FormSection>

                {/* SECTION 2: CLINICAL TRIAGE */}
                <FormSection number={2} title={t('سبب الزيارة ونوع الاستشارة الطبية', 'Reason for Visit & Clinical Triage')} badge={t('تحديد التخصص تلقائياً', 'Auto-selects Specialty')}>
                  {state.activeSpecialtyObj?.intakeSchema ? (
                    <IntakeFormRenderer
                      fields={state.activeSpecialtyObj.intakeSchema}
                      values={state.intakeData}
                      onChange={(fieldId, value) =>
                        state.setIntakeData({ ...state.intakeData, [fieldId]: value })
                      }
                      lang={lang}
                    />
                  ) : (
                    <>
                      <FormSelect
                        id="modal-condition-select"
                        label={t('اختر سبب الزيارة أو الشكوى الطبية *', 'Select Reason for Visit or Complaint *')}
                        value={state.selectedCondition}
                        onChange={(v) => {
                          const found = PATIENT_CONDITIONS.find((c) => c.id === v);
                          if (found) {
                            state.handleConditionSelect(found);
                          } else {
                            state.setSelectedCondition(v);
                          }
                        }}
                        options={PATIENT_CONDITIONS.map((c) => ({ id: c.id, labelAr: `${c.icon} ${c.labelAr}${c.badgeAr ? ` (${c.badgeAr})` : ''}`, labelEn: `${c.icon} ${c.labelEn}${c.badgeEn ? ` (${c.badgeEn})` : ''}` }))}
                        lang={lang}
                        icon={<Activity className="w-3.5 h-3.5 text-pine-700" />}
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormSelect
                          id="modal-eye-select"
                          label={t('العين المصابة أو موضع الفحص *', 'Affected Eye *')}
                          value={state.affectedEye}
                          onChange={(v) => state.setAffectedEye(v as 'both' | 'right' | 'left')}
                          options={AFFECTED_EYE_OPTIONS}
                          lang={lang}
                          icon={<Eye className="w-3.5 h-3.5 text-pine-700" />}
                        />
                        <FormSelect
                          id="modal-duration-select"
                          label={t('مدة وبداية الأعراض *', 'Symptom Duration / Onset *')}
                          value={state.symptomDuration}
                          onChange={(v) => state.setSymptomDuration(v as 'recent' | 'gradual' | 'chronic')}
                          options={SYMPTOM_DURATION_OPTIONS}
                          lang={lang}
                        />
                      </div>
                    </>
                  )}
                </FormSection>

                {/* SECTION 3: SPECIALTY, DOCTOR & SCHEDULE */}
                <FormSection number={3} title={t('التخصص الطبي، الطبيب وموعد الزيارة', 'Specialty, Doctor & Schedule')}>
                  {/* Doctor Category Toggle */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-ink-700">
                        {t('فئة الطبيب المعالج *', 'Doctor Category *')}
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pine-200/70 text-ink-700">
                        {state.doctorTrack === 'visiting' ? t('نخبة أساتذة مصر 🇪🇬', 'Visiting Professors') : t('طاقم بنغازي المقيم 🇱🇾', 'Resident Local Staff')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        id="modal-track-visiting"
                        onClick={() => {
                          state.setDoctorTrack('visiting');
                          state.setSelectedDoctor('');
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border text-center cursor-pointer ${
                          state.doctorTrack === 'visiting'
                            ? 'bg-gradient-to-r from-brass-500 to-brass-600 text-white border-brass-600 shadow-sm ring-2 ring-brass-400/30'
                            : 'bg-white hover:bg-bone-100 text-ink-700 border-ink-300'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-xs font-extrabold">
                          <span>⭐</span>
                          <span>{t('استشاري زائر', 'Visiting Consultant')}</span>
                        </span>
                        <span className="text-[11px] font-medium opacity-90">
                          {t('أساتذة كليات طب مصر 🇪🇬', 'Egyptian Faculty & Professors')}
                        </span>
                      </button>

                      <button
                        type="button"
                        id="modal-track-local"
                        onClick={() => {
                          state.setDoctorTrack('local');
                          state.setSelectedDoctor('');
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border text-center cursor-pointer ${
                          state.doctorTrack === 'local'
                            ? 'bg-gradient-to-r from-pine-700 to-[#0B3D33] text-white border-pine-800 shadow-sm ring-2 ring-brass-400/30'
                            : 'bg-white hover:bg-bone-100 text-ink-700 border-ink-300'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 text-xs font-extrabold">
                          <span>🏥</span>
                          <span>{t('طبيب / استشاري محلي', 'Local Consultant')}</span>
                        </span>
                        <span className="text-[11px] font-medium opacity-90">
                          {t('طاقم بنغازي المقيم 🇱🇾', 'Local Benghazi Team')}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Specialty & Doctor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <FormSelect
                      id="modal-specialty-select"
                      label={t('التخصص الطبي أو الجراحي *', 'Clinical Specialty *')}
                      value={state.selectedSpecialty}
                      onChange={(v) => {
                        state.setSelectedSpecialty(v);
                        state.setSelectedDoctor('');
                      }}
                      options={specialties.map((s) => ({ id: s.id, labelAr: s.titleAr, labelEn: s.titleEn }))}
                      lang={lang}
                    />
                    <FormSelect
                      id="modal-doctor-select"
                      label={state.doctorTrack === 'visiting' ? t('الاستشاري الزائر المطلوب (مصر 🇪🇬)', 'Visiting Consultant (Egypt 🇪🇬)') : t('الطبيب المحلي المطلوب (بنغازي 🇱🇾)', 'Local Resident Doctor (Benghazi 🇱🇾)')}
                      value={state.selectedDoctor}
                      onChange={(v) => state.setSelectedDoctor(v)}
                      options={[
                        { id: '', labelAr: state.doctorTrack === 'visiting' ? '⭐ أي استشاري زائر متاح' : '🏥 أي طبيب محلي متاح', labelEn: state.doctorTrack === 'visiting' ? '⭐ Any visiting consultant' : '🏥 Any local consultant' },
                        ...state.availableDoctors.map((d) => ({ id: d.id, labelAr: `${d.nameAr} — ${d.titleAr}`, labelEn: `${d.nameEn} — ${d.titleEn}` })),
                      ]}
                      lang={lang}
                    />
                  </div>

                  {/* Date & Time Slot */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('التاريخ المقترح للزيارة', 'Preferred Appointment Date')}
                      </label>
                      <input
                        id="modal-date-input"
                        type="date"
                        value={state.preferredDate}
                        onChange={(e) => state.setPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden text-ink-900 font-medium"
                      />
                    </div>
                    <FormSelect
                      id="modal-time-slot-select"
                      label={t('الفترة المفضلة للكشف', 'Preferred Time Slot')}
                      value={state.preferredSlot}
                      onChange={(v) => state.setPreferredSlot(v as 'morning' | 'evening')}
                      options={[
                        { id: 'morning', labelAr: '☀️ الفترة الصباحية (9:00 ص - 2:00 ظ)', labelEn: '☀️ Morning Slot (9:00 AM - 2:00 PM)' },
                        { id: 'evening', labelAr: '🌙 الفترة المسائية (4:00 ع - 9:00 م)', labelEn: '🌙 Evening Slot (4:00 PM - 9:00 PM)' },
                      ]}
                      lang={lang}
                    />
                  </div>
                </FormSection>

                {/* SECTION 4: NOTES & SUBMIT */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-1">
                      {t('تفاصيل إضافية أو ملاحظات تود إرفاقها (اختياري)', 'Additional Details or Notes (Optional)')}
                    </label>
                    <textarea
                      id="modal-patient-notes"
                      rows={2}
                      value={state.notes}
                      onChange={(e) => state.setNotes(e.target.value)}
                      placeholder={t('مثال: مريض سكر منذ 10 سنوات، تم إجراء عملية ليزك سابقة، ارتداء نظارة طبية...', 'e.g., Diabetic for 10 years, previous LASIK, wears glasses...')}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-bone-50 border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden text-ink-900"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <button
                      id="btn-modal-confirm-booking"
                      type="submit"
                      className="w-full py-3.5 px-4 rounded-xl font-extrabold text-white bg-pine-900 hover:bg-pine-700 transition-all flex items-center justify-center gap-2 text-sm sm:text-base shadow-lg shadow-pine-950/20 cursor-pointer transform hover:-translate-y-0.5"
                    >
                      <Calendar className="w-5 h-5 text-brass-300" />
                      <span>{t('تأكيد الحجز الفوري وإرسال الطلب عبر الواتساب', 'Confirm Instant Booking & Send via WhatsApp')}</span>
                    </button>

                    <div className="flex items-center justify-between text-[11px] text-ink-500 px-1">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-pine-700" />
                        {t('بياناتك تُحفظ محلياً على هذا الجهاز فقط', 'Your data stays on this device only')}
                      </span>
                      <span className="font-semibold text-pine-800">
                        {t('تجهيز رسالة واتساب جاهزة للإرسال', 'Pre-filled WhatsApp draft ready')}
                      </span>
                    </div>
                  </div>
                </div>

              </form>
            </div>
          )}
        </div>
    </Modal>
  );
}
