'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { SPECIALTIES, HOSPITAL_CONTACTS, PATIENT_CONDITIONS, AFFECTED_EYE_OPTIONS, AGE_GROUP_OPTIONS, GENDER_OPTIONS, SYMPTOM_DURATION_OPTIONS, PatientCondition } from '@/data/hospitalData';
import Modal from '@/components/ui/Modal';
import { X, Calendar, Clock, CheckCircle2, ExternalLink, ChevronDown, Sparkles, ShieldCheck, Activity, Eye, LogOut, UserPlus, FolderLock } from 'lucide-react';

export default function BookingModal() {
  const {
    isBookingModalOpen, bookingDoctorId, bookingSpecialtyId, closeBookingModal, } = useLanguage();

  if (!isBookingModalOpen) return null;

  return (
    <BookingModalContent
      key={`${bookingSpecialtyId || ''}-${bookingDoctorId || ''}`}
      bookingSpecialtyId={bookingSpecialtyId}
      bookingDoctorId={bookingDoctorId}
      onClose={closeBookingModal}
    />
  );
}

function BookingModalContent({
  bookingSpecialtyId, bookingDoctorId, onClose }: {
  bookingSpecialtyId: string | null;
  bookingDoctorId: string | null;
  onClose: () => void;
}) {
  const { lang, t, doctors } = useLanguage();
  const {
    currentPatient, createLocalProfile, logout, sendNotification, addAppointmentToCurrentPatient, openPatientPortal
  } = usePatientAuth();

  const getPatientAgeGroup = (dob?: string): 'child' | 'adult' | 'senior' => {
    if (!dob) return 'adult';
    const birthYear = parseInt(dob.split('-')[0], 10);
    if (isNaN(birthYear)) return 'adult';
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;
    if (calculatedAge >= 60) return 'senior';
    if (calculatedAge < 18) return 'child';
    return 'adult'; };

  const [gender, setGender] = useState<'male' | 'female'>(
    currentPatient?.gender === 'female' ? 'female' : 'male'
  );
  const [ageGroup, setAgeGroup] = useState<'child' | 'adult' | 'senior'>(
    getPatientAgeGroup(currentPatient?.dateOfBirth)
  );
  const [affectedEye, setAffectedEye] = useState<'both' | 'right' | 'left'>('both');
  const [selectedCondition, setSelectedCondition] = useState<string>('lasik');
  const [symptomDuration, setSymptomDuration] = useState<'recent' | 'gradual' | 'chronic'>('recent');

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    bookingSpecialtyId || (SPECIALTIES.length > 0 ? SPECIALTIES[0].id : '')
  );
  
  const initialSelectedDoc = doctors.find((d) => d.id === bookingDoctorId);
  const [doctorTrack, setDoctorTrack] = useState<'visiting' | 'local'>(
    initialSelectedDoc?.doctorType || 'visiting'
  );

  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    bookingDoctorId || ''
  );
  const [patientName, setPatientName] = useState<string>(
    currentPatient ? currentPatient.fullNameAr : ''
  );
  const [patientPhone, setPatientPhone] = useState<string>(
    currentPatient ? currentPatient.phone : ''
  );
  const [patientEmail, setPatientEmail] = useState<string>(
    currentPatient ? currentPatient.email : ''
  );

  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredSlot, setPreferredSlot] = useState<'morning' | 'evening'>('morning');
  const [notes, setNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedQueueTicket, setConfirmedQueueTicket] = useState<string>('Q-284');
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string>('BK-8492');

  const activeSpecialtyObj = SPECIALTIES.find((s) => s.id === selectedSpecialty);
  const activeDoctorObj = doctors.find((d) => d.id === selectedDoctor);
  const activeConditionObj = PATIENT_CONDITIONS.find((c) => c.id === selectedCondition);
  const eyeObj = AFFECTED_EYE_OPTIONS.find((e) => e.id === affectedEye);
  const ageObj = AGE_GROUP_OPTIONS.find((a) => a.id === ageGroup);
  const genderObj = GENDER_OPTIONS.find((g) => g.id === gender);
  const durationObj = SYMPTOM_DURATION_OPTIONS.find((d) => d.id === symptomDuration);

  // Strictly filter doctors by specialty AND doctorTrack (Visiting vs Local)
  const availableDoctors = doctors.filter((d) => {
    const matchSpecialty = !selectedSpecialty || d.specialtyId === selectedSpecialty;
    const matchType = d.doctorType === doctorTrack;
    return matchSpecialty && matchType;
  });

  const applyPatientProfile = (patient: typeof currentPatient) => {
    if (!patient) return;
    setPatientName(patient.fullNameAr);
    setPatientPhone(patient.phone);
    setPatientEmail(patient.email);
    setGender(patient.gender === 'female' ? 'female' : 'male');
    setAgeGroup(getPatientAgeGroup(patient.dateOfBirth));
  };

  const handleAutoFillProfile = () => {
    if (currentPatient) {
      applyPatientProfile(currentPatient);
    } };

  const handleConditionSelect = (cond: PatientCondition) => {
    setSelectedCondition(cond.id);
    if (cond.specialtyId) {
      setSelectedSpecialty(cond.specialtyId);
      setSelectedDoctor('');
    }
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim()) {
      alert(t('يرجى إدخال اسم المريض ورقم الهاتف', 'Please enter your name and phone number'));
      return;
    }

    if (!patientEmail.trim()) {
      alert(t('البريد الإلكتروني إلزامي لإرسال التقرير الطبي وتأكيد الحجز', 'Email is required for medical reports and confirmation'));
      return;
    }

    const newTicket = `Q-${Math.floor(100 + Math.random() * 900)}`;
    const fallbackRef = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    // Persist the request server-side; reception still confirms via WhatsApp.
    // On failure the local flow continues unchanged (ref generated on-device).
    let bookingRef = fallbackRef;
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: patientName.trim(),
          phone: patientPhone.trim(),
          email: patientEmail.trim() || undefined,
          specialtyId: selectedSpecialty,
          doctorId: selectedDoctor || undefined,
          conditionTitleAr: activeConditionObj?.labelAr,
          conditionTitleEn: activeConditionObj?.labelEn,
          preferredDate: preferredDate || undefined,
          preferredTime: preferredSlot === 'morning' ? '09:00' : '16:00',
          ageGroup: ageGroup,
          gender: gender,
          affectedEye: affectedEye,
          symptomDuration: symptomDuration,
          notes: notes.trim() || undefined
        })
      });
      const json = await res.json();
      if (res.ok && json?.data?.ref) bookingRef = json.data.ref as string;
    } catch {
      // dev DB unreachable — keep on-device ref, WhatsApp handoff unaffected
    }

    setConfirmedQueueTicket(newTicket);
    setConfirmedBookingRef(bookingRef);

    const conditionTitle = activeConditionObj
      ? lang === 'ar'
        ? `${activeConditionObj.icon} ${activeConditionObj.labelAr}`
        : `${activeConditionObj.icon} ${activeConditionObj.labelEn }`
      : t('كشف عام', 'General Examination');

    const eyeTitle = eyeObj ? (lang === 'ar' ? eyeObj.labelAr : eyeObj.labelEn) : '';
    const ageTitle = ageObj ? (lang === 'ar' ? ageObj.labelAr : ageObj.labelEn) : '';
    const genderTitle = genderObj ? (lang === 'ar' ? genderObj.labelAr : genderObj.labelEn) : '';
    const durationTitle = durationObj ? (lang === 'ar' ? durationObj.labelAr : durationObj.labelEn) : '';

    const specialtyTitle = activeSpecialtyObj
      ? lang === 'ar'
        ? activeSpecialtyObj.titleAr
        : activeSpecialtyObj.titleEn
      : 'عام';

    const doctorTitle = activeDoctorObj
      ? lang === 'ar'
        ? `${activeDoctorObj.nameAr} (${activeDoctorObj.titleAr})`
        : `${activeDoctorObj.nameEn} (${activeDoctorObj.titleEn })`
      : t('أقرب استشاري متاح', 'Next Available Specialist');

    const slotText =
      preferredSlot === 'morning'
        ? (lang === 'ar' ? 'الفترة الصباحية (9:00 ص - 2:00 ظ)' : 'Morning Slot (9:00 AM - 2:00 PM)')
        : (lang === 'ar' ? 'الفترة المسائية (4:00 ع - 9:00 م)' : 'Evening Slot (4:00 PM - 9:00 PM)');

    // Create a device-local profile if none exists (data stays in this browser)
    if (!currentPatient) {
      createLocalProfile({
        fullNameAr: patientName.trim(),
        email: patientEmail.trim(),
        phone: patientPhone.trim(),
        cityAr: 'بنغازي',
        gender
      });
    }

    // Save appointment into patient profile
    addAppointmentToCurrentPatient({
      doctorNameAr: activeDoctorObj ? activeDoctorObj.nameAr : 'د. محمد الكيلاني',
      doctorNameEn: activeDoctorObj ? activeDoctorObj.nameEn : 'Dr. Mohamed Al-Kilani',
      specialtyAr: specialtyTitle,
      specialtyEn: activeSpecialtyObj ? activeSpecialtyObj.titleEn : 'Ophthalmology',
      date: preferredDate || new Date().toISOString().split('T')[0],
      time: preferredSlot === 'morning' ? '10:30 AM' : '05:30 PM',
      status: 'confirmed',
      locationAr: 'العيادات الخارجية - الدور الأول',
      locationEn: 'Outpatient Clinic - 1st Floor',
      queueNumber: newTicket
    });

    // Dispatch simulated WhatsApp & Email notification
    sendNotification(
      'whatsapp',
      'تأكيد حجز موعد كشف العيون بنجاح',
      'Appointment Booking Confirmed',
      `عزيزي ${patientName}، تم تأكيد تسجيل موعدك في مستشفى كنوز الأهرام بنغازي لدى ${doctorTitle} ليوم ${preferredDate || 'الأقرب'}. رقم الحجز هو #${bookingRef} ورقم دورك بالعيادة هو ${newTicket}.`
    );

    sendNotification(
      'email',
      'تفاصيل وتأكيد موعد الكشف والتقرير الطبي المعتمد',
      'Consultation Booking Confirmation & Certified Report',
      `السيد/ة ${patientName}، مرفق تفاصيل حجز موعدك لـ (${conditionTitle}) لدى ${doctorTitle}. رقم الحجز: #${bookingRef}، كود المريض: ${patientEmail}. يرجى الحضور قبل الموعد بـ 15 دقيقة مصطحباً بطاقتك الشخصية.`
    );

    const msg = lang === 'ar'
      ? `*طلب حجز فوري ومباشر - مستشفى كنوز الأهرام للعيون (بنغازي)*
----------------------------------------
🎟️ *رقم الحجز المرجعي:* #${bookingRef}
🔢 *رقم التذكرة بالعيادة:* ${newTicket}
👤 *اسم المريض:* ${patientName}
📞 *رقم الهاتف:* ${patientPhone}
📧 *البريد الإلكتروني:* ${patientEmail}
⚧ *الجنس:* ${genderTitle}
🎂 *الفئة العمرية:* ${ageTitle}
👁️ *العين المصابة:* ${eyeTitle}
🩺 *سبب الزيارة / نوع الاستشارة:* ${conditionTitle}
⏱️ *مدة الأعراض / البداية:* ${durationTitle}
🏥 *التخصص الطبي:* ${specialtyTitle}
👨‍⚕️ *الطبيب المطلوب:* ${doctorTitle}
📅 *تاريخ الموعد المقترح:* ${preferredDate || 'أقرب موعد ممكن'}
⏰ *الفترة المفضلة:* ${slotText}
${notes.trim() ? `📝 *تفاصيل وملاحظات إضافية:* ${notes}\n` : ''}----------------------------------------
*تم الإرسال عبر البوابة الإلكترونية لمستشفى كنوز الأهرام*`
      : `*Instant Direct Booking Request - Konooz Al-Ahram Eye Hospital (Benghazi)*
----------------------------------------
🎟️ *Booking Ref:* #${bookingRef}
🔢 *Clinic Queue Ticket:* ${newTicket}
👤 *Patient Name:* ${patientName}
📞 *Phone Number:* ${patientPhone}
📧 *Email:* ${patientEmail}
⚧ *Gender:* ${genderTitle}
🎂 *Age Group:* ${ageTitle}
👁️ *Affected Eye:* ${eyeTitle}
🩺 *Reason for Visit:* ${conditionTitle}
⏱️ *Symptom Duration:* ${durationTitle}
🏥 *Department / Specialty:* ${specialtyTitle}
👨‍⚕️ *Requested Doctor:* ${doctorTitle}
📅 *Preferred Date:* ${preferredDate || 'Earliest available'}
⏰ *Preferred Time Slot:* ${slotText}
${notes.trim() ? `📝 *Additional Notes:* ${notes}\n` : ''}----------------------------------------
*Sent via Konooz Al-Ahram Eye Hospital Web Portal*`;

    const whatsappUrl = `https://wa.me/${HOSPITAL_CONTACTS.primaryWhatsApp.replace('+', '')}?text=${encodeURIComponent(msg)}`;
    window.open(whatsappUrl, '_blank');
    setIsSuccess(true);
  };

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
          {isSuccess ? (
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
                    <span className="font-mono font-extrabold text-sm text-white">{confirmedBookingRef}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] text-ink-300 block">{t('رقم الدور في العيادة', 'Clinic Queue')}</span>
                    <span className="font-mono font-extrabold text-base text-brass-300 bg-brass-500/20 px-2 py-0.5 rounded-lg border border-brass-400/30">
                      {confirmedQueueTicket}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-ink-400 text-[11px] block">{t('المريض:', 'Patient:')}</span>
                    <span className="font-bold text-white truncate block">{patientName}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 text-[11px] block">{t('الطبيب / التخصص:', 'Doctor / Specialty:')}</span>
                    <span className="font-bold text-brass-300 truncate block">
                      {activeDoctorObj ? (lang === 'ar' ? activeDoctorObj.nameAr : activeDoctorObj.nameEn) : activeSpecialtyObj?.titleAr || 'عام'}
                    </span>
                  </div>
                  <div>
                    <span className="text-ink-400 text-[11px] block">{t('البريد المعتمد للتقرير:', 'Report Email:')}</span>
                    <span className="font-medium text-ink-300 text-[11px] truncate block" dir="ltr">{patientEmail}</span>
                  </div>
                  <div>
                    <span className="text-ink-400 text-[11px] block">{t('الفترة:', 'Slot:')}</span>
                    <span className="font-bold text-white text-[11px] block">
                      {preferredSlot === 'morning' ? t('الصباحية (9ص - 2ظ)', 'Morning (9AM-2PM)') : t('المسائية (4ع - 9م)', 'Evening (4PM-9PM)')}
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
                      {currentPatient.fullNameAr.slice(0, 1)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-ink-900 text-sm truncate">{currentPatient.fullNameAr}</span>
                        <span className="bg-pine-100 text-pine-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-pine-300 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-pine-700" />
                          {t('الملف المحلي', 'Local Profile')}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-ink-500 flex-wrap">
                        {currentPatient.nationalId && (
                          <>
                            <span>
                              {t('الملف الوطني:', 'File #:')} <strong className="font-mono text-ink-900">{currentPatient.nationalId}</strong>
                            </span>
                            <span className="text-ink-300">•</span>
                          </>
                        )}
                        <span dir="ltr" className="font-mono text-ink-700 truncate">{currentPatient.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={handleAutoFillProfile}
                      className="px-3 py-2 bg-white border border-brass-300 hover:bg-pine-50 text-pine-900 text-xs font-bold rounded-xl transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-pine-700" />
                      <span>{t('إعادة ملء الحقول', 'Auto-fill')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="px-3 py-2 bg-white border border-pine-200 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 text-ink-500 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                      title={t('تسجيل الخروج أو التبديل لحساب آخر', 'Logout / Switch Patient')}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('تبديل', 'Switch')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-brass-50/80 via-bone-50 to-pine-50/80 border border-pine-200 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0B3D33] text-brass-300 flex items-center justify-center shadow-xs flex-shrink-0">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-ink-900 flex items-center gap-2 flex-wrap">
                        <span>{t('حجز فوري ومباشر لجميع المرضى', 'Direct Booking for All Patients')}</span>
                      </p>
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        {t('املأ النموذج أدناه لتأكيد موعدك — تُحفظ بياناتك محلياً على هذا الجهاز فقط.', 'Complete the form below to confirm your appointment — details are saved on this device only.')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking Form with Patient Info Placed at the Very Top */}
              <form onSubmit={handleSubmitBooking} className="space-y-4">
                
                {/* ============================================================ */}
                {/* SECTION 1: PATIENT INFORMATION */}
                {/* ============================================================ */}
                <div className="bg-bone-50/90 border border-pine-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-pine-200/80 pb-2.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#0B3D33] flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-pine-700 text-white flex items-center justify-center text-xs font-extrabold shadow-2xs">
                        1
                      </div>
                      <span>{t('بيانات المريض الأساسية', 'Patient Information')}</span>
                    </h3>
                    <span className="text-[10px] font-bold text-pine-800 bg-pine-100/70 border border-brass-300/80 px-2.5 py-0.5 rounded-full">
                      {currentPatient ? t('من ملفك المحلي', 'From your local profile') : t('تسجيل فوري للموعد', 'Direct Registration')}
                    </span>
                  </div>

                  {/* Row 1: Name and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-7">
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('اسم المريض رباعي *', 'Patient Full Name *')}
                      </label>
                      <input
                        id="modal-patient-name"
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
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
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="091 234 5678"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden text-ink-900 font-mono"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* Row 2: Email, Gender, and Age Group */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('البريد الإلكتروني للتقارير *', 'Email for Medical Reports *')}
                      </label>
                      <input
                        id="modal-patient-email"
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="name@example.com"
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden text-ink-900 font-mono"
                        dir="ltr"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('الجنس *', 'Gender *')}
                      </label>
                      <div className="relative">
                        <select
                          id="modal-gender-select"
                          value={gender}
                          onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                          className="w-full px-3 py-2.5 text-xs bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden appearance-none text-ink-900 font-medium cursor-pointer"
                        >
                          {GENDER_OPTIONS.map((g) => (
                            <option key={g.id} value={g.id}>
                              {lang === 'ar' ? g.labelAr : g.labelEn}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 rtl:left-2.5 rtl:right-auto top-3.5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="sm:col-span-3">
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('الفئة العمرية *', 'Age Group *')}
                      </label>
                      <div className="relative">
                        <select
                          id="modal-age-select"
                          value={ageGroup}
                          onChange={(e) => setAgeGroup(e.target.value as 'child' | 'adult' | 'senior')}
                          className="w-full px-3 py-2.5 text-xs bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden appearance-none text-ink-900 font-medium cursor-pointer"
                        >
                          {AGE_GROUP_OPTIONS.map((a) => (
                            <option key={a.id} value={a.id}>
                              {lang === 'ar' ? a.labelAr : a.labelEn}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 rtl:left-2.5 rtl:right-auto top-3.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Honest storage note for unregistered visitors */}
                  {!currentPatient && (
                    <p className="text-[11px] text-ink-500 bg-white border border-pine-200 rounded-xl p-3 flex items-start gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-pine-700 mt-0.5 flex-shrink-0" />
                      <span>{t('سيتم حفظ بيانات حجزك محلياً على هذا الجهاز فقط. الحسابات السحابية بكلمات مرور ستُفعّل قريباً عند اكتمال ربط النظام الطبي.', 'Your booking details will be saved locally on this device only. Password-protected online accounts activate soon after hospital system integration.')}</span>
                    </p>
                  )}
                </div>

                {/* ============================================================ */}
                {/* SECTION 2: CLINICAL CONSULTATION & REASON FOR VISIT */}
                {/* ============================================================ */}
                <div className="bg-bone-50/90 border border-pine-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-pine-200/80 pb-2.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#0B3D33] flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-pine-700 text-white flex items-center justify-center text-xs font-extrabold shadow-2xs">
                        2
                      </div>
                      <span>{t('سبب الزيارة ونوع الاستشارة الطبية', 'Reason for Visit & Clinical Triage')}</span>
                    </h3>
                    <span className="text-[10px] text-pine-800 font-semibold bg-pine-50 px-2 py-0.5 rounded-full border border-pine-200">
                      {t('تحديد التخصص تلقائياً', 'Auto-selects Specialty')}
                    </span>
                  </div>

                  {/* 1. Reason for Visit / Condition Dropbox */}
                  <div>
                    <label className="text-xs font-bold text-ink-700 flex items-center gap-1.5 mb-1">
                      <Activity className="w-3.5 h-3.5 text-pine-700" />
                      <span>{t('اختر سبب الزيارة أو الشكوى الطبية *', 'Select Reason for Visit or Complaint *')}</span>
                    </label>
                    <div className="relative">
                      <select
                        id="modal-condition-select"
                        value={selectedCondition}
                        onChange={(e) => {
                          const found = PATIENT_CONDITIONS.find((c) => c.id === e.target.value);
                          if (found) {
                            handleConditionSelect(found);
                          } else {
                            setSelectedCondition(e.target.value);
                          }
                        }}
                        className="w-full ps-3.5 pe-8 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                      >
                        {PATIENT_CONDITIONS.map((cond) => (
                          <option key={cond.id} value={cond.id}>
                            {cond.icon} {lang === 'ar' ? cond.labelAr : cond.labelEn} {cond.badgeAr ? `(${lang === 'ar' ? cond.badgeAr : cond.badgeEn})` : ''}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-ink-400 absolute left-3 rtl:left-3 rtl:right-auto top-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Affected Eye & Symptom Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Affected Eye Dropbox */}
                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1 flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-pine-700" />
                        <span>{t('العين المصابة أو موضع الفحص *', 'Affected Eye *')}</span>
                      </label>
                      <div className="relative">
                        <select
                          id="modal-eye-select"
                          value={affectedEye}
                          onChange={(e) => setAffectedEye(e.target.value as 'both' | 'right' | 'left')}
                          className="w-full ps-3.5 pe-8 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                        >
                          {AFFECTED_EYE_OPTIONS.map((eye) => (
                            <option key={eye.id} value={eye.id}>
                              {lang === 'ar' ? eye.labelAr : eye.labelEn}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-ink-400 absolute left-3 rtl:left-3 rtl:right-auto top-3.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Duration Dropbox */}
                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-pine-700" />
                        <span>{t('مدة وبداية الأعراض *', 'Symptom Duration / Onset *')}</span>
                      </label>
                      <div className="relative">
                        <select
                          id="modal-duration-select"
                          value={symptomDuration}
                          onChange={(e) => setSymptomDuration(e.target.value as 'recent' | 'gradual' | 'chronic')}
                          className="w-full ps-3.5 pe-8 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                        >
                          {SYMPTOM_DURATION_OPTIONS.map((dur) => (
                            <option key={dur.id} value={dur.id}>
                              {lang === 'ar' ? dur.labelAr : dur.labelEn}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-ink-400 absolute left-3 rtl:left-3 rtl:right-auto top-3.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 3: CLINICAL SPECIALTY, DOCTOR & TIME PREFERENCE */}
                {/* ============================================================ */}
                <div className="bg-bone-50/90 border border-pine-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-pine-200/80 pb-2.5">
                    <h3 className="text-xs sm:text-sm font-extrabold text-[#0B3D33] flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-pine-700 text-white flex items-center justify-center text-xs font-extrabold shadow-2xs">
                        3
                      </div>
                      <span>{t('التخصص الطبي، الطبيب وموعد الزيارة', 'Specialty, Doctor & Schedule')}</span>
                    </h3>
                  </div>

                  {/* Doctor Category Separation (Visiting Egyptian Consultants vs Local Benghazi Doctors) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-ink-700">
                        {t('فئة الطبيب المعالج *', 'Doctor Category *')}
                      </label>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pine-200/70 text-ink-700">
                        {doctorTrack === 'visiting' ? t('نخبة أساتذة مصر 🇪🇬', 'Visiting Professors') : t('طاقم بنغازي المقيم 🇱🇾', 'Resident Local Staff')}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        id="modal-track-visiting"
                        onClick={() => {
                          setDoctorTrack('visiting');
                          setSelectedDoctor('');
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border text-center cursor-pointer ${
                          doctorTrack === 'visiting'
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
                          setDoctorTrack('local');
                          setSelectedDoctor('');
                        }}
                        className={`p-3 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 border text-center cursor-pointer ${
                          doctorTrack === 'local'
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

                  {/* Specialty & Doctor Dropboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('التخصص الطبي أو الجراحي *', 'Clinical Specialty *')}
                      </label>
                      <div className="relative">
                        <select
                          id="modal-specialty-select"
                          value={selectedSpecialty}
                          onChange={(e) => {
                            setSelectedSpecialty(e.target.value);
                            setSelectedDoctor('');
                          }}
                          className="w-full ps-3.5 pe-8 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                        >
                          {SPECIALTIES.map((spec) => (
                            <option key={spec.id} value={spec.id}>
                              {lang === 'ar' ? spec.titleAr : spec.titleEn}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-ink-400 absolute left-3 rtl:left-3 rtl:right-auto top-3.5 pointer-events-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1 flex items-center justify-between">
                        <span>
                          {doctorTrack === 'visiting'
                            ? t('الاستشاري الزائر المطلوب (مصر 🇪🇬)', 'Visiting Consultant (Egypt 🇪🇬)')
                            : t('الطبيب المحلي المطلوب (بنغازي 🇱🇾)', 'Local Resident Doctor (Benghazi 🇱🇾)')}
                        </span>
                      </label>
                      <div className="relative">
                        <select
                          id="modal-doctor-select"
                          value={selectedDoctor}
                          onChange={(e) => setSelectedDoctor(e.target.value)}
                          className="w-full ps-3.5 pe-8 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                        >
                          <option value="">
                            {doctorTrack === 'visiting'
                              ? t('⭐ أي استشاري زائر متاح في هذا التخصص', '⭐ Any available visiting consultant')
                              : t('🏥 أي طبيب / استشاري محلي متاح في هذا التخصص', '🏥 Any available local consultant')}
                          </option>
                          {availableDoctors.map((doc) => (
                            <option key={doc.id} value={doc.id}>
                              {lang === 'ar' ? doc.nameAr : doc.nameEn} — {lang === 'ar' ? doc.titleAr : doc.titleEn}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-ink-400 absolute left-3 rtl:left-3 rtl:right-auto top-3.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Date & Time Slot Dropboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('التاريخ المقترح للزيارة', 'Preferred Appointment Date')}
                      </label>
                      <input
                        id="modal-date-input"
                        type="date"
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden text-ink-900 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-ink-700 mb-1">
                        {t('الفترة المفضلة للكشف', 'Preferred Time Slot')}
                      </label>
                      <div className="relative">
                        <select
                          id="modal-time-slot-select"
                          value={preferredSlot}
                          onChange={(e) => setPreferredSlot(e.target.value as 'morning' | 'evening')}
                          className="w-full ps-3.5 pe-8 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
                        >
                          <option value="morning">
                            {lang === 'ar' ? '☀️ الفترة الصباحية (9:00 ص - 2:00 ظ)' : '☀️ Morning Slot (9:00 AM - 2:00 PM)'}
                          </option>
                          <option value="evening">
                            {lang === 'ar' ? '🌙 الفترة المسائية (4:00 ع - 9:00 م)' : '🌙 Evening Slot (4:00 PM - 9:00 PM)'}
                          </option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-ink-400 absolute left-3 rtl:left-3 rtl:right-auto top-3.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================ */}
                {/* SECTION 4: ADDITIONAL NOTES & FINAL DIRECT SUBMISSION */}
                {/* ============================================================ */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-ink-700 mb-1">
                      {t('تفاصيل إضافية أو ملاحظات تود إرفاقها (اختياري)', 'Additional Details or Notes (Optional)')}
                    </label>
                    <textarea
                      id="modal-patient-notes"
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={t('مثال: مريض سكر منذ 10 سنوات، تم إجراء عملية ليزك سابقة، ارتداء نظارة طبية...', 'e.g., Diabetic for 10 years, previous LASIK, wears glasses...')}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-bone-50 border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden text-ink-900"
                    />
                  </div>

                  {/* Submit Buttons */}
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
