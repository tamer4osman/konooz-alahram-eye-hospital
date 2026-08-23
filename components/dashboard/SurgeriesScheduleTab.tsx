'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ScheduledSurgery } from '@/data/dashboardData';
import { Calendar, Clock, User, Plus, Search, CheckCircle2, Building2, HeartPulse, Trash2 } from 'lucide-react';

interface SurgeriesScheduleTabProps {
  surgeriesList: ScheduledSurgery[];
  onUpdateSurgeryStatus: (id: string, newStatus: ScheduledSurgery['status']) => void;
  onOpenScheduleModal: () => void;
  onRemoveSurgery: (id: string) => void;
}

export default function SurgeriesScheduleTab({
  surgeriesList, onUpdateSurgeryStatus, onOpenScheduleModal, onRemoveSurgery
}: SurgeriesScheduleTabProps) {
  const { lang, t, } = useLanguage();
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const roomsList = [
    { id: 'all', label: t('جميع الأجنحة الجراحية', 'All Surgical Suites') }, { id: 'OR-101', label: 'OR-101 (Vitreoretinal Suite)' }, { id: 'OR-102', label: 'OR-102 (Cataract & Phaco)' }, { id: 'LASIK-OR-3', label: 'LASIK-OR-3 (Femto-LASIK Suite)' }
  ];

  const statusList = [
    { id: 'all', label: t('جميع المراحل', 'All Stages') }, { id: 'scheduled', label: t('مجدولة', 'Scheduled') }, { id: 'pre_op_prep', label: t('قيد التحضير والتخدير', 'Pre-Op Prep') }, { id: 'in_or', label: t('داخل غرفة العمليات', 'In OR Suite') }, { id: 'post_op_recovery', label: t('في الإفاقة (PACU)', 'In PACU Recovery') }, { id: 'completed', label: t('مكتملة بنجاح', 'Completed') }
  ];

  const filteredSurgeries = surgeriesList.filter((surg) => {
    const matchesRoom = selectedRoomFilter === 'all' || surg.roomCode === selectedRoomFilter;
    const matchesStatus = selectedStatusFilter === 'all' || surg.status === selectedStatusFilter;
    const matchesSearch =
      searchQuery.trim() === '' ||
      surg.patientNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surg.patientNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surg.surgeonAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surg.surgeonEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surg.procedureAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surg.procedureEn.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesRoom && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: ScheduledSurgery['status']) => {
    switch (status) {
      case 'in_or':
        return {
          bg: 'bg-rose-500 text-white animate-pulse', text: t('داخل غرفة العمليات', 'In OR Suite')
        };
      case 'pre_op_prep':
        return {
          bg: 'bg-brass-500 text-white', text: t('قيد التحضير والتخدير', 'Pre-Op Prep') };
      case 'post_op_recovery':
        return {
          bg: 'bg-pine-700 text-white', text: t('في غرفة الإفاقة', 'PACU Recovery')
        };
      case 'completed':
        return {
          bg: 'bg-emerald-600 text-white', text: t('مكتملة بنجاح', 'Completed')
        };
      default:
        return {
          bg: 'bg-ink-500 text-white', text: t('مجدولة', 'Scheduled')
        };
    } };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner Header */}
      <div className="bg-white p-5 rounded-2xl border border-pine-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-pine-700" />
            <span>{t('جدول العمليات الجراحية ومتابعة تدفق الحالات', 'Surgical Schedule & Patient Flow Queue')}</span>
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {t(
              'متابعة مباشرة لمراحل المرضى: التحضير، التخدير، التدخل الجراحي، والإفاقة والرعاية بعد الجراحة',
              'Direct pipeline tracking from pre-op preparation to surgical intervention and recovery'
            )}
          </p>
        </div>

        <button
          onClick={onOpenScheduleModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-pine-900 hover:bg-pine-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 text-brass-300" />
          <span>{t('حجز عملية جديدة', 'Schedule Surgery Case')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute top-3 left-3 rtl:left-auto rtl:right-3 text-ink-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('البحث باسم المريض، الجراح، أو نوع العملية...', 'Search patient, surgeon, or procedure...')}
              className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 bg-bone-50 border border-pine-200 rounded-xl text-xs font-semibold text-ink-900 focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
          </div>

          {/* Room Filter Dropdown */}
          <select
            value={selectedRoomFilter}
            onChange={(e) => setSelectedRoomFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-bone-50 border border-pine-200 rounded-xl text-xs font-bold text-ink-700 focus:outline-none cursor-pointer"
          >
            {roomsList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>

          {/* Status Filter Dropdown */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full md:w-auto px-3 py-2 bg-bone-50 border border-pine-200 rounded-xl text-xs font-bold text-ink-700 focus:outline-none cursor-pointer"
          >
            {statusList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Surgeries List / Table */}
      <div className="space-y-4">
        {filteredSurgeries.map((surg) => {
          const badge = getStatusBadge(surg.status);

          return (
            <div
              key={surg.id}
              className="bg-white rounded-2xl p-5 border border-pine-200 hover:border-ink-300 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5"
            >
              {/* Left Column: Time, Patient Info & Priority */}
              <div className="flex items-start gap-4">
                {/* Time Badge */}
                <div className="w-16 h-16 rounded-2xl bg-pine-900 text-white flex flex-col items-center justify-center flex-shrink-0 shadow-inner">
                  <Clock className="w-4 h-4 text-brass-300 mb-0.5" />
                  <span className="font-mono text-xs font-extrabold">{surg.time}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-ink-500 bg-bone-100 px-2 py-0.5 rounded">
                      {surg.id}
                    </span>
                    <h3 className="text-sm font-extrabold text-pine-900">
                      {lang === 'ar' ? surg.patientNameAr : surg.patientNameEn}
                    </h3>
                    <span className="text-xs text-ink-400 font-semibold">
                      ({surg.patientAge} {t('سنة', 'yrs')} - {surg.gender === 'male' ? t('ذكر', 'Male') : t('أنثى', 'Female')})
                    </span>

                    {/* Priority Tag */}
                    {surg.priority === 'urgent' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500 text-white uppercase animate-pulse">
                        {t('حالة عاجلة', 'Urgent')}
                      </span>
                    )}
                    {surg.priority === 'high_priority' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-brass-500 text-white">
                        {t('أولوية متقدمة', 'High Priority')}
                      </span>
                    )}
                  </div>

                  {/* Surgical Procedure Full Title */}
                  <p className="text-xs font-bold text-pine-900 leading-snug">
                    {lang === 'ar' ? surg.procedureAr : surg.procedureEn}
                  </p>

                  {/* Surgeon, Anesthetist & Room */}
                  <div className="flex flex-wrap items-center gap-3 text-xs text-ink-500 pt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-pine-700" />
                      <span>{t('الجراح: ', 'Surgeon: ')} <strong className="text-ink-700">{lang === 'ar' ? surg.surgeonAr : surg.surgeonEn}</strong></span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-brass-600" />
                      <span>{t('الجناح: ', 'Suite: ')} <strong className="font-mono text-pine-800">{surg.roomCode}</strong></span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-[11px] text-ink-500">
                      <HeartPulse className="w-3 h-3 text-rose-500" />
                      <span>{lang === 'ar' ? surg.anesthesiaTypeAr : surg.anesthesiaTypeEn}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Stage Tracking & Quick Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-3 flex-shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-bone-100">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold ${badge.bg}`}>
                    {badge.text}
                  </span>
                  <span className="text-xs font-bold text-ink-400 font-mono">
                    ~{surg.estimatedDurationMin} min
                  </span>
                </div>

                {/* Pipeline Advance & Delete Buttons */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {surg.status === 'scheduled' && (
                    <button
                      onClick={() => onUpdateSurgeryStatus(surg.id, 'pre_op_prep')}
                      className="px-3 py-1.5 bg-brass-500 hover:bg-brass-600 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      {t('بدء التحضير والتخدير', 'Start Pre-Op')}
                    </button>
                  )}

                  {surg.status === 'pre_op_prep' && (
                    <button
                      onClick={() => onUpdateSurgeryStatus(surg.id, 'in_or')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer animate-pulse"
                    >
                      {t('نقل لغرفة العمليات', 'Move to OR')}
                    </button>
                  )}

                  {surg.status === 'in_or' && (
                    <button
                      onClick={() => onUpdateSurgeryStatus(surg.id, 'post_op_recovery')}
                      className="px-3 py-1.5 bg-pine-700 hover:bg-pine-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      {t('نقل للإفاقة (PACU)', 'Move to PACU')}
                    </button>
                  )}

                  {surg.status === 'post_op_recovery' && (
                    <button
                      onClick={() => onUpdateSurgeryStatus(surg.id, 'completed')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('اكتمال وخروج', 'Complete Case')}</span>
                    </button>
                  )}

                  {surg.status === 'completed' && (
                    <span className="text-xs font-bold text-emerald-700 bg-pine-50 px-2.5 py-1 rounded-lg border border-pine-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('تم بنجاح ومستقر', 'Completed & Stable')}</span>
                    </span>
                  )}

                  {/* Remove / Cancel Surgery Button */}
                  <button
                    onClick={() => setConfirmingDeleteId(surg.id)}
                    title={t('إلغاء وحذف العملية من الجدول', 'Cancel & remove surgery case')}
                    className="p-1.5 bg-bone-100 hover:bg-rose-50 text-ink-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Inline Delete Confirmation */}
                {confirmingDeleteId === surg.id && (
                  <div className="w-full mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 animate-fadeIn">
                    <span className="text-[11px] font-bold text-rose-800 leading-tight">
                      {t('هل تريد بالتأكيد إلغاء وحذف العملية؟', 'Confirm remove surgery?')}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => {
                          onRemoveSurgery(surg.id);
                          setConfirmingDeleteId(null);
                        }}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-extrabold rounded-lg transition-colors cursor-pointer"
                      >
                        {t('نعم، حذف', 'Delete')}
                      </button>
                      <button
                        onClick={() => setConfirmingDeleteId(null)}
                        className="px-2 py-1 bg-pine-200 hover:bg-ink-300 text-ink-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
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

    </div>
  );
}
