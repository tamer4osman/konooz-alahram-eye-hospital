'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  ANALYTICS_DATA,
  HospitalStaff,
  HospitalRoom,
  HospitalEquipment,
  ScheduledSurgery
} from '@/data/dashboardData';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Activity, Users, Building2, Cpu, Calendar, TrendingUp, Stethoscope, HeartPulse, Eye, ShieldCheck, Zap, ArrowUpRight } from 'lucide-react';

interface OverviewTabProps {
  timeframe: 'day' | 'week' | 'month' | 'year';
  staffList: HospitalStaff[];
  roomsList: HospitalRoom[];
  equipmentList: HospitalEquipment[];
  surgeriesList: ScheduledSurgery[];
  onSelectTab: (tabId: string) => void;
  onUpdateSurgeryStatus: (id: string, status: any) => void;
  onUpdateRoomStatus: (id: string, status: any) => void; }

export default function OverviewTab({
  timeframe, staffList, roomsList, equipmentList, surgeriesList, onSelectTab
}: OverviewTabProps) {
  const { lang, t, } = useLanguage();

  const currentAnalytics = ANALYTICS_DATA[timeframe];
  const kpis = currentAnalytics.kpis;

  // Real-time Counts
  const onDutyStaff = staffList.filter((s) => s.status === 'on_duty' || s.status === 'in_surgery').length;
  const _inSurgeryStaff = staffList.filter((s) => s.status === 'in_surgery').length;
  const occupiedRooms = roomsList.filter((r) => r.status === 'occupied_surgery' || r.status === 'in_consultation').length;
  const readyRooms = roomsList.filter((r) => r.status === 'ready_clean').length;
  const _inUseEquipment = equipmentList.filter((e) => e.status === 'in_use').length;
  const operationalEquipment = equipmentList.filter((e) => e.status === 'operational' || e.status === 'in_use').length;

  // Dynamic Chart Data based on timeframe
  const getTimelineData = () => {
    if (timeframe === 'day') {
      return (currentAnalytics as any).hourlyTimeline;
    }
    if (timeframe === 'week') {
      return (currentAnalytics as any).daysTimeline.map((item: any) => ({
        label: lang === 'ar' ? item.dayAr : item.dayEn, consultations: item.consultations, surgeries: item.surgeries, scans: item.scans, revenue: item.revenue
      })); }
    if (timeframe === 'month') {
      return (currentAnalytics as any).weeksTimeline.map((item: any) => ({
        label: lang === 'ar' ? item.weekAr : item.weekEn, consultations: item.consultations, surgeries: item.surgeries, scans: item.scans, revenue: item.revenue
      }));
    }
    return (currentAnalytics as any).monthsTimeline.map((item: any) => ({
      label: lang === 'ar' ? item.monthAr : item.monthEn, consultations: item.consultations, surgeries: item.surgeries, scans: item.scans, revenue: item.revenue
    })); };

  const timelineData = getTimelineData();
  const departmentData = currentAnalytics.departmentWorkload.map((d: any) => ({
    name: lang === 'ar' ? d.nameAr : d.nameEn,
    value: d.count,
    color: d.color
  }));

  const _activeSurgeries = surgeriesList.filter((s) => s.status === 'in_or' || s.status === 'pre_op_prep');

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner with Dynamic Period Title & Quick Health Matrix */}
      <div className="bg-gradient-to-r from-ink-900  to-pine-950 rounded-2xl p-5 sm:p-6 text-white border border-pine-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pine-500/20 text-brass-300 border border-brass-400/30">
              {t(currentAnalytics.periodLabelAr, currentAnalytics.periodLabelEn)}
            </span>
            <span className="text-xs text-ink-400">
              {t('تحديث فوري متزامن مع شبكة غرف العمليات', 'Live Sync with OR Telemetry')}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {t(
              'مؤشرات الأداء الشاملة ومراقبة تدفق المرضى والجراحات',
              'Comprehensive Performance Metrics & Surgical Throughput'
            )}
          </h2>
        </div>

        {/* Live Facility Ticker Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onSelectTab('personnel')}
            className="px-3 py-1.5 rounded-xl bg-ink-700/80 border border-ink-700/80 hover:border-pine-500 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Users className="w-4 h-4 text-brass-400" />
            <div className="text-start">
              <span className="text-[10px] text-ink-400 block">{t('الكادر على رأس العمل', 'On Duty Staff')}</span>
              <span className="text-xs font-bold text-white">{onDutyStaff} / {staffList.length}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('rooms')}
            className="px-3 py-1.5 rounded-xl bg-ink-700/80 border border-ink-700/80 hover:border-pine-500 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Building2 className="w-4 h-4 text-brass-400" />
            <div className="text-start">
              <span className="text-[10px] text-ink-400 block">{t('الغرف المشغولة', 'Occupied Rooms')}</span>
              <span className="text-xs font-bold text-white">{occupiedRooms} / {roomsList.length}</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('equipment')}
            className="px-3 py-1.5 rounded-xl bg-ink-700/80 border border-ink-700/80 hover:border-pine-500 flex items-center gap-2 cursor-pointer transition-all"
          >
            <Cpu className="w-4 h-4 text-brass-400" />
            <div className="text-start">
              <span className="text-[10px] text-ink-400 block">{t('جاهزية الأجهزة', 'Device Readiness')}</span>
              <span className="text-xs font-bold text-white">{operationalEquipment} / {equipmentList.length}</span>
            </div>
          </button>
        </div>
      </div>

      {/* KPI 6-Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        
        {/* 1. Surgeries KPI */}
        <div className="bg-white p-4 rounded-2xl border border-pine-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-pine-50 text-pine-800 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-pine-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {kpis.surgeriesGrowth}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-pine-900 tracking-tight">{kpis.surgeriesCount}</div>
          <div className="text-xs font-bold text-ink-500 mt-0.5">{t('العمليات الجراحية', 'Total Surgeries')}</div>
          <div className="text-[10px] text-ink-400 mt-1">{t('شبكية، ليزك، فاكو، حول', 'Retina, LASIK, Phaco')}</div>
        </div>

        {/* 2. Outpatient Consultations */}
        <div className="bg-white p-4 rounded-2xl border border-pine-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Stethoscope className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-pine-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {kpis.consultationsGrowth}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-pine-900 tracking-tight">{kpis.consultationsCount}</div>
          <div className="text-xs font-bold text-ink-500 mt-0.5">{t('الكشوفات والعيادات', 'Consultations')}</div>
          <div className="text-[10px] text-ink-400 mt-1">{t('استشاريون مصريون ومقيمون', 'Consultants & Residents')}</div>
        </div>

        {/* 3. Diagnostic Scans */}
        <div className="bg-white p-4 rounded-2xl border border-pine-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-pine-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {kpis.scansGrowth}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-pine-900 tracking-tight">{kpis.diagnosticScans}</div>
          <div className="text-xs font-bold text-ink-500 mt-0.5">{t('الفحوصات والأشعة (OCT)', 'Diagnostic Scans')}</div>
          <div className="text-[10px] text-ink-400 mt-1">{t('OCT, Pentacam, IOLMaster', 'OCT, Pentacam, Biometry')}</div>
        </div>

        {/* 4. OR Utilization Rate */}
        <div className="bg-white p-4 rounded-2xl border border-pine-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-brass-50 text-brass-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-pine-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {kpis.orUtilizationGrowth}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-pine-900 tracking-tight">{kpis.orUtilizationRate}%</div>
          <div className="text-xs font-bold text-ink-500 mt-0.5">{t('نسبة إشغال العمليات', 'OR Utilization')}</div>
          <div className="text-[10px] text-ink-400 mt-1">{t('كفاءة غرف العمليات الكبرى', 'Major OR Efficiency')}</div>
        </div>

        {/* 5. Patient Satisfaction */}
        <div className="bg-white p-4 rounded-2xl border border-pine-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-pine-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold text-pine-800 bg-pine-50 px-1.5 py-0.5 rounded-md">
              {kpis.averageWaitTimeMin} {t('دقيقة انتظار', 'min wait')}
            </span>
          </div>
          <div className="text-2xl font-extrabold text-pine-900 tracking-tight">{kpis.patientSatisfaction}%</div>
          <div className="text-xs font-bold text-ink-500 mt-0.5">{t('رضا المرضى وجودة الرعاية', 'Patient Satisfaction')}</div>
          <div className="text-[10px] text-ink-400 mt-1">{t('مؤشر التعافي بعد الجراحة', 'Post-Op Recovery Index')}</div>
        </div>

        {/* 6. Revenue Throughput in Libyan Dinars */}
        <div className="bg-white p-4 rounded-2xl border border-pine-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <span className="w-8 h-8 rounded-xl bg-pine-50 text-pine-700 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 bg-pine-50 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              {kpis.revenueGrowth}
            </span>
          </div>
          <div className="text-xl font-extrabold text-pine-900 tracking-tight font-mono">
            {kpis.revenueLYD.toLocaleString()} <span className="text-xs font-sans font-bold text-pine-800">{t('د.ل', 'LYD')}</span>
          </div>
          <div className="text-xs font-bold text-ink-500 mt-0.5">{t('العائد التشغيلي', 'Revenue Throughput')}</div>
          <div className="text-[10px] text-ink-400 mt-1">{t('إجمالي الخدمات الجراحية', 'Surgical & Diagnostic')}</div>
        </div>

      </div>

      {/* Main Charts Row: Throughput Breakdown Area/Bar + Department Share Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Multi-Period Throughput Chart (2 Columns) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-pine-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-bone-100">
            <div>
              <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-pine-700" />
                <span>{t('منحنى تدفق الخدمات الطبية والجراحات', 'Medical & Surgical Volume Trend')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t(
                  `مقارنة حجم الكشوفات، العمليات الجراحية، وفحوصات الأشعة عبر فترة (${timeframe})`,
                  `Consultations, Surgeries, and Imaging scans trend for (${timeframe})`
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-ink-500">
                <span className="w-3 h-3 rounded bg-[#0B3D33] inline-block" />
                <span>{t('كشوفات', 'Consultations')}</span>
              </span>
              <span className="flex items-center gap-1.5 text-ink-500">
                <span className="w-3 h-3 rounded bg-pine-500 inline-block" />
                <span>{t('عمليات', 'Surgeries')}</span>
              </span>
              <span className="flex items-center gap-1.5 text-ink-500">
                <span className="w-3 h-3 rounded bg-brass-500 inline-block" />
                <span>{t('أشعة', 'Scans')}</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {timeframe === 'day' ? (
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="consultationsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B3D33" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0B3D33" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="surgeriesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      fontSize: '12px'
                    }}
                  />
                  <Area type="monotone" dataKey="consultations" name={t('كشوفات', 'Consultations')} stroke="#0B3D33" strokeWidth={2.5} fillOpacity={1} fill="url(#consultationsGrad)" />
                  <Area type="monotone" dataKey="surgeries" name={t('عمليات', 'Surgeries')} stroke="#0D9488" strokeWidth={2.5} fillOpacity={1} fill="url(#surgeriesGrad)" />
                  <Area type="monotone" dataKey="scans" name={t('أشعة مقطعية', 'Scans')} stroke="#F59E0B" strokeWidth={2} fillOpacity={0.1} fill="#F59E0B" />
                </AreaChart>
              ) : (
                <BarChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#fff',
                      border: 'none',
                      boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="consultations" name={t('كشوفات', 'Consultations')} fill="#0B3D33" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="surgeries" name={t('عمليات', 'Surgeries')} fill="#0D9488" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="scans" name={t('أشعة مقطعية', 'Scans')} fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Case Share Donut Chart (1 Column) */}
        <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2 mb-1">
              <Eye className="w-4 h-4 text-pine-700" />
              <span>{t('توزيع الحالات حسب التخصص', 'Department Workload Share')}</span>
            </h3>
            <p className="text-xs text-ink-500 mb-2">
              {t('نسبة العمليات والكشوفات بكل قسم تخصصي', 'Surgical and clinical volume proportion')}
            </p>

            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {departmentData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '10px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '11px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs text-ink-400 font-bold">{t('الإجمالي', 'Total')}</span>
                <span className="text-lg font-extrabold text-pine-900">{kpis.surgeriesCount}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5 mt-2 pt-2 border-t border-bone-100 max-h-36 overflow-y-auto pr-1">
            {departmentData.map((dep: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-ink-700 truncate">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: dep.color }} />
                  <span className="truncate">{dep.name}</span>
                </span>
                <span className="font-extrabold text-pine-900 flex-shrink-0">{dep.value} {t('حالة', 'cases')}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bahmni-inspired Live Operations & Resource Telemetry Hub */}
      <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-bone-100">
          <div>
            <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
              <Zap className="w-4 h-4 text-pine-700" />
              <span>{t('لوحة التوجيه الإداري والجاهزية اللحظية للموارد والمناوبات', 'Live Resource Readiness & Attendance Control Matrix')}</span>
            </h3>
            <p className="text-xs text-ink-500 mt-0.5">
              {t(
                'مزامنة فورية بين حضور الكوادر الطبية، جاهزية أجنحة العمليات، مخزون العدسات، ومسار المرضى',
                'Live synchronization across clinical staffing, theater sterilization, IOL stock & patient queue'
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectTab('analytics')}
              className="px-3 py-1.5 bg-pine-50 hover:bg-pine-100 text-pine-800 text-xs font-bold rounded-xl border border-pine-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>{t('عرض التحليلات الشاملة', 'Full Analytics')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Card 1: Shift Attendance */}
          <button
            type="button"
            onClick={() => onSelectTab('personnel')}
            className="p-3.5 rounded-xl bg-bone-50 hover:bg-pine-50/50 border border-pine-200 hover:border-brass-300 transition-all cursor-pointer group text-start"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-ink-500 group-hover:text-pine-900">{t('انضباط الكوادر والبصمة', 'Staff Attendance')}</span>
              <Users className="w-4 h-4 text-pine-700" />
            </div>
            <div className="text-xl font-extrabold text-pine-900">{onDutyStaff} / {staffList.length}</div>
            <span className="text-[10px] text-emerald-700 font-semibold">{t('نسبة الحضور 96.4% اليوم', '96.4% on-time attendance')}</span>
          </button>

          {/* Card 2: Operating Suites */}
          <button
            type="button"
            onClick={() => onSelectTab('rooms')}
            className="p-3.5 rounded-xl bg-bone-50 hover:bg-pine-50/50 border border-pine-200 hover:border-brass-300 transition-all cursor-pointer group text-start"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-ink-500 group-hover:text-pine-900">{t('جاهزية أجنحة الجراحة', 'Surgical Theaters')}</span>
              <Building2 className="w-4 h-4 text-pine-800" />
            </div>
            <div className="text-xl font-extrabold text-pine-900">{roomsList.length} {t('أجنحة', 'Suites')}</div>
            <span className="text-[10px] text-pine-700 font-semibold">{readyRooms} {t('أجنحة جاهزة ومعقمة', 'clean & sterile ready')}</span>
          </button>

          {/* Card 3: High-Tech Lasers & Phaco */}
          <button
            type="button"
            onClick={() => onSelectTab('equipment')}
            className="p-3.5 rounded-xl bg-bone-50 hover:bg-pine-50/50 border border-pine-200 hover:border-brass-300 transition-all cursor-pointer group text-start"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-ink-500 group-hover:text-pine-900">{t('أجهزة الليزر والفاكو', 'Phaco & Laser Devices')}</span>
              <Cpu className="w-4 h-4 text-brass-600" />
            </div>
            <div className="text-xl font-extrabold text-pine-900">{operationalEquipment} / {equipmentList.length}</div>
            <span className="text-[10px] text-emerald-700 font-semibold">100% {t('معايرة واختبارات الجودة', 'calibrated & certified')}</span>
          </button>

          {/* Card 4: Clinical Patient Pipeline */}
          <button
            type="button"
            onClick={() => onSelectTab('analytics')}
            className="p-3.5 rounded-xl bg-bone-50 hover:bg-pine-50/50 border border-pine-200 hover:border-brass-300 transition-all cursor-pointer group text-start"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-ink-500 group-hover:text-pine-900">{t('مسار تدفق المرضى', 'Patient Pipeline')}</span>
              <Activity className="w-4 h-4 text-pine-700" />
            </div>
            <div className="text-xl font-extrabold text-pine-900">57 {t('مريضاً', 'pts')}</div>
            <span className="text-[10px] text-pine-800 font-semibold">{t('متوسط الانتظار 14.2 دقيقة', 'Avg wait 14.2 min')}</span>
          </button>
        </div>
      </div>

      {/* Lower Row: Live Operating Theaters Status + Active Surgery Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Operating Theaters & Rooms Live Monitor */}
        <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-bone-100">
            <div>
              <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-pine-700" />
                <span>{t('حالة أجنحة العمليات والعيادات اللحظية', 'Live Suites & Clinic Status')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t('مراقبة التعقيم والضغط والحرارة والحالات النشطة', 'Sterilization, pressure, temp & active cases')}
              </p>
            </div>
            <button
              onClick={() => onSelectTab('rooms')}
              className="text-xs font-bold text-pine-800 hover:text-pine-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('عرض كل الغرف', 'All Rooms')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {roomsList.slice(0, 4).map((room) => {
              const isOccupied = room.status === 'occupied_surgery' || room.status === 'in_consultation';
              const isReady = room.status === 'ready_clean';

              return (
                <div
                  key={room.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isOccupied
                      ? 'bg-rose-50/40 border-rose-200'
                      : isReady
                      ? 'bg-pine-50/40 border-pine-200'
                      : 'bg-bone-50 border-pine-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-extrabold px-2 py-0.5 rounded bg-ink-900 text-white">
                          {room.code}
                        </span>
                        <h4 className="text-xs font-bold text-ink-900">
                          {lang === 'ar' ? room.nameAr : room.nameEn}
                        </h4>
                      </div>
                      {room.currentProcedureAr && (
                        <p className="text-[11px] font-semibold text-ink-500 mt-1 flex items-center gap-1">
                          <Activity className="w-3 h-3 text-rose-500" />
                          <span>{lang === 'ar' ? room.currentProcedureAr : room.currentProcedureEn}</span>
                        </p>
                      )}
                      {room.currentDoctorAr && (
                        <p className="text-[11px] text-pine-800 font-bold mt-0.5">
                          {t('الطبيب المسؤول: ', 'In Charge: ')} {lang === 'ar' ? room.currentDoctorAr : room.currentDoctorEn}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          room.status === 'occupied_surgery'
                            ? 'bg-rose-500 text-white animate-pulse'
                            : room.status === 'in_consultation'
                            ? 'bg-brass-500 text-white'
                            : room.status === 'ready_clean'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-ink-500 text-white'
                        }`}
                      >
                        {room.status === 'occupied_surgery'
                          ? t('جراحة نشطة', 'In Surgery')
                          : room.status === 'in_consultation'
                          ? t('كشف نشط', 'In Consultation')
                          : room.status === 'ready_clean'
                          ? t('جاهزة ومعقمة', 'Ready & Sterile')
                          : t('قيد التعقيم', 'Sterilizing')}
                      </span>

                      <div className="flex items-center gap-2 text-[10px] font-bold text-ink-500">
                        <span>{room.tempCelsius}°C</span>
                        <span>•</span>
                        <span>{room.humidityPercent}% {t('رطوبة', 'Hum')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Surgical Queue / Scheduled Cases */}
        <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-sm">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-bone-100">
            <div>
              <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pine-700" />
                <span>{t('جدول العمليات الجراحية اليومي', 'Today’s Surgical Timetable')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t('متابعة مراحل المرضى (تحضير، غرفة العمليات، الإفاقة)', 'Tracking pre-op, OR and recovery progress')}
              </p>
            </div>
            <button
              onClick={() => onSelectTab('surgeries')}
              className="text-xs font-bold text-pine-800 hover:text-pine-900 flex items-center gap-1 cursor-pointer"
            >
              <span>{t('الجدول الكامل', 'Full Timetable')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {surgeriesList.slice(0, 4).map((surg) => (
              <div
                key={surg.id}
                className="p-3.5 rounded-xl bg-bone-50 border border-pine-200 hover:border-ink-300 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-pine-800 bg-pine-100/80 px-2 py-0.5 rounded">
                        {surg.time}
                      </span>
                      <span className="text-xs font-bold text-ink-900">
                        {lang === 'ar' ? surg.patientNameAr : surg.patientNameEn}
                      </span>
                      <span className="text-[10px] text-ink-400 font-semibold">
                        ({surg.patientAge} {t('سنة', 'yrs')})
                      </span>
                      {surg.priority === 'urgent' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-500 text-white uppercase">
                          {t('عاجل', 'Urgent')}
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-pine-900 mt-1.5">
                      {lang === 'ar' ? surg.procedureAr : surg.procedureEn}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-ink-500 mt-1 font-semibold">
                      <span>{t('الجراح: ', 'Surgeon: ')} <strong className="text-ink-700">{lang === 'ar' ? surg.surgeonAr : surg.surgeonEn}</strong></span>
                      <span>•</span>
                      <span>{t('الجناح: ', 'Suite: ')} <strong className="text-pine-800 font-mono">{surg.roomCode}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        surg.status === 'in_or'
                          ? 'bg-rose-600 text-white animate-pulse'
                          : surg.status === 'pre_op_prep'
                          ? 'bg-brass-500 text-white'
                          : surg.status === 'post_op_recovery'
                          ? 'bg-pine-700 text-white'
                          : surg.status === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-ink-500 text-white'
                      }`}
                    >
                      {surg.status === 'in_or'
                        ? t('داخل غرفة العمليات', 'In OR Suite')
                        : surg.status === 'pre_op_prep'
                        ? t('قيد التحضير والتخدير', 'Pre-Op Prep')
                        : surg.status === 'post_op_recovery'
                        ? t('في غرفة الإفاقة', 'PACU Recovery')
                        : surg.status === 'completed'
                        ? t('مكتملة بنجاح', 'Completed')
                        : t('مجدولة', 'Scheduled')}
                    </span>

                    <span className="text-[10px] font-bold text-ink-400">
                      ~{surg.estimatedDurationMin} {t('دقيقة', 'mins')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
