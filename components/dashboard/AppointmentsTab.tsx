'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import { CalendarX, CalendarCheck, UserRound, Stethoscope, Clock, RefreshCw } from 'lucide-react';
import type { AppointmentListItem, CancelReason, LiveAppointmentStatus } from '@/lib/usecases/appointments';
import type { AppointmentStatusModalProps } from './modals/AppointmentStatusModal';

const AppointmentStatusModalLazy = dynamic<AppointmentStatusModalProps>(
  () => import('./modals/AppointmentStatusModal'),
  { ssr: false },
);

type Filter = 'all' | LiveAppointmentStatus;

interface BoardFilters {
  date: string;
  status: Filter;
}

function todayIso(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

const STATUS_BADGES: Record<LiveAppointmentStatus, { cls: string; ar: string; en: string }> = {
  scheduled: { cls: 'bg-pine-100 text-pine-800 border-pine-200', ar: 'مجدول', en: 'Scheduled' },
  confirmed: { cls: 'bg-emerald-100 text-emerald-800 border-emerald-200', ar: 'مؤكد', en: 'Confirmed' },
  in_queue: { cls: 'bg-blue-100 text-blue-800 border-blue-200', ar: 'في الدور', en: 'In queue' },
  completed: { cls: 'bg-bone-200 text-ink-700 border-bone-300', ar: 'مكتمل', en: 'Completed' },
  cancelled: { cls: 'bg-rose-100 text-rose-800 border-rose-200', ar: 'ملغى', en: 'Cancelled' },
  no_show: { cls: 'bg-ink-900 text-white border-ink-900', ar: 'لم يحضر', en: 'No-show' },
};

const REASON_LABELS: Record<CancelReason, { ar: string; en: string }> = {
  patient_request: { ar: 'طلب المريض', en: 'Patient request' },
  clinic_decision: { ar: 'قرار العيادة', en: 'Clinic decision' },
  duplicate: { ar: 'حجز مكرر', en: 'Duplicate booking' },
  rescheduled: { ar: 'أُعيد جدولته', en: 'Rescheduled' },
  other: { ar: 'أخرى', en: 'Other' },
};

export default function AppointmentsTab() {
  const { lang, t } = useLanguage();

  const [items, setItems] = useState<AppointmentListItem[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [filters, setFilters] = useState<BoardFilters>({ date: todayIso(), status: 'all' });
  const [reloadKey, setReloadKey] = useState(0);

  const [statusTarget, setStatusTarget] = useState<AppointmentListItem | null>(null);
  const [statusAction, setStatusAction] = useState<'cancelled' | 'no_show'>('cancelled');

  const load = useCallback(async (signal: AbortSignal) => {
    setLoadError(false);
    const params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.status !== 'all') params.set('status', filters.status);
    try {
      const res = await fetch(`/api/staff/appointments?${params.toString()}`, { signal });
      if (!res.ok) {
        setLoadError(true);
        setItems(null);
        return;
      }
      const json = await res.json();
      setItems(Array.isArray(json?.data) ? (json.data as AppointmentListItem[]) : []);
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setLoadError(true);
        setItems(null);
      }
    }
  }, [filters.date, filters.status]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const handleApplied = (
    id: string,
    status: 'cancelled' | 'no_show',
    reason: CancelReason | null,
    note: string | null,
  ) => {
    setItems((prev) =>
      (prev ?? []).map((item) =>
        item.id === id ? { ...item, status, cancelReason: reason, cancelNote: note } : item,
      ),
    );
  };

  const openModal = (item: AppointmentListItem, action: 'cancelled' | 'no_show') => {
    setStatusTarget(item);
    setStatusAction(action);
  };

  const isLive = (s: LiveAppointmentStatus) => s === 'scheduled' || s === 'confirmed';

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header banner */}
      <div className="bg-white p-5 rounded-2xl border border-pine-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-pine-700" />
            <span>{t('مواعيد المرضى وتسجيل الحضور', 'Patient Appointments & Attendance')}</span>
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {t(
              'تسجيل حالات الإلغاء وعدم الحضور بأسبابها لتبقى التقارير صادقة',
              'Record cancellations and no-shows with reasons so reports stay truthful',
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="appt-date" className="sr-only">
            {t('تاريخ الموعد', 'Appointment date')}
          </label>
          <input
            id="appt-date"
            type="date"
            value={filters.date}
            onChange={(e) => setFilters((f) => ({ ...f, date: e.target.value }))}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-pine-200 bg-bone-50 text-ink-900 focus:outline-none focus:ring-2 focus:ring-pine-500"
          />
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            aria-label={t('تحديث القائمة', 'Refresh list')}
            className="p-2 rounded-xl bg-bone-100 hover:bg-bone-200 text-ink-600 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2.5 rounded-2xl border border-pine-200 shadow-sm">
        {(
          [
            ['all', 'الكل', 'All'],
            ['scheduled', 'مجدول', 'Scheduled'],
            ['confirmed', 'مؤكد', 'Confirmed'],
            ['in_queue', 'في الدور', 'In queue'],
            ['completed', 'مكتمل', 'Completed'],
            ['cancelled', 'ملغى', 'Cancelled'],
            ['no_show', 'لم يحضر', 'No-show'],
          ] as [Filter, string, string][]
        ).map(([id, ar, en]) => (
          <button
            key={id}
            onClick={() => setFilters((f) => ({ ...f, status: id }))}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filters.status === id
                ? 'bg-[#0B3D33] text-white shadow-xs'
                : 'bg-bone-50 text-ink-500 hover:bg-bone-100'
            }`}
          >
            {t(ar, en)}
          </button>
        ))}
      </div>

      {/* Content states */}
      {loadError ? (
        <div className="bg-white rounded-2xl border border-rose-200 p-8 text-center">
          <p className="text-sm font-bold text-rose-700">
            {t('تعذر تحميل المواعيد', 'Could not load appointments')}
          </p>
          <button
            onClick={() => setReloadKey((k) => k + 1)}
            className="mt-3 px-4 py-2 bg-pine-700 hover:bg-pine-800 text-white rounded-xl text-xs font-extrabold cursor-pointer"
          >
            {t('إعادة المحاولة', 'Retry')}
          </button>
        </div>
      ) : items === null ? (
        <div className="space-y-3 animate-pulse" aria-hidden="true">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 bg-bone-200 rounded-2xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-pine-200 p-8 text-center">
          <CalendarX className="w-8 h-8 text-ink-300 mx-auto mb-2" />
          <p className="text-sm font-bold text-ink-500">
            {t('لا مواعيد مطابقة لهذا اليوم', 'No appointments match this day')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const badge = STATUS_BADGES[item.status];
            const live = isLive(item.status);
            const doctor = lang === 'ar' ? item.doctorDisplayNameAr : item.doctorDisplayNameEn;
            const specialty = lang === 'ar' ? item.specialtyAr : item.specialtyEn;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-pine-200 shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4"
              >
                {/* Time + ticket */}
                <div className="flex items-center gap-2.5 sm:w-40 flex-shrink-0">
                  <span className="flex items-center gap-1 text-sm font-extrabold text-pine-900">
                    <Clock className="w-3.5 h-3.5 text-pine-600" />
                    {item.time}
                  </span>
                  <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-ink-900 text-white">
                    {item.ticketNumber}
                  </span>
                </div>

                {/* Doctor / specialty */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-ink-900 flex items-center gap-1.5 truncate">
                    <UserRound className="w-3.5 h-3.5 text-ink-400 flex-shrink-0" />
                    {doctor ?? t('حجز ذاتي (بدون طبيب)', 'Self booking (no doctor)')}
                  </p>
                  {specialty && (
                    <p className="text-[11px] text-ink-500 flex items-center gap-1.5 truncate mt-0.5">
                      <Stethoscope className="w-3 h-3 text-pine-500 flex-shrink-0" />
                      {specialty}
                    </p>
                  )}
                </div>

                {/* Status badge + actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${badge.cls}`}>
                    {t(badge.ar, badge.en)}
                  </span>
                  {live && (
                    <>
                      <button
                        onClick={() => openModal(item, 'cancelled')}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {t('إلغاء', 'Cancel')}
                      </button>
                      <button
                        onClick={() => openModal(item, 'no_show')}
                        className="px-2.5 py-1.5 rounded-lg bg-bone-100 hover:bg-ink-900 hover:text-white text-ink-700 border border-bone-200 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {t('لم يحضر', 'No-show')}
                      </button>
                    </>
                  )}
                </div>

                {/* Cancel fact line */}
                {item.cancelReason && item.status !== 'scheduled' && item.status !== 'confirmed' && (
                  <p className="sm:w-full sm:basis-full text-[11px] text-ink-500 sm:order-last">
                    {t('السبب:', 'Reason:')}{' '}
                    <span className="font-bold text-ink-700">
                      {REASON_LABELS[item.cancelReason] ? t(REASON_LABELS[item.cancelReason].ar, REASON_LABELS[item.cancelReason].en) : item.cancelReason}
                    </span>
                    {item.cancelNote && <span> — {item.cancelNote}</span>}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <AppointmentStatusModalLazy
        open={statusTarget !== null}
        onClose={() => setStatusTarget(null)}
        action={statusAction}
        ticketNumber={statusTarget?.ticketNumber ?? ''}
        appointmentId={statusTarget?.id ?? ''}
        onApplied={handleApplied}
      />
    </div>
  );
}
