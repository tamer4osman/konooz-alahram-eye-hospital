'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import Modal from '@/components/ui/Modal';
import { X, User, Calendar, Pill, Bell, Mail, ShieldCheck, CheckCircle2, Lock, LogOut } from 'lucide-react';

const PortalTabSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-10 bg-bone-200 rounded-xl w-48" />
    <div className="h-48 bg-bone-200 rounded-2xl" />
  </div>
);

const ProfileTab = dynamic(() => import('@/components/portal/ProfileTab'), { ssr: false, loading: PortalTabSkeleton });
const AppointmentsTab = dynamic(() => import('@/components/portal/AppointmentsTab'), { ssr: false, loading: PortalTabSkeleton });
const PrescriptionsTab = dynamic(() => import('@/components/portal/PrescriptionsTab'), { ssr: false, loading: PortalTabSkeleton });
const NotificationsTab = dynamic(() => import('@/components/portal/NotificationsTab'), { ssr: false, loading: PortalTabSkeleton });
const NewsletterTab = dynamic(() => import('@/components/portal/NewsletterTab'), { ssr: false, loading: PortalTabSkeleton });
const AuthTab = dynamic(() => import('@/components/portal/AuthTab'), { ssr: false, loading: PortalTabSkeleton });

export default function PatientPortalModal() {
  const { t } = useLanguage();
  const { currentPatient, logout, isPatientPortalOpen, closePatientPortal, activePortalTab, setActivePortalTab } = usePatientAuth();

  // Cross-tab feedback banner (owned here so every tab can surface messages)
  const [simulationSentMessage, setSimulationSentMessage] = useState<string | null>(null);
  const notify = (message: string, timeoutMs = 4000) => {
    setSimulationSentMessage(message);
    setTimeout(() => setSimulationSentMessage(null), timeoutMs);
  };

  if (!isPatientPortalOpen) return null;

  return (
    <Modal
      isOpen={isPatientPortalOpen}
      onClose={closePatientPortal}
      labelledById="patient-portal-modal-title"
      panelClassName="w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
    >
        
        {/* Header Bar */}
        <div className="bg-pine-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pine-500/20 border border-brass-400/40 flex items-center justify-center text-brass-300 shadow-inner">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="patient-portal-modal-title" className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {t('بوابة المريض والملف الطبي الموحد', 'Patient Care Portal & Medical Profile')}
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pine-500/20 text-brass-300 border border-pine-500/40">
                  {t('نظام كنوز المتكامل', 'Konooz Smart EMR')}
                </span>
              </div>
              <p className="text-xs text-ink-300 mt-0.5">
                {currentPatient
                  ? t(
                      `مرحباً بك: ${currentPatient.fullNameAr}`,
                      `Welcome: ${currentPatient.fullNameEn}`
                    )
                  : t('أنشئ ملفك المحلي لمتابعة مواعيدك وتنبيهاتك', 'Create your local profile to track appointments and alerts')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentPatient && (
              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-ink-300 hover:text-white bg-ink-700/80 hover:bg-red-500/20 hover:border-red-500/40 border border-ink-700 transition-colors"
                title={t('تسجيل الخروج', 'Log Out')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('خروج', 'Logout')}</span>
              </button>
            )}

            <button
              onClick={closePatientPortal}
              className="p-2 rounded-xl text-ink-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-bone-100 border-b border-pine-200 px-3 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {currentPatient ? (
            <>
              <button
                onClick={() => setActivePortalTab('profile')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'profile'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t('ملفي الطبي والبيانات', 'My Medical Profile')}</span>
              </button>

              <button
                onClick={() => setActivePortalTab('appointments')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer relative ${
                  activePortalTab === 'appointments'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{t('مواعيدي والعيادات', 'Appointments')}</span>
                {currentPatient.appointments.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-pine-700 text-white text-[10px] flex items-center justify-center font-bold">
                    {currentPatient.appointments.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActivePortalTab('prescriptions')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'prescriptions'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>{t('الوصفات ومواعيد القطرات', 'Prescriptions & Drops')}</span>
              </button>

              <button
                onClick={() => setActivePortalTab('notifications')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'notifications'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>{t('تنبيهات الواتساب والإيميل', 'WhatsApp & Email Alerts')}</span>
              </button>

              <button
                onClick={() => setActivePortalTab('newsletter')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'newsletter'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Mail className="w-4 h-4 text-pine-800" />
                <span>{t('النشرة الطبية للعيون', 'Eye Health Digest')}</span>
              </button>

              <button
                onClick={() => setActivePortalTab('auth')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'auth'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{t('الملف المحلي / تسجيل', 'Local Profile / Register')}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActivePortalTab('auth')}
              className="py-3 px-4 text-sm font-bold border-b-2 border-pine-700 text-pine-800 bg-white rounded-t-lg flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{t('تسجيل الدخول وفتح ملف جديد', 'Sign In / Register Profile')}</span>
            </button>
          )}
        </div>

        {/* Global Feedback Banner */}
        {simulationSentMessage && (
          <div className="bg-pine-50 border-b border-pine-200 px-4 py-2.5 flex items-center justify-between text-pine-900 text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{simulationSentMessage}</span>
            </div>
            <button onClick={() => setSimulationSentMessage(null)} aria-label={t('إغلاق التنبيه', 'Dismiss message')} className="text-emerald-700 hover:text-pine-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-bone-50/50">

          {/* TAB 1: Profile */}
          {activePortalTab === 'profile' && currentPatient && (
            <ProfileTab notify={notify} />
          )}

          {/* TAB 2: Appointments */}
          {activePortalTab === 'appointments' && currentPatient && (
            <AppointmentsTab />
          )}

          {/* TAB 3: Prescriptions & Eye Drops */}
          {activePortalTab === 'prescriptions' && currentPatient && (
            <PrescriptionsTab />
          )}

          {/* TAB 4: WhatsApp & Email Alerts & Communication Center */}
          {activePortalTab === 'notifications' && currentPatient && (
            <NotificationsTab notify={notify} />
          )}

          {/* TAB 5: Eye Health Newsletter */}
          {activePortalTab === 'newsletter' && (
            <NewsletterTab />
          )}

          {/* TAB 6: Device-Local Profile Access */}
          {activePortalTab === 'auth' && (
            <AuthTab notify={notify} onProfileCreated={() => setActivePortalTab('profile')} />
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-bone-100 border-t border-pine-200 px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-ink-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-pine-700 flex-shrink-0" />
            <span>{t('الملف المحلي على هذا الجهاز — والحساب السحابي الآمن متاح من تبويب الحساب', 'Local profile on this device — Secure Cloud Account available in the Account tab')}</span>
          </div>

          <button
            onClick={closePatientPortal}
            className="px-4 py-2 bg-ink-900 hover:bg-ink-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {t('إغلاق البوابة', 'Close Portal')}
          </button>
        </div>

    </Modal>
  );
}
