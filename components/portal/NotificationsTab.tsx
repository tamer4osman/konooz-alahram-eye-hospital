'use client';

import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { usePortalActions } from './usePortalActions';
import { Smartphone, Mail, Send, Clock } from 'lucide-react';

interface NotificationsTabProps {
  notify: (message: string, timeoutMs?: number) => void;
}

export default function NotificationsTab({ notify }: NotificationsTabProps) {
  const { lang, t, isRTL } = useLanguage();
  const { currentPatient, toggleNotificationPref } = usePatientAuth();
  const { triggerTestWhatsAppAlert, triggerTestEmailAlert } = usePortalActions(notify);

  if (!currentPatient) return null;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-base font-extrabold text-ink-900">
          {t('مركز التنبيهات الفورية (واتساب والبريد الإلكتروني)', 'Instant WhatsApp & Email Notification Hub')}
        </h3>
        <p className="text-xs text-ink-500">
          {t('خصص قنوات استلام تذكيرات الكشوفات، مواعيد القطرات، والإرشادات بعد العمليات', 'Configure real-time channels for appointment alerts, drop schedules, and post-op care')}
        </p>
      </div>

      {/* Channels Status & Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* WhatsApp Channel Card */}
        <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-pine-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pine-500 text-white flex items-center justify-center shadow-xs">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-ink-900">{t('تنبيهات الواتساب الفورية', 'WhatsApp Instant Alerts')}</h4>
                <p className="text-xs text-emerald-700 font-mono font-bold">{currentPatient.whatsappNumber}</p>
              </div>
            </div>

            <button
              onClick={() => toggleNotificationPref('whatsappAlerts')}
              aria-label={t('تبديل تنبيهات الواتساب', 'Toggle WhatsApp alerts')}
              aria-pressed={currentPatient.communicationPreferences.whatsappAlerts}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentPatient.communicationPreferences.whatsappAlerts ? 'bg-emerald-600' : 'bg-ink-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentPatient.communicationPreferences.whatsappAlerts
                    ? isRTL ? '-translate-x-6' : 'translate-x-6'
                    : isRTL ? '-translate-x-1' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-ink-500">
            <div className="flex items-center justify-between">
              <span>{t('تذكير بموعد العيادة قبل 24 ساعة', '24h Appointment Reminder')}</span>
              <input
                type="checkbox"
                checked={currentPatient.communicationPreferences.appointmentReminders}
                onChange={() => toggleNotificationPref('appointmentReminders')}
                className="rounded text-emerald-600 focus:ring-pine-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>{t('تنبيهات مواعيد وضع قطرات العين', 'Eye Drop Dose Timetable Alerts')}</span>
              <input
                type="checkbox"
                checked={currentPatient.communicationPreferences.eyeDropScheduleAlerts}
                onChange={() => toggleNotificationPref('eyeDropScheduleAlerts')}
                className="rounded text-emerald-600 focus:ring-pine-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>{t('تنبيه عند اقتراب دورك في العيادة (رقم التذكرة)', 'Live Queue Approaching Alert')}</span>
              <input
                type="checkbox"
                checked={currentPatient.communicationPreferences.queueTurnAlerts}
                onChange={() => toggleNotificationPref('queueTurnAlerts')}
                className="rounded text-emerald-600 focus:ring-pine-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-pine-100 flex items-center justify-between">
            <span className="text-[11px] text-ink-500">{t('جرّب إرسال تنبيه تجريبي:', 'Test live dispatch:')}</span>
            <button
              onClick={() => triggerTestWhatsAppAlert('appointment')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>{t('إرسال واتساب تجريبي', 'Send Test Alert')}</span>
            </button>
          </div>
        </div>

        {/* Email Channel Card */}
        <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-pine-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pine-800 text-white flex items-center justify-center shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-ink-900">{t('إشعارات البريد الإلكتروني', 'Email Summaries & Reports')}</h4>
                <p className="text-xs text-pine-700 font-mono font-bold">{currentPatient.email}</p>
              </div>
            </div>

            <button
              onClick={() => toggleNotificationPref('emailNotifications')}
              aria-label={t('تبديل إشعارات البريد الإلكتروني', 'Toggle email notifications')}
              aria-pressed={currentPatient.communicationPreferences.emailNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentPatient.communicationPreferences.emailNotifications ? 'bg-pine-800' : 'bg-ink-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentPatient.communicationPreferences.emailNotifications
                    ? isRTL ? '-translate-x-6' : 'translate-x-6'
                    : isRTL ? '-translate-x-1' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-ink-500">
            <div className="flex items-center justify-between">
              <span>{t('إرسال التقارير الطبية وفحوصات الأشعة (OCT)', 'Medical Reports & OCT PDF')}</span>
              <input
                type="checkbox"
                checked={currentPatient.communicationPreferences.emailNotifications}
                onChange={() => toggleNotificationPref('emailNotifications')}
                className="rounded text-pine-800 focus:ring-pine-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>{t('إرشادات العناية بعد جراحات الليزك والمياه البيضاء', 'Post-Op Surgical Care Instructions')}</span>
              <input
                type="checkbox"
                checked={currentPatient.communicationPreferences.postOpCareGuides}
                onChange={() => toggleNotificationPref('postOpCareGuides')}
                className="rounded text-pine-800 focus:ring-pine-500 w-4 h-4 cursor-pointer"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>{t('الاشتراك في النشرة الطبية للعيون', 'Subscribe to Eye Health Digest')}</span>
              <input
                type="checkbox"
                checked={currentPatient.communicationPreferences.newsletterSubscribed}
                onChange={() => toggleNotificationPref('newsletterSubscribed')}
                className="rounded text-pine-800 focus:ring-pine-500 w-4 h-4 cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-pine-100 flex items-center justify-between">
            <span className="text-[11px] text-ink-500">{t('جرّب إرسال تقرير تجريبي:', 'Test report email:')}</span>
            <button
              onClick={triggerTestEmailAlert}
              className="px-3 py-1.5 bg-pine-800 hover:bg-pine-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Send className="w-3 h-3" />
              <span>{t('إرسال إيميل تجريبي', 'Send Test Email')}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Notification History Log */}
      <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
        <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-ink-500" />
          <span>{t('سجل الإشعارات والتنبيهات المرسلة إلى حسابك', 'Recent Sent Notifications & Alerts')}</span>
        </h4>

        <div className="space-y-2">
          {currentPatient.notificationHistory && currentPatient.notificationHistory.length > 0 ? (
            currentPatient.notificationHistory.map((notif) => (
              <div key={notif.id} className="p-3 rounded-xl bg-bone-50 border border-pine-200 flex items-start gap-3 text-xs">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                    notif.channel === 'whatsapp' ? 'bg-emerald-600' : 'bg-pine-700'
                  }`}
                >
                  {notif.channel === 'whatsapp' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-ink-900 font-bold">{lang === 'ar' ? notif.titleAr : notif.titleEn}</strong>
                    <span className="text-[10px] text-ink-400 font-mono">{notif.timestamp}</span>
                  </div>
                  <p className="text-ink-500 text-[11px] leading-relaxed">{lang === 'ar' ? notif.bodyAr : notif.bodyEn}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-ink-400 italic py-2">{t('لا توجد إشعارات سابقة مسجلة.', 'No prior alerts recorded.')}</p>
          )}
        </div>
      </div>

    </div>
  );
}
