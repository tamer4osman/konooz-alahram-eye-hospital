import type { Language } from '@/context/LanguageContext';

// ---------------------------------------------------------------------------
// Parameter types — one interface per message builder
// ---------------------------------------------------------------------------

export interface HeroBookingParams {
  lang: Language;
  patientName: string;
  phone: string;
  email: string;
  genderTitle: string;
  ageTitle: string;
  eyeTitle: string;
  conditionTitle: string;
  durationTitle: string;
  symptomDetails?: string;
  specialtyTitle: string;
  doctorTitle: string;
  preferredDate: string;
  consultationType: 'consultant' | 'clinic';
}

export interface BookingModalParams {
  lang: Language;
  bookingRef: string;
  queueTicket: string;
  patientName: string;
  phone: string;
  email: string;
  genderTitle: string;
  ageTitle: string;
  eyeTitle: string;
  conditionTitle: string;
  durationTitle: string;
  specialtyTitle: string;
  doctorTitle: string;
  preferredDate: string;
  preferredSlot: 'morning' | 'evening';
  slotText: string;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const SEPARATOR = '----------------------------------------';

function optionalLine(
  label: string,
  value: string | undefined,
): string {
  const trimmed = value?.trim() ?? '';
  return trimmed ? `📝 *${label}:* ${trimmed}\n` : '';
}

// ---------------------------------------------------------------------------
// Hero booking message  (Hero.tsx → handleHeroSubmit)
// ---------------------------------------------------------------------------

export function buildHeroBookingMessage(p: HeroBookingParams): string {
  const lang = p.lang;
  const doctorFallback =
    lang === 'ar' ? 'أقرب استشاري متاح' : 'Next Available Consultant';
  const dateFallback =
    lang === 'ar' ? 'أقرب موعد ممكن' : 'As soon as possible';
  const consultLabel =
    p.consultationType === 'consultant'
      ? lang === 'ar'
        ? 'كشف استشاري زائر'
        : 'Visiting Consultant'
      : lang === 'ar'
        ? 'كشف عيادة عامة'
        : 'General Clinic';

  if (lang === 'ar') {
    return [
      `*طلب حجز موعد كشف فوري ومباشر - مستشفى كنوز الأهرام للعيون (بنغازي)*`,
      SEPARATOR,
      `👤 *اسم المريض:* ${p.patientName}`,
      `📞 *رقم الهاتف:* ${p.phone}`,
      `📧 *البريد الإلكتروني:* ${p.email}`,
      `⚧ *الجنس:* ${p.genderTitle}`,
      `🎂 *الفئة العمرية:* ${p.ageTitle}`,
      `👁️ *العين المصابة:* ${p.eyeTitle}`,
      `🩺 *سبب الزيارة / نوع الاستشارة:* ${p.conditionTitle}`,
      `⏱️ *مدة الأعراض / البداية:* ${p.durationTitle}`,
      optionalLine('تفاصيل وملاحظات إضافية', p.symptomDetails),
      `🏥 *القسم / التخصص:* ${p.specialtyTitle}`,
      `👨‍⚕️ *الطبيب المفضل:* ${p.doctorTitle || doctorFallback}`,
      `📅 *الموعد المفضل:* ${p.preferredDate || dateFallback}`,
      `🔍 *نوع الكشف:* ${consultLabel}`,
      SEPARATOR,
      `*تم الإرسال والربط بالملف الطبي الإلكتروني للمستشفى*`,
    ].join('\n');
  }

  return [
    `*Instant Appointment Booking Request - Konooz Al-Ahram Eye Hospital (Benghazi)*`,
    SEPARATOR,
    `👤 *Patient Name:* ${p.patientName}`,
    `📞 *Phone Number:* ${p.phone}`,
    `📧 *Email:* ${p.email}`,
    `⚧ *Gender:* ${p.genderTitle}`,
    `🎂 *Age Group:* ${p.ageTitle}`,
    `👁️ *Affected Eye:* ${p.eyeTitle}`,
    `🩺 *Reason for Visit:* ${p.conditionTitle}`,
    `⏱️ *Symptom Duration:* ${p.durationTitle}`,
    optionalLine('Additional Notes', p.symptomDetails),
    `🏥 *Department / Specialty:* ${p.specialtyTitle}`,
    `👨‍⚕️ *Preferred Doctor:* ${p.doctorTitle || doctorFallback}`,
    `📅 *Preferred Date:* ${p.preferredDate || dateFallback}`,
    `🔍 *Consultation Type:* ${consultLabel}`,
    SEPARATOR,
    `*Synced with EMR Patient Portal - Konooz Al-Ahram*`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Booking modal message  (BookingModal.tsx → handleModalSubmit)
// ---------------------------------------------------------------------------

export function buildBookingModalMessage(p: BookingModalParams): string {
  const lang = p.lang;
  const dateFallback =
    lang === 'ar' ? 'أقرب موعد ممكن' : 'Earliest available';
  const refDisplay = `#${p.bookingRef}`;

  if (lang === 'ar') {
    return [
      `*طلب حجز فوري ومباشر - مستشفى كنوز الأهرام للعيون (بنغازي)*`,
      SEPARATOR,
      `🎟️ *رقم الحجز المرجعي:* ${refDisplay}`,
      `🔢 *رقم التذكرة بالعيادة:* ${p.queueTicket}`,
      `👤 *اسم المريض:* ${p.patientName}`,
      `📞 *رقم الهاتف:* ${p.phone}`,
      `📧 *البريد الإلكتروني:* ${p.email}`,
      `⚧ *الجنس:* ${p.genderTitle}`,
      `🎂 *الفئة العمرية:* ${p.ageTitle}`,
      `👁️ *العين المصابة:* ${p.eyeTitle}`,
      `🩺 *سبب الزيارة / نوع الاستشارة:* ${p.conditionTitle}`,
      `⏱️ *مدة الأعراض / البداية:* ${p.durationTitle}`,
      `🏥 *التخصص الطبي:* ${p.specialtyTitle}`,
      `👨‍⚕️ *الطبيب المطلوب:* ${p.doctorTitle}`,
      `📅 *تاريخ الموعد المقترح:* ${p.preferredDate || dateFallback}`,
      `⏰ *الفترة المفضلة:* ${p.slotText}`,
      optionalLine('تفاصيل وملاحظات إضافية', p.notes),
      SEPARATOR,
      `*تم الإرسال عبر البوابة الإلكترونية لمستشفى كنوز الأهرام*`,
    ].join('\n');
  }

  return [
    `*Instant Direct Booking Request - Konooz Al-Ahram Eye Hospital (Benghazi)*`,
    SEPARATOR,
    `🎟️ *Booking Ref:* ${refDisplay}`,
    `🔢 *Clinic Queue Ticket:* ${p.queueTicket}`,
    `👤 *Patient Name:* ${p.patientName}`,
    `📞 *Phone Number:* ${p.phone}`,
    `📧 *Email:* ${p.email}`,
    `⚧ *Gender:* ${p.genderTitle}`,
    `🎂 *Age Group:* ${p.ageTitle}`,
    `👁️ *Affected Eye:* ${p.eyeTitle}`,
    `🩺 *Reason for Visit:* ${p.conditionTitle}`,
    `⏱️ *Symptom Duration:* ${p.durationTitle}`,
    `🏥 *Department / Specialty:* ${p.specialtyTitle}`,
    `👨‍⚕️ *Requested Doctor:* ${p.doctorTitle}`,
    `📅 *Preferred Date:* ${p.preferredDate || dateFallback}`,
    `⏰ *Preferred Time Slot:* ${p.slotText}`,
    optionalLine('Additional Notes', p.notes),
    SEPARATOR,
    `*Sent via Konooz Al-Ahram Eye Hospital Web Portal*`,
  ].join('\n');
}

// ---------------------------------------------------------------------------
// WhatsApp URL builder
// ---------------------------------------------------------------------------

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace('+', '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

// ---------------------------------------------------------------------------
// Simple greeting message  (FloatingWidgets.tsx)
// ---------------------------------------------------------------------------

export function buildGreetingMessage(lang: Language): string {
  return lang === 'ar'
    ? 'السلام عليكم، أرغب في الاستفسار وحجز موعد في مستشفى كنوز الأهرام لطب وجراحة العيون.'
    : 'Hello, I would like to inquire about treatments and appointments at Konooz Al-Ahram Eye Hospital.';
}
