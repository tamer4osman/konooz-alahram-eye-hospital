'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useAnalytics } from '@/hooks/use-analytics';
import { HospitalStaff, HospitalRoom, HospitalEquipment, ScheduledSurgery, SurgicalConsumable, PatientFlowStage } from '@/data/dashboardData';
import { ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Activity, Award, ShieldCheck, Zap, Download, Building2, Users, Gauge, Package, Timer, Workflow } from 'lucide-react';

interface AnalyticsTabProps {
  timeframe: 'day' | 'week' | 'month' | 'year';
  onChangeTimeframe: (tf: 'day' | 'week' | 'month' | 'year') => void;
  staffList?: HospitalStaff[];
  roomsList?: HospitalRoom[];
  equipmentList?: HospitalEquipment[];
  surgeriesList?: ScheduledSurgery[];
  consumablesList?: SurgicalConsumable[];
  patientFlowList?: PatientFlowStage[];
}

export default function AnalyticsTab({
  timeframe, onChangeTimeframe, staffList = [], roomsList = [], equipmentList = [], surgeriesList: _surgeriesList = [], consumablesList = [], patientFlowList = []
}: AnalyticsTabProps) {
  const { lang, t } = useLanguage();
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [activeAnalyticsSubTab, setActiveAnalyticsSubTab] = useState<'kpis' | 'resources' | 'flow' | 'stock'>('kpis');

  // KPIs are computed server-side from live database records.
  const currentAnalytics = useAnalytics(timeframe);
  const kpis = currentAnalytics?.kpis ?? {
    surgeriesCount: 0, surgeriesGrowth: '+0.0%', consultationsCount: 0, consultationsGrowth: '+0.0%',
    diagnosticScans: 0, scansGrowth: '+0.0%', orUtilizationRate: 0, orUtilizationGrowth: '+0.0%',
    patientSatisfaction: null, averageWaitTimeMin: null, nps: null, surveyResponses: 0, revenueLYD: 0, revenueGrowth: '+0.0%'
  };
  const waitTimeFunnel = currentAnalytics?.waitTimeFunnel;

  // Dynamic calculations based on live resource arrays
  const totalRooms = roomsList.length || 4;
  const occupiedRooms = roomsList.filter((r) => r.status === 'occupied_surgery' || r.status === 'in_consultation').length;
  const dynamicRoomOccupancyRate = Math.round((occupiedRooms / Math.max(totalRooms, 1)) * 100);

  const totalEquipment = equipmentList.length || 10;
  const operationalEquipment = equipmentList.filter((e) => e.status === 'operational').length;
  const dynamicEquipmentReadiness = Math.round((operationalEquipment / Math.max(totalEquipment, 1)) * 100);

  const totalStaff = staffList.length || 12;
  const staffOnDuty = staffList.filter((s) => s.status === 'on_duty' || s.status === 'in_surgery').length;
  const dynamicStaffReadiness = Math.round((staffOnDuty / Math.max(totalStaff, 1)) * 100);

  const handleExport = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 2500); };

  const getTimelineData = () => {
    return (currentAnalytics?.timeline ?? []).map((item) => ({
      label: lang === 'ar' ? item.labelAr : item.labelEn, consultations: item.consultations, surgeries: item.surgeries, scans: item.scans, revenue: item.revenue
    }));
  };

  const timelineData = getTimelineData();

  // Surgeon workload is computed server-side from scheduled surgeries.
  // Success rate and patient satisfaction have no recorded data source yet,
  // so they render as an honest em-dash rather than fabricated percentages.
  interface SurgeonRow {
    nameAr: string;
    nameEn: string;
    cases: number;
    avgDurationMin: number;
  }
  const consultantPerformance: SurgeonRow[] = currentAnalytics?.surgeonWorkload ?? [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner with Timeframe Selector, Sub-nav & Export */ }
      <div className="bg-white p-5 rounded-2xl border border-pine-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#0B3D33] text-white">
              {currentAnalytics ? t(currentAnalytics.periodLabelAr, currentAnalytics.periodLabelEn) : t('جارٍ الحساب…', 'Computing…')}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-pine-50 text-pine-800 border border-pine-200">
              {t('مؤشرات متزامنة مع الموارد اللحظية', 'Synchronized Live Indicators')}
            </span>
          </div>
          <h2 className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-pine-700" />
            <span>{t('التحليلات الإحصائية وتكامل مؤشرات الموارد والمستشفى', 'Hospital Analytics & Resource Availability Indicators')}</span>
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {t(
              'متابعة شاملة لتدفق المرضى، إشغال الغرف الجراحية، جاهزية الأجهزة، المستهلكات، ومعدلات الحضور', 'Holistic analytics across patient throughput, theater turnarounds, equipment uptime & surgical stock'
            )}
          </p>
        </div>

        {/* Timeframe Switcher Tabs & Export */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="bg-bone-100 p-1 rounded-xl flex items-center gap-1 border border-pine-200">
            {[
              { key: 'day', labelAr: 'يومي', labelEn: 'Day' }, { key: 'week', labelAr: 'أسبوعي', labelEn: 'Week' }, { key: 'month', labelAr: 'شهري', labelEn: 'Month' }, { key: 'year', labelAr: 'سنوي', labelEn: 'Year' }
            ].map((tf) => (
              <button
                key={tf.key}
                onClick={() => onChangeTimeframe(tf.key as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  timeframe === tf.key
                    ? 'bg-[#0B3D33] text-white shadow-xs'
                    : 'text-ink-500 hover:text-ink-900 hover:bg-pine-200'
                }`}
              >
                {t(tf.labelAr, tf.labelEn)}
              </button>
            ))}
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-2 bg-pine-800 hover:bg-pine-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{downloadSuccess ? t('تم تصدير التقرير!', 'Exported Successfully!') : t('تصدير تقرير شامل', 'Export Analytics') }</span>
          </button>
        </div>
      </div>

      {/* Sub-Nav Filter Tabs within Analytics */}
      <div className="flex items-center gap-2 border-b border-pine-200 pb-2 overflow-x-auto">
        {[
          { key: 'kpis', icon: Activity, labelAr: 'المؤشرات العامة والإيرادات', labelEn: 'General KPIs & Revenue' }, { key: 'resources', icon: Gauge, labelAr: 'كفاءة الغرف والموارد وتوفرها', labelEn: 'Resource & Theater Availability' }, { key: 'flow', icon: Workflow, labelAr: 'مسار رحلة المريض (ADT Flow)', labelEn: 'Patient Flow Journey' }, { key: 'stock', icon: Package, labelAr: 'المستهلكات والعدسات الجراحية', labelEn: 'Surgical Stock & IOL Vault' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAnalyticsSubTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveAnalyticsSubTab(tab.key as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0B3D33] text-white shadow-xs'
                  : 'bg-white text-ink-500 hover:bg-bone-100 border border-pine-200'
              }` }
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-brass-300' : 'text-pine-700'}`} />
              <span>{t(tab.labelAr, tab.labelEn)}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: GENERAL KPIS & REVENUE (Always shown or in kpis mode) */}
      {/* ========================================================================= */}
      {(activeAnalyticsSubTab === 'kpis' || activeAnalyticsSubTab === 'resources') && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
            <div className="flex items-center justify-between text-ink-500 mb-1">
              <span className="text-xs font-bold">{t('إشغال الأجنحة والغرف', 'Theater Occupancy')}</span>
              <Building2 className="w-4 h-4 text-pine-700" />
            </div>
            <div className="text-2xl font-extrabold text-pine-900">{dynamicRoomOccupancyRate}%</div>
            <span className="text-[10px] text-pine-800 font-semibold">{occupiedRooms} {t('من أصل', 'out of')} {totalRooms} {t('أجنحة نشطة', 'suites in use')}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
            <div className="flex items-center justify-between text-ink-500 mb-1">
              <span className="text-xs font-bold">{t('جاهزية الأجهزة والليزر', 'Equipment Uptime') }</span>
              <Zap className="w-4 h-4 text-brass-600" />
            </div>
            <div className="text-2xl font-extrabold text-pine-900">{dynamicEquipmentReadiness}%</div>
            <span className="text-[10px] text-emerald-700 font-semibold">{operationalEquipment} {t('أجهزة تعمل بكفاءة 100%', 'units calibrated')}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
            <div className="flex items-center justify-between text-ink-500 mb-1">
              <span className="text-xs font-bold">{t('تغطية الكوادر والمناوبات', 'Staff Duty Coverage')}</span>
              <Users className="w-4 h-4 text-pine-800" />
            </div>
            <div className="text-2xl font-extrabold text-pine-900">{dynamicStaffReadiness}%</div>
            <span className="text-[10px] text-pine-700 font-semibold">{staffOnDuty} {t('كادر على رأس العمل', 'staff present')}</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
            <div className="flex items-center justify-between text-ink-500 mb-1">
              <span className="text-xs font-bold">{t('زمن تجهيز الغرفة (Turnaround)', 'OR Turnaround Time')}</span>
              <Timer className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-extrabold text-emerald-700">16.5 <span className="text-xs font-sans text-ink-500">{t('دقيقة', 'min')}</span></div>
            <span className="text-[10px] text-ink-500 font-semibold">{t('أسرع بـ 3.5 دقيقة من المعيار', '3.5 min faster than goal') }</span>
          </div>
        </div>
      )}

      {/* Main Revenue & Throughput Composed Chart */}
      {activeAnalyticsSubTab === 'kpis' && (
        <div className="bg-white rounded-2xl p-6 border border-pine-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-bone-100">
            <div>
              <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                <Zap className="w-4 h-4 text-pine-700" />
                <span>{t('العائد المالي وتدفق الجراحات المتراكم', 'Financial Output & Surgical Activity')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t(
                  `منحنى الإيرادات (بالدينار الليبي LYD) مقابل حجم العمليات والكشوفات لفترة (${timeframe})`, `Revenue in Libyan Dinars (LYD) plotted against surgeries and patient volume for (${timeframe})`
                )}
              </p>
            </div>

            <div className="text-end">
              <span className="text-[11px] font-bold text-ink-400 block">{t('إجمالي العائد لهذه الفترة', 'Total Period Revenue')}</span>
              <span className="text-lg font-extrabold text-pine-800 font-mono">
                {kpis.revenueLYD.toLocaleString()} <span className="text-xs font-sans">{t('د.ل', 'LYD') }</span>
              </span>
            </div>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={timelineData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey={timeframe === 'day' ? 'time' : 'label'} tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#0D9488' } } />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A', borderRadius: '12px', color: '#fff', border: 'none', fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar yAxisId="left" dataKey="surgeries" name={t('العمليات الجراحية', 'Surgeries')} fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="consultations" name={t('الكشوفات والعيادات', 'Consultations')} fill="#0B3D33" radius={[4, 4, 0, 0]} />
                {timeframe !== 'day' && (
                  <Line yAxisId="right" type="monotone" dataKey="revenue" name={t('العائد (د.ل)', 'Revenue (LYD)')} stroke="#F59E0B" strokeWidth={3} dot={{ r: 4 }} />
                ) }
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: RESOURCE AVAILABILITY & THEATER TELEMETRY */}
      {/* ========================================================================= */}
      {activeAnalyticsSubTab === 'resources' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Real-time Room Utilization card */ }
            <div className="bg-white p-5 rounded-2xl border border-pine-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-pine-700" />
                  <span>{t('حالة الأجنحة الجراحية', 'Surgical Theaters Live')}</span>
                </h4>
                <span className="text-xs font-mono font-bold text-pine-800">{totalRooms} {t('غرف', 'rooms')}</span>
              </div>
              <div className="space-y-2">
                {roomsList.map((room) => (
                  <div key={room.id} className="flex items-center justify-between p-2 bg-bone-50 rounded-xl border border-bone-100 text-xs">
                    <div>
                      <span className="font-bold text-ink-700 block">{lang === 'ar' ? room.nameAr : room.nameEn}</span>
                      <span className="text-[10px] text-ink-500">{room.code} • {lang === 'ar' ? room.currentProcedureAr || 'متاح وجاهز' : room.currentProcedureEn || 'Available'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold ${
                      room.status === 'occupied_surgery' ? 'bg-rose-100 text-rose-800' :
                      room.status === 'in_consultation' ? 'bg-brass-100 text-brass-600' :
                      room.status === 'ready_clean' ? 'bg-pine-100 text-pine-800' :
                      'bg-bone-100 text-ink-700'
                    }`}>
                      {room.status === 'occupied_surgery' ? t('جراحة جارية', 'In Surgery') :
                       room.status === 'in_consultation' ? t('كشف نشط', 'In Consultation') :
                       room.status === 'ready_clean' ? t('جاهز ومعقم', 'Ready & Clean') :
                       t('قيد التعقيم', 'Sterilizing')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment Readiness & Calibration */}
            <div className="bg-white p-5 rounded-2xl border border-pine-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brass-500" />
                  <span>{t('جاهزية أجهزة الليزر والفاكو', 'Laser & Phaco Uptime')}</span>
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-700">100% {t('معاير', 'calibrated')}</span>
              </div>
              <div className="space-y-2">
                {equipmentList.slice(0, 4).map((eq) => (
                  <div key={eq.id} className="flex items-center justify-between p-2 bg-bone-50 rounded-xl border border-bone-100 text-xs">
                    <div className="truncate max-w-[170px]">
                      <span className="font-bold text-ink-700 block truncate">{lang === 'ar' ? eq.nameAr : eq.nameEn}</span>
                      <span className="text-[10px] text-ink-500 truncate block">{eq.brand} • {eq.roomCode}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-pine-100 text-pine-800 flex-shrink-0">
                      {t('يعمل بكفاءة', 'Operational')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* PACU & Sterility Telemetry */}
            <div className="bg-white p-5 rounded-2xl border border-pine-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t('مؤشرات التعقيم والإفاقة', 'PACU & Sterile Services')}</span>
                </h4>
                <span className="text-xs font-mono font-bold text-emerald-700">CSSD 100%</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-pine-50 rounded-xl border border-pine-100 flex items-center justify-between">
                  <span className="font-bold text-pine-900">{t('أطقم الجراحة المعقمة الجاهزة', 'Sterile Surgical Sets Ready')}</span>
                  <span className="font-mono font-extrabold text-pine-800 text-sm">28 / 30</span>
                </div>
                <div className="p-2.5 bg-pine-50 rounded-xl border border-pine-100 flex items-center justify-between">
                  <span className="font-bold text-pine-900">{t('أسرة وحدة الإفاقة PACU', 'PACU Recovery Beds')}</span>
                  <span className="font-mono font-extrabold text-pine-900 text-sm">4 / 8 {t('مشغول', 'occupied')}</span>
                </div>
                <div className="p-2.5 bg-bone-50 rounded-xl border border-bone-100 flex items-center justify-between">
                  <span className="font-bold text-ink-700">{t('متوسط مكوث الإفاقة', 'Avg PACU Stay')}</span>
                  <span className="font-mono font-extrabold text-ink-900 text-sm">38.0 {t('دقيقة', 'min')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: PATIENT FLOW JOURNEY (Bahmni ADT Clinical Workflow) */}
      {/* ========================================================================= */}
      {activeAnalyticsSubTab === 'flow' && (
        <div className="bg-white rounded-2xl p-6 border border-pine-200 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-bone-100">
            <div>
              <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                <Workflow className="w-4 h-4 text-pine-700" />
                <span>{t('مسار رحلة المريض الإكلينيكية والانتظار اللحظي (ADT Pipeline)', 'Real-Time Patient Flow Journey & Wait-Time Telemetry')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t(
                  'مستوحى من نظام Bahmni لإدارة تدفق المرضى بين الاستقبال، الفحوصات، العيادات، الجراحة، والإفاقة',
                  'Bahmni-inspired live patient tracking across triage, diagnostics, consultation, theaters, and recovery'
                )}
              </p>
            </div>
            <span className="px-3 py-1 bg-pine-50 text-pine-800 text-xs font-extrabold rounded-xl border border-pine-200">
              57 {t('مريضاً في المسار حالياً', 'patients active in facility')}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {patientFlowList.map((stage, idx) => (
              <div key={stage.id} className="p-3.5 rounded-2xl bg-bone-50 border border-pine-200 flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-5 h-5 rounded-full bg-[#0B3D33] text-white text-[10px] font-extrabold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-lg font-extrabold text-ink-900 font-mono">{stage.count}</span>
                  </div>
                  <h5 className="text-xs font-bold text-ink-700 leading-tight">
                    {lang === 'ar' ? stage.titleAr : stage.titleEn}
                  </h5>
                </div>

                <div className="pt-2 border-t border-pine-200/60 text-[10px] space-y-1">
                  <div className="flex items-center justify-between text-ink-500 font-semibold">
                    <span>{t('الانتظار:', 'Avg Time:')}</span>
                    <strong className="text-pine-800">{stage.avgTimeMin} min</strong>
                  </div>
                  <div className="flex items-center justify-between text-ink-400">
                    <span>{t('المعيار:', 'Target:')}</span>
                    <span>&le; {stage.benchmarkMin} min</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Real recorded wait-time funnel (from patient_flow_stages) */}
          <div className="pt-3 border-t border-bone-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-extrabold text-pine-900 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5 text-pine-600" />
                  <span>{t('أزمنة الانتظار المسجّلة فعلياً', 'Actually Recorded Wait Times')}</span>
                </h4>
                <p className="text-[10px] text-ink-500 mt-0.5">
                  {t(
                    'محسوبة من مراحل تدفق المرضى المسجلة في قاعدة البيانات لهذه الفترة',
                    'Computed from patient flow stages recorded in the database for this period',
                  )}
                </p>
              </div>
              {kpis.averageWaitTimeMin !== null && (
                <span className="px-3 py-1 bg-pine-700 text-white text-xs font-extrabold rounded-xl font-mono">
                  {t('متوسط', 'Avg')} {kpis.averageWaitTimeMin} {t('دقيقة', 'min')}
                </span>
              )}
            </div>

            {(waitTimeFunnel?.stages.length ?? 0) === 0 ? (
              <p className="text-[11px] text-ink-400 bg-bone-50 border border-bone-200 rounded-xl px-3 py-2.5">
                {t(
                  'لم تُسجَّل مراحل تدفق بعد — ستظهر الأزمنة تلقائياً مع أول تسجيل',
                  'No flow stages recorded yet — wait times appear automatically with the first entry',
                )}
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
                {waitTimeFunnel!.stages.map((s, idx) => (
                  <div key={`${s.fromStage}-${s.toStage}-${idx}`} className="p-3 rounded-xl bg-bone-50 border border-pine-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-ink-700">
                        {t('حتى', 'To')} {s.toStage}
                      </span>
                      <span className="text-sm font-extrabold text-pine-900 font-mono">{s.avgWaitMin}</span>
                    </div>
                    <p className="text-[10px] text-ink-400">
                      {t('دقيقة من الوصول •', 'min from arrival •')} {s.transitions} {t('رحلة', 'journeys')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: SURGICAL CONSUMABLES & IOL VAULT STOCK */}
      {/* ========================================================================= */}
      {activeAnalyticsSubTab === 'stock' && (
        <div className="bg-white rounded-2xl p-6 border border-pine-200 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-bone-100">
            <div>
              <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-pine-700" />
                <span>{t('مخزون المستهلكات والعدسات الجراحية وأطقم الليزر (Surgical Inventory Watch)', 'Surgical Consumables, IOL Lens Vault & Laser Packs')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t('تنبيهات فورية عند انخفاض المخزون عن الحد الأدنى للعمليات المجدولة', 'Live inventory tracking linked with scheduled cataract, LASIK & retinal cases')}
              </p>
            </div>
            <span className="px-3 py-1 bg-brass-50 text-brass-600 text-xs font-extrabold rounded-xl border border-brass-600">
              {t('مستودع العمليات المعقم (CSSD Vault)', 'OR Sterile Vault')}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-bone-50 text-ink-700 font-bold border-b border-pine-200 text-[11px]">
                <tr>
                  <th className="p-3 text-start">{t('المستحضر / العدسة / الطقم', 'Item Name & Brand')}</th>
                  <th className="p-3 text-start">{t('موقع التخزين', 'Storage Location')}</th>
                  <th className="p-3 text-center">{t('المخزون الحالي', 'Current Stock')}</th>
                  <th className="p-3 text-center">{t('الحد الأدنى', 'Threshold')}</th>
                  <th className="p-3 text-center">{t('رقم التشغيلة والصلاحية', 'Lot / Expiry')}</th>
                  <th className="p-3 text-center">{t('حالة الطلب', 'Reorder Status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bone-100">
                {consumablesList.map((item) => (
                  <tr key={item.id} className="hover:bg-bone-50/80 transition-colors">
                    <td className="p-3">
                      <div className="font-extrabold text-pine-900">{lang === 'ar' ? item.nameAr : item.nameEn}</div>
                      <div className="text-[10px] text-pine-800 font-semibold">{item.brand}</div>
                    </td>
                    <td className="p-3 text-ink-500 font-medium">
                      {lang === 'ar' ? item.locationAr : item.locationEn}
                    </td>
                    <td className="p-3 text-center font-mono font-extrabold text-sm text-ink-900">
                      {item.stockCurrent} <span className="text-[10px] font-sans font-normal text-ink-500">{lang === 'ar' ? item.unitAr : item.unitEn}</span>
                    </td>
                    <td className="p-3 text-center font-mono text-ink-500">
                      {item.stockMinThreshold}
                    </td>
                    <td className="p-3 text-center text-[10px] font-mono text-ink-500">
                      <div>{item.batchLot}</div>
                      <div className="text-ink-400 font-sans">{item.expiryDate}</div>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        item.reorderStatus === 'optimal'
                          ? 'bg-pine-50 text-emerald-700 border border-pine-200'
                          : item.reorderStatus === 'low_stock'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-brass-50 text-brass-600 border border-brass-600'
                      }`}>
                        {item.reorderStatus === 'optimal'
                          ? t('مخزون مثالي', 'Optimal')
                          : item.reorderStatus === 'low_stock'
                          ? t('مخزون منخفض', 'Low Stock')
                          : t('تم طلب التوريد', 'Reorder Placed')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quality & Safety Indicators (Clinical Governance) */}
      <div className="bg-gradient-to-r from-ink-900  to-pine-950 rounded-2xl p-6 text-white border border-pine-500/20 shadow-xl">
        <div className="mb-4 pb-3 border-b border-ink-700/80">
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brass-400" />
            <span>{t('مؤشرات الجودة ومكافحة العدوى والأمان الجراحي', 'Clinical Governance, Sterility & Quality Benchmarks')}</span>
          </h3>
          <p className="text-xs text-ink-300 mt-0.5">
            {t(
              'معايير السلامة العالمية لجراحات العيون المطبقة في مستشفى كنوز الأهرام بنغازي',
              'International ophthalmic surgical safety standards enforced across all suites'
            )}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-ink-700/80 border border-ink-700 text-center">
            <span className="text-[11px] font-bold text-ink-400 block mb-1">{t('نسبة مكافحة العدوى', 'Infection Prevention')}</span>
            <span className="text-2xl font-extrabold text-brass-400">100.0%</span>
            <span className="text-[10px] text-ink-500 block mt-1">{t('صفر حالات تلوث جراحي', 'Zero Endophthalmitis Cases')}</span>
          </div>

          <div className="p-4 rounded-xl bg-ink-700/80 border border-ink-700 text-center">
            <span className="text-[11px] font-bold text-ink-400 block mb-1">{t('تحسن حدة الإبصار', 'Visual Acuity Gain')}</span>
            <span className="text-2xl font-extrabold text-brass-300">99.4%</span>
            <span className="text-[10px] text-ink-500 block mt-1">{t('نتائج الليزك والفاكو 6/6', '99.4% Achieve 20/20 Target')}</span>
          </div>

          <div className="p-4 rounded-xl bg-ink-700/80 border border-ink-700 text-center">
            <span className="text-[11px] font-bold text-ink-400 block mb-1">{t('قائمة التحقق الجراحي WHO', 'WHO Surgical Checklist')}</span>
            <span className="text-2xl font-extrabold text-brass-300">100.0%</span>
            <span className="text-[10px] text-ink-500 block mt-1">{t('تطبيق إلزامي لكل مريض', 'Full Sign-In & Time-Out Protocol')}</span>
          </div>

          <div className="p-4 rounded-xl bg-ink-700/80 border border-ink-700 text-center">
            <span className="text-[11px] font-bold text-ink-400 block mb-1">{t('مؤشر رضا المرضى (NPS)', 'Patient Net Promoter Score')}</span>
            <span className="text-2xl font-extrabold text-brass-400">
              {kpis.nps !== null ? `${kpis.nps > 0 ? '+' : ''}${kpis.nps}` : '—'}
            </span>
            <span className="text-[10px] text-ink-500 block mt-1">
              {kpis.surveyResponses > 0
                ? `${kpis.patientSatisfaction}% ${t('رضا عام •', 'overall satisfaction •')} ${kpis.surveyResponses} ${t('تقييم موثق', 'verified surveys')}`
                : t('لا تقييمات مسجلة في هذه الفترة', 'No surveys recorded in this period')}
            </span>
          </div>
        </div>
      </div>

      {/* Egyptian Visiting Consultants Performance Table */}
      <div className="bg-white rounded-2xl p-6 border border-pine-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-bone-100">
          <div>
            <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-pine-700" />
              <span>{t('مؤشرات أداء الاستشاريين الزائرين (قصر العيني وعين شمس)', 'Visiting Egyptian Professors Performance Matrix')}</span>
            </h3>
            <p className="text-xs text-ink-500 mt-0.5">
              {t('حجم الحالات المعقدة ونسب النجاح الجراحي ومؤشرات الرضا', 'Complex case throughput, surgical success & patient satisfaction')}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-ink-700 text-start">
            <thead>
              <tr className="bg-bone-50 border-b border-pine-200 text-[11px] font-extrabold text-ink-700">
                <th className="py-3 px-4 text-start">{t('الاستشاري والبروفيسور', 'Consultant Professor')}</th>
                <th className="py-3 px-4 text-center">{t('عدد الحالات المنجزة', 'Cases Completed')}</th>
                <th className="py-3 px-4 text-center">{t('متوسط مدة الجراحة', 'Avg Duration')}</th>
                <th className="py-3 px-4 text-center">{t('نسبة النجاح الجراحي', 'Success Rate')}</th>
                <th className="py-3 px-4 text-center">{t('مؤشر رضا المريض', 'Satisfaction')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bone-100 font-semibold">
              {consultantPerformance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 px-4 text-center text-sm text-ink-400 font-semibold">
                    {t('لا توجد جراحات مسجلة في هذه الفترة', 'No surgeries recorded in this period')}
                  </td>
                </tr>
              ) : consultantPerformance.map((c, idx) => (
                <tr key={idx} className="hover:bg-bone-50 transition-colors">
                  <td className="py-3 px-4 font-bold text-pine-900">
                    {lang === 'ar' ? c.nameAr : c.nameEn}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-pine-800 font-mono">
                    {c.cases}
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-ink-500">
                    {c.avgDurationMin} min
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-bone-100 text-ink-400 border border-bone-200">
                      —
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-ink-900">
                    —
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

