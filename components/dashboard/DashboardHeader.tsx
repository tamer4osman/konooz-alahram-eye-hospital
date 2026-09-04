'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { Activity, Calendar, ChevronDown, RefreshCw, Bell, ArrowRight, ArrowLeft, Building2, Plus, Users, Cpu, Radio, LogOut } from 'lucide-react';
import type { OpsSnapshot } from '@/lib/usecases/ops-status/ports';

interface DashboardHeaderProps {
  timeframe: 'day' | 'week' | 'month' | 'year';
  onChangeTimeframe: (tf: 'day' | 'week' | 'month' | 'year') => void;
  onOpenAddModal: (type: 'staff' | 'surgery' | 'equipment' | 'room' | 'broadcast') => void;
}

const LEVEL_STYLES: Record<string, string> = {
  success: 'bg-pine-100 text-pine-800 border-pine-200',
  warning: 'bg-brass-100 text-brass-600 border-brass-200',
  info: 'bg-ink-100 text-ink-700 border-ink-200',
};

/** Relative-time label in minutes; both locales share the compact form. */
function minutesAgoLabel(iso: string, t: (ar: string, en: string) => string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  if (mins < 1) return t('الآن', 'just now');
  if (mins < 60) return t(`منذ ${mins} دقيقة`, `${mins} mins ago`);
  const hours = Math.floor(mins / 60);
  return t(`منذ ${hours} ساعة`, `${hours} hours ago`);
}

export default function DashboardHeader({
  timeframe, onChangeTimeframe, onOpenAddModal
}: DashboardHeaderProps) {
  const { t, isRTL, setActiveView } = useLanguage();
  const { serverUser, logoutServer } = usePatientAuth();
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Live ops status: system health badge + activity feed, from the database.
  const [ops, setOps] = useState<OpsSnapshot | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/staff/ops-status', { signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) setOps(json.data as OpsSnapshot);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const adminInitial = (serverUser?.email ?? '?').charAt(0).toUpperCase();

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <header className="bg-ink-900 text-white border-b border-ink-700 sticky top-0 z-30 shadow-lg">
      {/* Top Telemetry & Status Bar */ }
      <div className="bg-pine-950 border-b border-ink-700/80 px-4 sm:px-6 py-2">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-brass-400 font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brass-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pine-500"></span>
              </span>
              <span>{t('نظام إدارة العمليات الحية - مستشفى كنوز الأهرام', 'Live Operations & Control Hub - Konooz Hospital')}</span>
            </div>
            <span className="hidden md:inline-block text-ink-500">|</span>
            <span className="hidden md:inline-flex items-center gap-1 text-ink-400">
              <Building2 className="w-3.5 h-3.5 text-ink-500" />
              <span>{t('المجمع الجراحي والعيادات - فرع بنغازي', 'Benghazi Surgical Complex')}</span>
            </span>
          </div>

          {/* Switch back to Public Hospital Portal */}
          <div className="flex items-center gap-3">
            {serverUser && (
              <span
                dir="ltr"
                className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pine-900/40 border border-pine-700/40 text-pine-200 text-[11px] font-bold font-mono"
                title={t('حساب الطاقم المسجل دخوله', 'Signed-in staff account')}
              >
                {serverUser.email}
              </span>
            )}
            <button
              onClick={async () => { await logoutServer(); setActiveView('portal'); }}
              className="flex items-center gap-1.5 px-3 py-1 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 hover:text-white border border-rose-800/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              title={t('تسجيل خروج الطاقم', 'Staff sign out')}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{t('خروج', 'Sign Out')}</span>
            </button>
            <button
              onClick={() => setActiveView('portal')}
              className="flex items-center gap-1.5 px-3 py-1 bg-pine-900/40 hover:bg-pine-800/60 text-brass-300 hover:text-white border border-pine-700/40 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              {isRTL ? <ArrowRight className="w-3.5 h-3.5" /> : <ArrowLeft className="w-3.5 h-3.5" />}
              <span>{t('العودة لبوابة المرضى والموقع العام', 'Back to Public Hospital Portal') }</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header & Control Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left Title & System Status */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-pine-800 border border-brass-400/40 flex items-center justify-center shadow-inner flex-shrink-0">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-white tracking-tight">
                  {t('لوحة التحكم وإدارة موارد المستشفى', 'Hospital Resource & Operations Command')}
                </h1>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                  ops?.systemHealth.level === 'operational'
                    ? 'bg-pine-500/20 text-pine-300 border-pine-500/30'
                    : ops?.systemHealth.level === 'warning'
                      ? 'bg-brass-500/20 text-brass-300 border-brass-500/30'
                      : ops?.systemHealth.level === 'critical'
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-ink-700/60 text-ink-400 border-ink-600'
                }`}>
                  {ops ? t(ops.systemHealth.labelAr, ops.systemHealth.labelEn) : t('جارٍ فحص الحالة…', 'Checking status…')}
                </span>
              </div>
              <p className="text-xs text-ink-400 mt-0.5">
                {t(
                  'مراقبة الكوادر الطبية، غرف العمليات، الأجهزة الحيوية، والمؤشرات الإحصائية متعددة الفترات', 'Controlling staff, operating suites, high-tech devices & multi-period analytics'
                )}
              </p>
            </div>
          </div>

          {/* Right Controls: Timeframe Selector, User Profile Switcher & Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Multi-Timeframe Selector Tabs */}
            <div className="bg-ink-700/90 border border-ink-700/80 p-1 rounded-xl flex items-center gap-1 shadow-inner">
              <span className="text-[11px] font-bold text-ink-400 px-2 hidden sm:inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-brass-400" />
                <span>{t('الفترة:', 'Period:')}</span>
              </span>
              {[
                { key: 'day', labelAr: 'يومي', labelEn: 'Day' }, { key: 'week', labelAr: 'أسبوعي', labelEn: 'Week' }, { key: 'month', labelAr: 'شهري', labelEn: 'Month' }, { key: 'year', labelAr: 'سنوي', labelEn: 'Year' }
              ].map((tf) => (
                <button
                  key={tf.key }
                  onClick={() => onChangeTimeframe(tf.key as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    timeframe === tf.key
                      ? 'bg-pine-700 text-white shadow-sm'
                      : 'text-ink-400 hover:text-white hover:bg-ink-700/50'
                  }`}
                >
                  {t(tf.labelAr, tf.labelEn)}
                </button>
              ))}
            </div>

            {/* Live Refresh Button */}
            <button
              onClick={handleRefresh}
              title={t('تحديث البيانات اللحظية', 'Refresh Live Data')}
              className={`p-2 rounded-xl bg-ink-700 border border-ink-700 text-ink-300 hover:text-white hover:bg-ink-700 transition-all cursor-pointer ${
                isRefreshing ? 'animate-spin text-brass-400' : ''
              }` }
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-xl bg-ink-700 border border-ink-700 text-ink-300 hover:text-white hover:bg-ink-700 transition-all relative cursor-pointer"
                title={t('التنبيهات والإشعارات اللحظية', 'Live Notifications')}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-brass-400 animate-pulse" />
              </button>

              {showNotifications && (
                <div className="absolute top-full mt-2 left-0 rtl:left-auto rtl:right-0 w-80 bg-pine-950 border border-ink-700 rounded-2xl shadow-2xl p-3 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-ink-700">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-brass-400" />
                      <span>{t('تنبيهات العمليات الحية', 'Live Operations Feed')}</span>
                    </span>
                    <span className="text-[10px] font-bold text-brass-400 bg-pine-950 px-2 py-0.5 rounded-full border border-pine-800">
                      {ops ? `${ops.activity.length} ${t('أحداث', 'events')}` : t('جارٍ التحميل…', 'Loading…')}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {!ops && (
                      <p className="text-xs text-ink-500 p-2">{t('جارٍ تحميل الأحداث…', 'Loading events…')}</p>
                    )}
                    {ops && ops.activity.length === 0 && (
                      <p className="text-xs text-ink-500 p-2">
                        {t('لا أحداث تشغيلية مسجلة بعد', 'No operational events logged yet')}
                      </p>
                    )}
                    {ops?.activity.map((n) => (
                      <div
                        key={n.id}
                        className="p-2 rounded-xl bg-ink-700/80 border border-ink-700/60 text-xs hover:bg-ink-700 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-pine-200">{t(n.messageAr, n.messageEn ?? '')}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border flex-shrink-0 ${LEVEL_STYLES[n.level] ?? LEVEL_STYLES.info}`}>
                            {t(n.level === 'success' ? 'ناجح' : n.level === 'warning' ? 'تنبيه' : 'معلومة',
                               n.level === 'success' ? 'OK' : n.level === 'warning' ? 'Alert' : 'Info')}
                          </span>
                        </div>
                        <span className="text-[10px] text-ink-500 mt-1 block">{minutesAgoLabel(n.createdAt, t)}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => onOpenAddModal('broadcast')}
                    className="w-full mt-2 py-1.5 bg-pine-700/30 hover:bg-pine-700/50 text-brass-300 text-xs font-bold rounded-lg border border-pine-500/30 transition-colors text-center block cursor-pointer"
                  >
                    {t('إرسال تعميم أو تنبيه عاجل', 'Broadcast Urgent Alert')}
                  </button>
                </div>
              )}
            </div>

            {/* Session Identity — the signed-in ADMIN account */}
            <div className="flex items-center gap-2 bg-pine-800 border border-ink-700 px-3 py-1.5 rounded-xl">
              <div className="w-7 h-7 rounded-lg bg-brass-400 text-pine-950 flex items-center justify-center text-xs font-extrabold border border-brass-300">
                {adminInitial}
              </div>
              <div className="text-start hidden sm:block">
                <div dir="ltr" className="text-xs font-extrabold text-white leading-tight font-mono">
                  {serverUser?.email ?? ''}
                </div>
                <div className="text-[10px] text-brass-300 leading-tight">
                  {t('مدير النظام - صلاحيات كاملة', 'System Administrator - Full Access')}
                </div>
              </div>
            </div>

            {/* Quick Action Button & Dropdown for All Resources */}
            <div className="relative">
              <button
                onClick={() => setAddMenuOpen(!addMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-pine-700 hover:bg-pine-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t('إضافة مورد جديد', 'Quick Add')}</span>
                <ChevronDown className="w-3 h-3 ml-0.5 text-pine-200" />
              </button>

              {addMenuOpen && (
                <div className="absolute top-full mt-2 left-0 rtl:left-auto rtl:right-0 w-64 bg-ink-900 border border-ink-700 rounded-2xl shadow-2xl p-2 z-50 animate-fadeIn">
                  <div className="px-3 py-1.5 border-b border-ink-700 mb-1">
                    <span className="text-[11px] font-bold text-ink-400 block">
                      {t('إضافة مورد جديد للنظام:', 'Add New Hospital Resource:')}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        onOpenAddModal('surgery');
                        setAddMenuOpen(false);
                      }}
                      className="w-full p-2 rounded-xl flex items-center gap-2.5 text-start hover:bg-ink-700 text-pine-200 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                    >
                      <div className="p-1.5 rounded-lg bg-pine-500/20 text-brass-300">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div>{t('حجز عملية جراحية', 'Schedule Surgery Case')}</div>
                        <div className="text-[10px] text-ink-500 font-normal">{t('إدراج مريض في الجدول', 'Add patient to OR pipeline')}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAddModal('staff');
                        setAddMenuOpen(false);
                      }}
                      className="w-full p-2 rounded-xl flex items-center gap-2.5 text-start hover:bg-ink-700 text-pine-200 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                    >
                      <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-300">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <div>{t('إضافة كادر طبي / تمريضي', 'Add Staff Member')}</div>
                        <div className="text-[10px] text-ink-500 font-normal">{t('طبيب، جراح، تمريض، فني', 'Doctor, nurse, technician')}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAddModal('room');
                        setAddMenuOpen(false);
                      }}
                      className="w-full p-2 rounded-xl flex items-center gap-2.5 text-start hover:bg-ink-700 text-pine-200 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                    >
                      <div className="p-1.5 rounded-lg bg-brass-500/20 text-brass-300">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <div>{t('إضافة جناح / غرفة عمليات', 'Add Room / Suite')}</div>
                        <div className="text-[10px] text-ink-500 font-normal">{t('غرفة عمليات، عيادة، مختبر', 'Theater, clinic, diagnostic lab')}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAddModal('equipment');
                        setAddMenuOpen(false);
                      }}
                      className="w-full p-2 rounded-xl flex items-center gap-2.5 text-start hover:bg-ink-700 text-pine-200 hover:text-white transition-colors cursor-pointer text-xs font-bold"
                    >
                      <div className="p-1.5 rounded-lg bg-pine-500/20 text-pine-300">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <div>
                        <div>{t('إضافة جهاز طبي / ليزك', 'Add Medical Equipment')}</div>
                        <div className="text-[10px] text-ink-500 font-normal">{t('تسجيل جهاز ومعايرة', 'Device registry & calibration')}</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAddModal('broadcast');
                        setAddMenuOpen(false);
                      }}
                      className="w-full p-2 rounded-xl flex items-center gap-2.5 text-start hover:bg-ink-700 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer text-xs font-bold border-t border-ink-700/80 mt-1 pt-2"
                    >
                      <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
                        <Radio className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <div>{t('بث تعميم أو نداء عاجل', 'Urgent Broadcast')}</div>
                        <div className="text-[10px] text-rose-400/80 font-normal">{t('إشعار فوري لجميع الشاشات', 'Direct alert to all screens')}</div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
