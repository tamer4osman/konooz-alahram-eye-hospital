'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Modal from '@/components/ui/Modal';
import { X } from 'lucide-react';
import type { CancelReason } from '@/lib/usecases/appointments';

export type StatusAction = 'cancelled' | 'no_show';

export interface AppointmentStatusModalProps {
  open: boolean;
  onClose: () => void;
  action: StatusAction;
  ticketNumber: string;
  appointmentId: string;
  /** Called with the updated record after a successful PATCH. */
  onApplied: (id: string, status: StatusAction, reason: CancelReason | null, note: string | null) => void;
}

const REASONS: { value: CancelReason; ar: string; en: string }[] = [
  { value: 'patient_request', ar: 'طلب المريض', en: 'Patient request' },
  { value: 'clinic_decision', ar: 'قرار العيادة', en: 'Clinic decision' },
  { value: 'duplicate', ar: 'حجز مكرر', en: 'Duplicate booking' },
  { value: 'rescheduled', ar: 'أُعيد جدولته', en: 'Rescheduled' },
  { value: 'other', ar: 'أخرى', en: 'Other' },
];

/**
 * One status fact per appointment: reception picks the reason, optionally
 * adds a note, and the PATCH route enforces the transition rules server-side.
 */
export default function AppointmentStatusModal({
  open,
  onClose,
  action,
  ticketNumber,
  appointmentId,
  onApplied,
}: AppointmentStatusModalProps) {
  const { t } = useLanguage();
  const [reason, setReason] = useState<CancelReason>('patient_request');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCancel = action === 'cancelled';
  const title = isCancel
    ? t('إلغاء الموعد', 'Cancel appointment')
    : t('تسجيل عدم الحضور', 'Mark as no-show');
  const confirmLabel = isCancel
    ? t('تأكيد الإلغاء', 'Confirm cancellation')
    : t('تأكيد عدم الحضور', 'Confirm no-show');

  const reset = () => {
    setReason('patient_request');
    setNote('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/staff/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: action,
          reason,
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      });
      if (res.ok) {
        onApplied(appointmentId, action, reason, note.trim() || null);
        reset();
        onClose();
        return;
      }
      const json = await res.json().catch(() => null);
      const message = json?.error?.messageEn ?? json?.error?.messageAr;
      if (res.status === 409) {
        setError(
          t(
            'لا يمكن تغيير حالة موعد مكتمل أو ملغى أو مسجّل سلفاً بعدم حضور',
            'Completed, cancelled, or already-recorded appointments cannot change status',
          ),
        );
      } else if (res.status === 404) {
        setError(t('الموعد لم يعد موجوداً في السجلات', 'This appointment no longer exists'));
      } else {
        setError(message ?? t('تعذر تحديث الحالة، حاول مرة أخرى', 'Could not update status, please retry'));
      }
    } catch {
      setError(t('تعذر الاتصال بالخادم', 'Could not reach the server'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      labelledById="appointment-status-modal-title"
      panelClassName="w-full max-w-md bg-white rounded-2xl p-6 shadow-xl"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 id="appointment-status-modal-title" className="text-sm font-extrabold text-pine-900">
            {title}
          </h2>
          <p className="text-[11px] text-ink-500 font-mono mt-0.5">{ticketNumber}</p>
        </div>
        <button
          onClick={onClose}
          aria-label={t('إغلاق', 'Close')}
          className="p-1.5 rounded-lg bg-bone-100 hover:bg-bone-200 text-ink-500 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isCancel && (
          <div>
            <label
              htmlFor="appointment-cancel-reason"
              className="block text-xs font-bold text-ink-700 mb-1.5"
            >
              {t('سبب الإلغاء (مطلوب)', 'Cancellation reason (required)')}
            </label>
            <select
              id="appointment-cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as CancelReason)}
              required
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-pine-200 bg-bone-50 text-ink-900 focus:outline-none focus:ring-2 focus:ring-pine-500"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.ar, r.en)}
                </option>
              ))}
            </select>
          </div>
        )}

        {!isCancel && (
          <div>
            <label
              htmlFor="appointment-cancel-reason"
              className="block text-xs font-bold text-ink-700 mb-1.5"
            >
              {t('سبب عدم الحضور (اختياري)', 'No-show reason (optional)')}
            </label>
            <select
              id="appointment-cancel-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value as CancelReason)}
              className="w-full text-xs font-semibold px-3 py-2.5 rounded-xl border border-pine-200 bg-bone-50 text-ink-900 focus:outline-none focus:ring-2 focus:ring-pine-500"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {t(r.ar, r.en)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="appointment-cancel-note"
            className="block text-xs font-bold text-ink-700 mb-1.5"
          >
            {t('ملاحظة (اختياري)', 'Note (optional)')}
          </label>
          <textarea
            id="appointment-cancel-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={500}
            rows={3}
            placeholder={t('مثال: تم تنبيه المريض عبر واتساب', 'e.g. patient notified via WhatsApp')}
            className="w-full text-xs px-3 py-2.5 rounded-xl border border-pine-200 bg-bone-50 text-ink-900 focus:outline-none focus:ring-2 focus:ring-pine-500 resize-none"
          />
          <p className="text-[10px] text-ink-400 mt-1">{note.length} / 500</p>
        </div>

        {error && (
          <p role="alert" className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-xl bg-bone-100 hover:bg-bone-200 text-ink-700 text-xs font-bold transition-colors cursor-pointer"
          >
            {t('تراجع', 'Back')}
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`px-3.5 py-2 rounded-xl text-white text-xs font-extrabold shadow-sm transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
              isCancel ? 'bg-rose-600 hover:bg-rose-700' : 'bg-ink-900 hover:bg-ink-800'
            }`}
          >
            {submitting ? t('جارٍ الحفظ…', 'Saving…') : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
