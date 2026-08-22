'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { HospitalStaff, StaffStatus, DUMMY_ATTENDANCE_RECORDS, StaffAttendanceRecord } from '@/data/dashboardData';
import { Users, Search, Phone, Mail, CheckCircle2, Clock, Activity, UserPlus, Building2, AlertCircle, Star, Trash2, Download, CalendarCheck2, ShieldCheck, Check, AlertTriangle, UserCheck, Timer } from 'lucide-react';

interface PersonnelTabProps {
  staffList: HospitalStaff[];
  onUpdateStaffStatus: (staffId: string, newStatus: StaffStatus) => void;
  onOpenAddStaffModal: () => void;
  onRemoveStaff: (staffId: string) => void;
}

export default function PersonnelTab({
  staffList, onUpdateStaffStatus, onOpenAddStaffModal, onRemoveStaff
}: PersonnelTabProps) {
  const { lang, t, } = useLanguage();
  const [viewMode, setViewMode] = useState<'directory' | 'attendance'>('attendance');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, _setSelectedStatus] = useState<string>('all');
  const [selectedShiftFilter, setSelectedShiftFilter] = useState<string>('all');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<StaffAttendanceRecord[]>(DUMMY_ATTENDANCE_RECORDS);
  const [exportToast, setExportToast] = useState(false);

  const categories: { id: string; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'جميع الكوادر', labelEn: 'All Personnel' }, { id: 'surgeon', labelAr: 'كبار الجراحين والأساتذة', labelEn: 'Surgeons & Professors' }, { id: 'consultant', labelAr: 'الاستشاريون الزائرون', labelEn: 'Visiting Consultants' }, { id: 'resident', labelAr: 'الأطباء المقيمون', labelEn: 'Resident Doctors' }, { id: 'nurse', labelAr: 'تمريض العمليات والرعاية', labelEn: 'Surgical Nurses' }, { id: 'technician', labelAr: 'أخصائيو البصريات والأجهزة', labelEn: 'Optometrists & Techs' }, { id: 'admin', labelAr: 'الإدارة والاستقبال', labelEn: 'Admin & Reception' }
  ];

  const _statuses: { id: string; labelAr: string; labelEn: string; color: string }[] = [
    { id: 'all', labelAr: 'جميع الحالات', labelEn: 'All Statuses', color: 'bg-slate-500' }, { id: 'on_duty', labelAr: 'على رأس العمل', labelEn: 'On Duty', color: 'bg-emerald-500' }, { id: 'in_surgery', labelAr: 'داخل غرفة العمليات', labelEn: 'In Surgery', color: 'bg-rose-500' }, { id: 'on_call', labelAr: 'تحت الطلب (On-Call)', labelEn: 'On Call', color: 'bg-amber-500' }, { id: 'break', labelAr: 'استراحة مؤقتة', labelEn: 'On Break', color: 'bg-blue-500' }, { id: 'off_duty', labelAr: 'خارج الدوام', labelEn: 'Off Duty', color: 'bg-slate-400' }
  ];

  // Filtering for Directory
  const filteredStaff = staffList.filter((s) => {
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
    const matchesSearch =
      searchQuery.trim() === '' ||
      s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.departmentAr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // Filtering for Attendance Records
  const filteredAttendance = attendanceRecords.filter((rec) => {
    const matchesShift = selectedShiftFilter === 'all' || rec.shiftType === selectedShiftFilter;
    const matchesCategory = selectedCategory === 'all' || rec.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      rec.staffNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.staffNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.roleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.badgeCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.departmentAr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesShift && matchesCategory && matchesSearch; });

  // KPI Calculations
  const totalStaffCount = staffList.length;
  const presentCount = staffList.filter((s) => s.status === 'on_duty' || s.status === 'in_surgery').length;
  const inSurgeryCount = staffList.filter((s) => s.status === 'in_surgery').length;
  const onCallCount = staffList.filter((s) => s.status === 'on_call').length;
  const attendanceRate = Math.round((presentCount / Math.max(totalStaffCount, 1)) * 100);
  const onTimeRate = 96.4;

  const handleToggleClockIn = (recId: string) => {
    setAttendanceRecords((prev) =>
      prev.map((rec) => {
        if (rec.id === recId) {
          const isCurrentlyClockedIn = !!rec.checkInTime && !rec.checkOutTime;
          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          if (isCurrentlyClockedIn) {
            // Clock out
            onUpdateStaffStatus(rec.staffId, 'off_duty');
            return {
              ...rec, checkOutTime: nowStr, status: 'absent' as const, notesAr: `تم تسجيل الانصراف الساعة ${nowStr}`
            };
          } else {
            // Clock in
            onUpdateStaffStatus(rec.staffId, 'on_duty');
            return {
              ...rec, checkInTime: nowStr, checkOutTime: null, status: 'present_ontime' as const, notesAr: `تم تسجيل الحضور الفعلي الساعة ${nowStr}`
            };
          }
        }
        return rec;
      })
    ); };

  const handleExportAttendance = () => {
    setExportToast(true);
    setTimeout(() => setExportToast(false), 3000);
  };

  const getStatusBadge = (status: StaffStatus) => {
    switch (status) {
      case 'in_surgery':
        return {
          bg: 'bg-rose-500 text-white', text: t('في غرفة العمليات', 'In Surgery'), dot: 'bg-white animate-ping'
        };
      case 'on_duty':
        return {
          bg: 'bg-emerald-600 text-white', text: t('على رأس العمل', 'On Duty'), dot: 'bg-emerald-300'
        };
      case 'on_call':
        return {
          bg: 'bg-amber-500 text-white', text: t('تحت الطلب (On-Call)', 'On Call'), dot: 'bg-amber-300' };
      case 'break':
        return {
          bg: 'bg-blue-500 text-white', text: t('استراحة مؤقتة', 'On Break'), dot: 'bg-blue-200'
        };
      default:
        return {
          bg: 'bg-slate-500 text-white', text: t('خارج الدوام', 'Off Duty'), dot: 'bg-slate-300'
        };
    }
  };

  const statusOptions: StaffStatus[] = ['on_duty', 'in_surgery', 'on_call', 'break', 'off_duty'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Toast Notification */}
      {exportToast && (
        <div className="fixed bottom-6 left-6 rtl:left-auto rtl:right-6 z-50 bg-emerald-700 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <div>
            <p className="text-xs font-black">{t('تم تصدير كشف الحضور والمناوبات بنجاح!', 'Duty Roster Exported Successfully!')}</p>
            <p className="text-[11px] text-emerald-100">{t('تم إنشاء ملف Excel/CSV المعتمد وتنزيله للجهاز.', 'Official attendance report saved as CSV.')}</p>
          </div>
        </div>
      ) }

      {/* Top Command Banner & View Mode Toggle */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-black text-[#0C2340] flex items-center gap-2">
              <Users className="w-5 h-5 text-teal-600" />
              <span>{t('إدارة الكوادر الطبية والمناوبات وجداول الحضور', 'Workforce, Shift Roster & Attendance Command')}</span>
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-teal-50 text-teal-700 border border-teal-200">
              Bahmni / OpenMRS ERP
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'متابعة الجراحين، الاستشاريين الزائرين، أطباء العيون، طواقم التمريض، تسجيل البصمة والحضور اللحظي', 'Track surgeons, visiting professors, nurses, biometric attendance & real-time shift coverage'
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Dual View Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('attendance') }
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'attendance'
                  ? 'bg-[#0C2340] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck2 className="w-3.5 h-3.5" />
              <span>{t('سجل الحضور والمناوبات', 'Live Shift Roster')}</span>
            </button>

            <button
              onClick={() => setViewMode('directory')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'directory'
                  ? 'bg-[#0C2340] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('دليل الكوادر', 'Personnel Directory')}</span>
            </button>
          </div>

          <button
            onClick={onOpenAddStaffModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{t('إضافة كادر', 'Add Staff')}</span>
          </button>
        </div>
      </div>

      {/* Roster & Attendance KPI Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold">{t('إجمالي الكادر الطبي', 'Total Workforce')}</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl font-black text-[#0C2340]">{totalStaffCount}</div>
          <span className="text-[10px] text-slate-400 font-semibold">{t('12 تخصص دقيق للعيون', '12 ophthalmic roles')}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-[11px] font-bold">{t('نسبة الحضور اللحظي', 'Attendance Rate')}</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-700">{attendanceRate}%</div>
          <span className="text-[10px] text-emerald-800 font-semibold">{presentCount} {t('على رأس العمل', 'on active duty')}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-[11px] font-bold">{t('داخل غرف العمليات', 'In Surgery OR')}</span>
            <Activity className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl font-black text-rose-700">{inSurgeryCount}</div>
          <span className="text-[10px] text-rose-800 font-semibold">{t('3 جراحات كبرى جارية', '3 active surgical cases')}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-amber-200 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-[11px] font-bold">{t('تحت الطلب للطوارئ', 'On-Call Reserve')}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black text-amber-700">{onCallCount}</div>
          <span className="text-[10px] text-amber-800 font-semibold">{t('جاهزية استجابة فورية', 'Ready for urgent calls')}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/20 shadow-xs">
          <div className="flex items-center justify-between text-indigo-700 mb-1">
            <span className="text-[11px] font-bold">{t('معدل الانضباط الزمني', 'Punctuality Rate')}</span>
            <Timer className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-indigo-700">{onTimeRate}%</div>
          <span className="text-[10px] text-indigo-800 font-semibold">{t('بصمة الدخول الصباحية', 'Morning biometric match')}</span>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-cyan-200 bg-cyan-50/20 shadow-xs">
          <div className="flex items-center justify-between text-cyan-700 mb-1">
            <span className="text-[11px] font-bold">{t('ساعات العمل الإضافي', 'Logged Overtime')}</span>
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-xl font-black text-cyan-800">7.5 <span className="text-xs">{t('ساعة', 'hrs')}</span></div>
          <span className="text-[10px] text-cyan-800 font-semibold">{t('لتغطية الجراحات المعقدة', 'For complex VR cases')}</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Field */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute top-3 left-3 rtl:left-auto rtl:right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('البحث بالاسم، الكود، أو القسم...', 'Search by name, role, badge or dept...')}
              className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Shift Filter Buttons if in Attendance mode */}
          {viewMode === 'attendance' && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs font-bold text-slate-500 flex-shrink-0">{t('المناوبة:', 'Shift:')}</span>
              {[
                { id: 'all', labelAr: 'الكل', labelEn: 'All Shifts' },
                { id: 'morning', labelAr: 'صباحية (08:00 - 16:00)', labelEn: 'Morning' },
                { id: 'evening', labelAr: 'مسائية (12:00 - 20:00)', labelEn: 'Evening' },
                { id: 'full_day', labelAr: 'مناوبة كاملة', labelEn: 'Full Day' }
              ].map((sh) => (
                <button
                  key={sh.id}
                  onClick={() => setSelectedShiftFilter(sh.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedShiftFilter === sh.id
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t(sh.labelAr, sh.labelEn)}
                </button>
              ))}

              <button
                onClick={handleExportAttendance}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-slate-200 flex-shrink-0 ml-auto rtl:ml-0 rtl:mr-auto"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>{t('تصدير الكشف', 'Export CSV')}</span>
              </button>
            </div>
          )}

          {/* Category Chips Scroll if in Directory mode */}
          {viewMode === 'directory' && (
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-[#0C2340] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {t(cat.labelAr, cat.labelEn)}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: LIVE ATTENDANCE & SHIFT ROSTER TABLE (Bahmni Shift Management) */}
      {/* ========================================================================= */}
      {viewMode === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fadeIn">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-[#0C2340] flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-teal-600" />
                <span>{t('جدول الحضور والبصمة اللحظية ومناوبات العمل اليومية', 'Daily Biometric Attendance & Staff Roster Matrix')}</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {t('مزامنة لحظية مع نظام التوجيه الإداري والتحكم ببصمة الكوادر وغرف العمليات', 'Synchronized real-time with biometric scanners and surgical room assigners')}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{t('نظام البصمة نشط 100%', 'Biometrics Live 100%')}</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-slate-100/75 text-slate-700 font-bold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="p-3 text-start">{t('الكادر الطبي / الوظيفة', 'Staff Member & Role')}</th>
                  <th className="p-3 text-start">{t('القسم / الجناح', 'Department & Unit')}</th>
                  <th className="p-3 text-center">{t('المناوبة المجدولة', 'Scheduled Shift')}</th>
                  <th className="p-3 text-center">{t('بصمة الحضور', 'Check-In Punch')}</th>
                  <th className="p-3 text-center">{t('الانضباط الزمني', 'Punctuality')}</th>
                  <th className="p-3 text-center">{t('الحالة اللحظية', 'Live Status')}</th>
                  <th className="p-3 text-center">{t('موثوقية الشهر', 'Monthly Rate')}</th>
                  <th className="p-3 text-center">{t('إجراءات المدير', 'Manager Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAttendance.map((record) => {
                  const staffObj = staffList.find((s) => s.id === record.staffId);
                  const currentStatus = staffObj ? staffObj.status : ('on_duty' as StaffStatus);
                  const badge = getStatusBadge(currentStatus);
                  const isCheckedIn = !!record.checkInTime && !record.checkOutTime;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          <Image
                            src={record.avatar}
                            alt={record.staffNameEn}
                            width={36}
                            height={36}
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                          />
                          <div>
                            <div className="font-extrabold text-[#0C2340] text-xs">
                              {lang === 'ar' ? record.staffNameAr : record.staffNameEn}
                            </div>
                            <div className="text-[11px] text-teal-800 font-semibold">
                              {lang === 'ar' ? record.roleAr : record.roleEn}
                            </div>
                            <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                              {record.badgeCode}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="p-3 text-slate-700 font-semibold">
                        <div className="truncate max-w-[180px]">
                          {lang === 'ar' ? record.departmentAr : record.departmentEn}
                        </div>
                        <div className="text-[10px] text-slate-400 font-normal truncate mt-0.5">
                          {record.notesAr}
                        </div>
                      </td>

                      {/* Shift Timing */}
                      <td className="p-3 text-center">
                        <span className="font-bold text-slate-800 block text-xs">{record.shiftTiming}</span>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {lang === 'ar' ? record.shiftNameAr : record.shiftNameEn}
                        </span>
                      </td>

                      {/* Check-In Punch */}
                      <td className="p-3 text-center font-mono">
                        {record.checkInTime ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                            {record.checkInTime}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold italic">{t('لم يُسجل بعد', 'Pending')}</span>
                        )}
                      </td>

                      {/* Punctuality */}
                      <td className="p-3 text-center">
                        {record.punctualityMinutes > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>+{record.punctualityMinutes} {t('دقيقة مبكراً', 'min early')}</span>
                          </span>
                        ) : record.punctualityMinutes === 0 ? (
                          <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                            {t('في الموعد تماماً', 'On Time')}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3 h-3" />
                            <span>{Math.abs(record.punctualityMinutes)} {t('دقيقة تأخير', 'min late')}</span>
                          </span>
                        )}
                      </td>

                      {/* Live Status Selector */}
                      <td className="p-3 text-center">
                        <select
                          value={currentStatus}
                          onChange={(e) => onUpdateStaffStatus(record.staffId, e.target.value as StaffStatus)}
                          className={`text-xs font-bold py-1 px-2 rounded-lg border focus:outline-none cursor-pointer ${badge.bg}`}
                        >
                          {statusOptions.map((st) => (
                            <option key={st} value={st} className="bg-white text-slate-900 font-semibold">
                              {st === 'on_duty'
                                ? t('على رأس العمل', 'On Duty')
                                : st === 'in_surgery'
                                ? t('في غرفة العمليات', 'In Surgery')
                                : st === 'on_call'
                                ? t('تحت الطلب (On-Call)', 'On Call')
                                : st === 'break'
                                ? t('استراحة مؤقتة', 'On Break')
                                : t('خارج الدوام', 'Off Duty')}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Monthly Reliability */}
                      <td className="p-3 text-center font-bold">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-slate-800">{record.monthlyAttendanceRate}%</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                        {record.overtimeHours > 0 && (
                          <span className="text-[9px] text-indigo-600 block font-semibold">
                            +{record.overtimeHours}h {t('إضافي', 'overtime')}
                          </span>
                        )}
                      </td>

                      {/* Manager Actions (Clock In/Out & Delete) */}
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleToggleClockIn(record.id)}
                            title={isCheckedIn ? t('تسجيل انصراف', 'Clock Out') : t('تسجيل حضور فوري', 'Clock In')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer flex items-center gap-1 ${
                              isCheckedIn
                                ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{isCheckedIn ? t('انصراف', 'Clock Out') : t('تسجيل حضور', 'Clock In')}</span>
                          </button>

                          <button
                            onClick={() => setConfirmingDeleteId(record.staffId)}
                            title={t('حذف الكادر', 'Remove staff')}
                            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Inline Delete Confirmation if triggered */}
                        {confirmingDeleteId === record.staffId && (
                          <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-1.5 animate-fadeIn">
                            <span className="text-[10px] font-bold text-rose-800 block">
                              {t('تأكيد حذف الكادر من النظام؟', 'Confirm deletion?')}
                            </span>
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  onRemoveStaff(record.staffId);
                                  setAttendanceRecords((prev) => prev.filter((r) => r.staffId !== record.staffId));
                                  setConfirmingDeleteId(null);
                                }}
                                className="px-2 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded cursor-pointer"
                              >
                                {t('نعم، حذف', 'Yes, Delete')}
                              </button>
                              <button
                                onClick={() => setConfirmingDeleteId(null)}
                                className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-bold rounded cursor-pointer"
                              >
                                {t('إلغاء', 'Cancel')}
                              </button>
                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: DIRECTORY CARDS GRID */}
      {/* ========================================================================= */}
      {viewMode === 'directory' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
          {filteredStaff.map((staff) => {
            const badge = getStatusBadge(staff.status);

            return (
              <div
                key={staff.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header: Avatar, Name, Rating & Role */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                          <Image
                            src={staff.avatar}
                            alt={staff.nameEn}
                            width={48}
                            height={48}
                            className="w-12 h-12 rounded-xl object-cover border-2 border-slate-100 shadow-xs flex-shrink-0"
                          />
                      <div>
                        <h3 className="text-sm font-extrabold text-[#0C2340]">
                          {lang === 'ar' ? staff.nameAr : staff.nameEn}
                        </h3>
                        <p className="text-xs font-semibold text-teal-800 mt-0.5">
                          {lang === 'ar' ? staff.roleAr : staff.roleEn}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-0.5 rounded-lg text-xs font-black flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{staff.rating}</span>
                    </div>
                  </div>

                  {/* Department & Assigned Room */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 mb-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                      <span className="truncate font-semibold">{lang === 'ar' ? staff.departmentAr : staff.departmentEn}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>{t('المناوبة: ', 'Shift: ')} <strong className="text-slate-800">{staff.shift}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                      <span>{t('الموقع الحالي: ', 'Assigned: ')} <strong className="text-teal-800">{lang === 'ar' ? staff.roomAssignedAr : staff.roomAssignedEn}</strong></span>
                    </div>
                  </div>

                  {/* Workload Today Metrics */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="p-2 bg-teal-50/60 rounded-xl border border-teal-100 text-center">
                      <span className="text-[10px] font-bold text-teal-800 block">{t('حالات اليوم', 'Patients Today')}</span>
                      <span className="text-base font-black text-teal-950">{staff.patientCountToday}</span>
                    </div>
                    <div className="p-2 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center">
                      <span className="text-[10px] font-bold text-indigo-800 block">{t('جراحات اليوم', 'Surgeries Today')}</span>
                      <span className="text-base font-black text-indigo-950">{staff.surgeriesCountToday}</span>
                    </div>
                  </div>
                </div>

                {/* Status Selector & Quick Contact Bar */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold text-slate-500">{t('تغيير الحالة اللحظية:', 'Quick Status:')}</span>
                    
                    {/* Status Dropdown */}
                    <select
                      value={staff.status}
                      onChange={(e) => onUpdateStaffStatus(staff.id, e.target.value as StaffStatus)}
                      className={`text-xs font-bold py-1 px-2.5 rounded-lg border focus:outline-none cursor-pointer ${badge.bg}`}
                    >
                      {statusOptions.map((st) => (
                        <option key={st} value={st} className="bg-white text-slate-900 font-semibold">
                          {st === 'on_duty'
                            ? t('على رأس العمل', 'On Duty')
                            : st === 'in_surgery'
                            ? t('في غرفة العمليات', 'In Surgery')
                            : st === 'on_call'
                            ? t('تحت الطلب (On-Call)', 'On Call')
                            : st === 'break'
                            ? t('استراحة مؤقتة', 'On Break')
                            : t('خارج الدوام', 'Off Duty')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Direct Contact Buttons & Delete Option */}
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${staff.phone}`}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{t('اتصال مباشر', 'Call')}</span>
                    </a>

                    <a
                      href={`mailto:${staff.email}`}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors"
                      title={staff.email}
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => setConfirmingDeleteId(staff.id)}
                      title={t('حذف الكادر من المناوبة', 'Remove staff member')}
                      className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inline Delete Confirmation Banner if active */}
                  {confirmingDeleteId === staff.id && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 animate-fadeIn">
                      <span className="text-[11px] font-bold text-rose-800 leading-tight">
                        {t('هل تريد بالتأكيد حذف هذا الكادر؟', 'Confirm remove staff?')}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={() => {
                            onRemoveStaff(staff.id);
                            setConfirmingDeleteId(null);
                          }}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                        >
                          {t('نعم، حذف', 'Yes, Delete')}
                        </button>
                        <button
                          onClick={() => setConfirmingDeleteId(null)}
                          className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          {t('إلغاء', 'Cancel')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {((viewMode === 'directory' && filteredStaff.length === 0) ||
        (viewMode === 'attendance' && filteredAttendance.length === 0)) && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700">{t('لا توجد نتائج مطابقة لبحثك', 'No matching staff found')}</h4>
          <p className="text-xs text-slate-400">{t('يرجى تجربة كلمات بحث أخرى أو إزالة الفلاتر', 'Try clearing filters or changing search terms')}</p>
        </div>
      )}
    </div>
  );
}

