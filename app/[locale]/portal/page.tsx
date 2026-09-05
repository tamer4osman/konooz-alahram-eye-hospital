'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { ArrowLeft, ArrowRight, Bell, Calendar, CheckCircle2, ExternalLink, Loader2, Lock, LogOut, Mail, MessageSquareHeart, Pill, ShieldCheck, User, X } from 'lucide-react';

type PortalTab = 'profile' | 'appointments' | 'survey' | 'prescriptions' | 'notifications' | 'newsletter' | 'auth';

const PortalTabSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-10 bg-bone-200 rounded-xl w-48" />
    <div className="h-48 bg-bone-200 rounded-2xl" />
  </div>
);

const ProfileTab = dynamic(() => import('@/components/portal/ProfileTab'), { ssr: false, loading: PortalTabSkeleton });
const AppointmentsTab = dynamic(() => import('@/components/portal/AppointmentsTab'), { ssr: false, loading: PortalTabSkeleton });
const SurveyTab = dynamic(() => import('@/components/portal/SurveyTab'), { ssr: false, loading: PortalTabSkeleton });
const PrescriptionsTab = dynamic(() => import('@/components/portal/PrescriptionsTab'), { ssr: false, loading: PortalTabSkeleton });
const NotificationsTab = dynamic(() => import('@/components/portal/NotificationsTab'), { ssr: false, loading: PortalTabSkeleton });
const NewsletterTab = dynamic(() => import('@/components/portal/NewsletterTab'), { ssr: false, loading: PortalTabSkeleton });
const AuthTab = dynamic(() => import('@/components/portal/AuthTab'), { ssr: false, loading: PortalTabSkeleton });

export default function PatientPortalPage() {
  const { lang, t, isRTL } = useLanguage();
  const { currentPatient, logoutServer, isServerAuthenticated, sessionChecked } = usePatientAuth();

  const [activeTab, setActiveTab] = useState<PortalTab | null>(null);
  const [simulationSentMessage, setSimulationSentMessage] = useState<string | null>(null);
  const [surveyPrefill, setSurveyPrefill] = useState<string | null>(null);

  const notify = (message: string, timeoutMs = 4000) => {
    setSimulationSentMessage(message);
    setTimeout(() => setSimulationSentMessage(null), timeoutMs);
  };

  useEffect(() => {
    if (sessionChecked && activeTab === null) {
      setActiveTab(isServerAuthenticated ? 'profile' : 'auth');
    }
  }, [sessionChecked, isServerAuthenticated, activeTab]);

  const handleLogout = async () => {
    await logoutServer();
    setSurveyPrefill(null);
    setActiveTab('auth');
  };

  // Patients must sign in before any personal-data tab renders content.
  const isDataTab = activeTab !== 'auth' && activeTab !== 'newsletter';
  const gated = sessionChecked && !isServerAuthenticated && activeTab !== null && isDataTab;

  if (!sessionChecked || activeTab === null) {
    return (
      <div className="min-h-screen bg-bone-50 flex items-center justify-center" role="status">
        <Loader2 className="w-8 h-8 text-pine-700 animate-spin" />
        <span className="sr-only">{t('جارٍ التحقق من جلستك…', 'Checking your session…')}</span>
      </div>
    );
  }

  const tabItems: Array<{ id: PortalTab; ar: string; en: string; icon: React.ReactNode }> = ([
    { id: 'profile', ar: 'ملفي الطبي والبيانات', en: 'My Medical Profile', icon: <User className="w-4 h-4" /> },
    { id: 'appointments', ar: 'مواعيدي والعيادات', en: 'Appointments', icon: <Calendar className="w-4 h-4" /> },
    { id: 'survey', ar: 'قيّم زيارتك', en: 'Rate Your Visit', icon: <MessageSquareHeart className="w-4 h-4 text-brass-500" /> },
    { id: 'prescriptions', ar: 'الوصفات ومواعيد القطرات', en: 'Prescriptions & Drops', icon: <Pill className="w-4 h-4" /> },
    { id: 'notifications', ar: 'تنبيهات الواتساب والإيميل', en: 'WhatsApp & Email Alerts', icon: <Bell className="w-4 h-4 text-emerald-600" /> },
    { id: 'newsletter', ar: 'النشرة الطبية للعيون', en: 'Eye Health Digest', icon: <Mail className="w-4 h-4 text-pine-800" /> },
    { id: 'auth', ar: 'الحساب وتسجيل الدخول', en: 'Account & Sign In', icon: <Lock className="w-4 h-4" /> },
  ] as const).filter((tab) => tab.id !== 'survey' || isServerAuthenticated);

  return (
    <div className="min-h-screen flex flex-col bg-bone-50">
      {/* Header Bar */}
      <header className="bg-pine-900 text-white px-4 sm:px-6 py-4 border-b border-ink-700">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-pine-500/20 border border-brass-400/40 flex items-center justify-center text-brass-300 shadow-inner flex-shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight truncate">
                  {t('بوابة المريض والملف الطبي الموحد', 'Patient Care Portal & Medical Profile')}
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pine-500/20 text-brass-300 border border-pine-500/40">
                  {t('نظام كنوز المتكامل', 'Konooz Smart EMR')}
                </span>
              </div>
              <p className="text-xs text-ink-300 mt-0.5 truncate">
                {currentPatient
                  ? t(`مرحباً بك: ${currentPatient.fullNameAr}`, `Welcome: ${currentPatient.fullNameEn}`)
                  : t('سجّل الدخول للوصول إلى ملفك الطبي', 'Sign in to access your medical profile')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isServerAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-ink-300 hover:text-white bg-ink-700/80 hover:bg-red-500/20 hover:border-red-500/40 border border-ink-700 transition-colors cursor-pointer"
                title={t('تسجيل الخروج', 'Log Out')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('خروج', 'Logout')}</span>
              </button>
            )}
            <a
              href={`/${lang}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-pine-100 hover:text-white bg-white/10 hover:bg-white/20 transition-colors"
              title={t('العودة إلى الموقع الرئيسي', 'Back to main site')}
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{t('العودة للموقع', 'Back to site')}</span>
            </a>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-bone-100 border-b border-pine-200" aria-label={t('أقسام بوابة المريض', 'Patient portal sections')}>
        <div className="max-w-6xl mx-auto px-3 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              data-portal-tab={tab.id}
              onClick={() => setActiveTab(tab.id)}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              }`}
            >
              {tab.icon}
              <span>{t(tab.ar, tab.en)}</span>
              {tab.id === 'appointments' && (currentPatient?.appointments.length ?? 0) > 0 && (
                <span className="w-4 h-4 rounded-full bg-pine-700 text-white text-[10px] flex items-center justify-center font-bold">
                  {currentPatient?.appointments.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Feedback Banner */}
      {simulationSentMessage && (
        <div className="bg-pine-50 border-b border-pine-200 px-4 py-2.5 flex items-center justify-between text-pine-900 text-xs font-bold" role="status">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{simulationSentMessage}</span>
          </div>
          <button onClick={() => setSimulationSentMessage(null)} aria-label={t('إغلاق التنبيه', 'Dismiss message')} className="text-emerald-700 hover:text-pine-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tab Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 sm:p-6">
        {gated ? (
          <AuthTab notify={notify} onProfileCreated={() => setActiveTab('profile')} />
        ) : (
          <>
            {activeTab === 'profile' && <ProfileTab notify={notify} />}

            {activeTab === 'appointments' && (
              <AppointmentsTab
                onRateVisit={(ticket) => {
                  setSurveyPrefill(ticket);
                  setActiveTab('survey');
                }}
              />
            )}

            {activeTab === 'survey' && <SurveyTab notify={notify} prefillTicket={surveyPrefill} />}

            {activeTab === 'prescriptions' && <PrescriptionsTab />}

            {activeTab === 'notifications' && <NotificationsTab notify={notify} />}

            {activeTab === 'newsletter' && <NewsletterTab />}

            {activeTab === 'auth' && <AuthTab notify={notify} onProfileCreated={() => setActiveTab('profile')} />}
          </>
        )}
      </main>

      {/* Footer: honest data notice */}
      <footer className="bg-bone-100 border-t border-pine-200 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 text-xs text-ink-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-pine-700 flex-shrink-0" />
            <span>
              {t('بياناتك محفوظة في خوادم المستشفى — لا شيء يُرسل تلقائياً دون إرادتك', 'Your data is stored on the hospital servers — nothing is sent automatically without your consent')}
            </span>
          </div>
          <a href={`/${lang}`} className="hidden sm:flex items-center gap-1 font-bold text-pine-700 hover:text-pine-900">
            <span>{t('الموقع الرئيسي', 'Main site')}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  );
}
