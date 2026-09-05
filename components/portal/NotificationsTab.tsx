'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { Bell, Calendar, CheckCircle2, Clock, Mail, MessageSquareHeart, Smartphone } from 'lucide-react';

type NotificationKind = 'upcoming_appointment' | 'appointment_confirmed' | 'visit_completed';

interface DerivedNotification {
  kind: NotificationKind;
  id: string;
  ticketNumber: string;
  date: string;
  time?: string;
  doctorAr?: string;
  doctorEn?: string;
  specialtyAr?: string;
  specialtyEn?: string;
}

interface NotificationsResponse {
  data?: { generatedAt?: string; items?: DerivedNotification[] };
}

type FetchState =
  | { phase: 'loading' }
  | { phase: 'error' }
  | { phase: 'ready'; items: DerivedNotification[] };

const SURVEY_TAB_SELECTOR = '[data-portal-tab="survey"]';

export default function NotificationsTab() {
  const { lang, t, isRTL } = useLanguage();
  const { currentPatient, toggleNotificationPref } = usePatientAuth();
  const [state, setState] = useState<FetchState>({ phase: 'loading' });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setState({ phase: 'loading' });
      try {
        const res = await fetch('/api/patient/notifications');
        if (!res.ok) {
          if (!cancelled) setState({ phase: 'error' });
          return;
        }
        const json = (await res.json()) as NotificationsResponse;
        const items = Array.isArray(json?.data?.items) ? json.data.items : [];
        if (!cancelled) setState({ phase: 'ready', items });
      } catch {
        if (!cancelled) setState({ phase: 'error' });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const dateFmt = new Intl.DateTimeFormat(lang === 'ar' ? 'ar' : 'en', { dateStyle: 'medium' });

  const openSurveyTab = () => {
    (document.querySelector(SURVEY_TAB_SELECTOR) as HTMLElement | null)?.click();
  };

  const upcoming = state.phase === 'ready' ? state.items.filter((item) => item.kind === 'upcoming_appointment') : [];
  const confirmed = state.phase === 'ready' ? state.items.filter((item) => item.kind === 'appointment_confirmed') : [];
  const completed = state.phase === 'ready' ? state.items.filter((item) => item.kind === 'visit_completed') : [];

  const renderTicket = (ticket: string) => (
    <span className="font-mono font-extrabold text-[10px] px-2 py-0.5 rounded-lg bg-ink-900 text-brass-300">
      {ticket}
    </span>
  );

  const renderEmptyGroup = (message: string) => (
    <p className="text-xs text-ink-400 italic py-1">{message}</p>
  );

  return (
    <div className="space-y-6">
      {/* D9: alerts are derived read-only facts from the patient's appointment rows — never a sent-message log */}
      <section aria-labelledby="derived-notifications-heading" className="space-y-3">
        <div>
          <h3 id="derived-notifications-heading" className="text-base font-extrabold text-ink-900 flex items-center gap-2">
            <Bell className="w-4 h-4 text-emerald-600" />
            <span>{t('تنبيهاتك', 'Your Alerts')}</span>
          </h3>
          <p className="text-xs text-ink-500 mt-1 leading-relaxed">
            {t(
              'تنبيهاتك محسوبة من بيانات مواعيدك الفعلية — لا شيء يُرسل تلقائياً',
              'Your alerts are computed from your actual appointment data — nothing is sent automatically'
            )}
          </p>
        </div>

        {state.phase === 'loading' && (
          <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3 animate-pulse" role="status" aria-hidden="true">
            <span className="sr-only">{t('جارٍ تحميل تنبيهاتك…', 'Loading your alerts…')}</span>
            <div className="h-4 bg-bone-200 rounded w-40" />
            <div className="h-14 bg-bone-200 rounded-xl" />
            <div className="h-14 bg-bone-200 rounded-xl" />
          </div>
        )}

        {state.phase === 'error' && (
          <div className="bg-white rounded-2xl p-5 border border-red-200 shadow-xs" role="alert">
            <p className="text-xs text-red-700 font-bold">
              {t('تعذر تحميل تنبيهاتك الآن — بياناتك آمنة على خوادم المستشفى.', 'We could not load your alerts right now — your data remains safe on the hospital servers.')}
            </p>
            <button
              onClick={() => setReloadToken((token) => token + 1)}
              className="mt-2 px-3 py-1.5 rounded-lg bg-pine-50 hover:bg-pine-100 text-pine-800 border border-pine-200 text-xs font-bold transition-colors cursor-pointer"
            >
              {t('إعادة المحاولة', 'Try again')}
            </button>
          </div>
        )}

        {state.phase === 'ready' && state.items.length === 0 && (
          <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs">
            <p className="text-xs text-ink-500 leading-relaxed">
              {t(
                'لا تنبيهات حالياً — ستظهر هنا تفاصيل مواعيدك المؤكدة والقادمة',
                'No alerts right now — your confirmed and upcoming appointment details will appear here'
              )}
            </p>
          </div>
        )}

        {state.phase === 'ready' && state.items.length > 0 && (
          <div className="space-y-3">
            {/* Upcoming appointments */}
            <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
              <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pine-700" />
                <span>{t('مواعيد قادمة', 'Upcoming Appointments')}</span>
              </h4>
              {upcoming.length === 0 ? (
                renderEmptyGroup(t('لا توجد مواعيد قادمة مسجلة.', 'No upcoming appointments recorded.'))
              ) : (
                <ul className="space-y-2">
                  {upcoming.map((item) => (
                    <li key={item.id} className="p-3 rounded-xl bg-bone-50 border border-pine-200 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      {renderTicket(item.ticketNumber)}
                      <span className="font-bold text-ink-900">{dateFmt.format(new Date(item.date))}</span>
                      {item.time && <span className="text-ink-600 font-mono">{item.time}</span>}
                      {item.doctorAr && (
                        <span className="text-ink-600">
                          {lang === 'ar' ? item.doctorAr : item.doctorEn}
                          {item.specialtyAr ? ` — ${lang === 'ar' ? item.specialtyAr : item.specialtyEn}` : ''}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirmed appointments */}
            <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
              <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t('مواعيد مؤكدة', 'Confirmed Appointments')}</span>
              </h4>
              {confirmed.length === 0 ? (
                renderEmptyGroup(t('لا توجد مواعيد مؤكدة حالياً.', 'No confirmed appointments right now.'))
              ) : (
                <ul className="space-y-2">
                  {confirmed.map((item) => (
                    <li key={item.id} className="p-3 rounded-xl bg-bone-50 border border-pine-200 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      {renderTicket(item.ticketNumber)}
                      <span className="font-bold text-ink-900">{dateFmt.format(new Date(item.date))}</span>
                      {item.time && <span className="text-ink-600 font-mono">{item.time}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Completed visits + survey hint */}
            <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
              <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-2">
                <Clock className="w-4 h-4 text-ink-500" />
                <span>{t('زيارات مكتملة', 'Completed Visits')}</span>
              </h4>
              {completed.length === 0 ? (
                renderEmptyGroup(t('لا توجد زيارات مكتملة بعد.', 'No completed visits yet.'))
              ) : (
                <ul className="space-y-2">
                  {completed.map((item) => (
                    <li key={item.id} className="p-3 rounded-xl bg-bone-50 border border-pine-200 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        {renderTicket(item.ticketNumber)}
                        <span className="font-bold text-ink-900">{dateFmt.format(new Date(item.date))}</span>
                        {item.doctorAr && <span className="text-ink-600">{lang === 'ar' ? item.doctorAr : item.doctorEn}</span>}
                      </span>
                      <button
                        onClick={openSurveyTab}
                        className="px-3 py-1.5 bg-brass-50 hover:bg-brass-100 text-brass-600 border border-brass-300 rounded-lg font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquareHeart className="w-3.5 h-3.5" />
                        <span>{t('قيّم زيارتك', 'Rate your visit')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Communication preferences — channel toggles remain patient-controlled */}
      {currentPatient && (
        <section aria-label={t('تفضيلات التواصل', 'Communication preferences')} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>

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
          </div>
        </section>
      )}
    </div>
  );
}
