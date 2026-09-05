'use client';

import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';

/**
 * Shared patient-portal action helpers used across tabs: pre-filled WhatsApp
 * drafts (honest model — nothing sends automatically) and the email log flow.
 * `notify(message, timeoutMs)` surfaces the cross-tab feedback banner owned by
 * the portal page.
 */
export function usePortalActions(notify: (message: string, timeoutMs?: number) => void) {
  const { t } = useLanguage();
  const {
    currentPatient,
    sendLiveNotificationSimulation,
    openWhatsAppAlert
  } = usePatientAuth();

  const triggerTestWhatsAppAlert = (type: 'appointment' | 'eyedrops' | 'newsletter') => {
    if (!currentPatient) return;

    let titleAr = '';
    let titleEn = '';
    let bodyAr = '';
    let bodyEn = '';

    if (type === 'appointment') {
      const apt = currentPatient.appointments[0];
      titleAr = 'تأكيد موعد العيادة وتتبع الدور';
      titleEn = 'Clinic Appointment Confirmation';
      bodyAr = apt
        ? `مرحباً ${currentPatient.fullNameAr}، أرغب بتأكيد موعدي (تذكرة رقم ${apt.ticketNumber}) مع ${apt.doctorNameAr} يوم ${apt.date} الساعة ${apt.time}. المكان: ${apt.room}.`
        : `مرحباً ${currentPatient.fullNameAr}، أرغب بالاستفسار عن موعد كشف في مستشفى كنوز الأهرام.`;
      bodyEn = apt
        ? `Dear ${currentPatient.fullNameEn}, I would like to confirm my appointment ticket ${apt.ticketNumber} with ${apt.doctorNameEn} on ${apt.date} at ${apt.time}. Location: ${apt.room}.`
        : `Dear ${currentPatient.fullNameEn}, I would like to inquire about an appointment at Konooz Al-Ahram Eye Hospital.`;
    } else if (type === 'eyedrops') {
      titleAr = 'استفسار بخصوص موعد قطرة العين';
      titleEn = 'Eye Drops Schedule Inquiry';
      bodyAr = `مرحباً، لدي استفسار حول جدول قطرات العين الموصوفة لي.`;
      bodyEn = `Hello, I have a question about my prescribed eye drop schedule.`;
    } else {
      titleAr = 'طلب اشتراك بالنشرة الطبية لكنوز الأهرام';
      titleEn = 'Konooz Al-Ahram Newsletter Subscription Request';
      bodyAr = `مرحباً، أرغب بالاشتراك في النشرة الطبية لطب وجراحة العيون.`;
      bodyEn = `Hello, I would like to subscribe to the ophthalmology health digest.`;
    }

    sendLiveNotificationSimulation('whatsapp', titleAr, titleEn, bodyAr, bodyEn);
    notify(t('تم تجهيز رسالة واتساب جاهزة للإرسال — راجع نافذة واتساب واضغط إرسال لإتمامها فعلياً.', 'A pre-filled WhatsApp draft is ready — switch to WhatsApp and press send to deliver it.'), 4500);

    openWhatsAppAlert(`*مستشفى كنوز الأهرام لطب وجراحة العيون*\n\n📋 *${titleAr}*\n${bodyAr}\n\n📍 بنغازي - حي الفويهات\n📞 ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`);
  };

  const triggerTestEmailAlert = () => {
    if (!currentPatient) return;
    const titleAr = 'التقرير الطبي وملخص المواعيد - مستشفى كنوز الأهرام';
    const titleEn = 'Medical Summary & Appointments - Konooz Al-Ahram';

    const pendingMessage = t('الإرسال البريدي التلقائي سيُفعّل عند اكتمال ربط النظام الطبي.', 'Automated email delivery activates once system integration is complete.');
    sendLiveNotificationSimulation('email', titleAr, titleEn, pendingMessage, pendingMessage);
    notify(t('سُجّل الطلب في سجلك — الإرسال البريدي الفعلي سيكون متاحاً قريباً.', 'Logged in your history — actual email delivery is coming soon.'), 4000);
  };

  return { triggerTestWhatsAppAlert, triggerTestEmailAlert };
}
