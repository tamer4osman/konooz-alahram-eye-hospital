'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { GitBranch, UserRound, ArrowRight, RefreshCw, LogOut, PlayCircle, AlertTriangle } from 'lucide-react';
import { FLOW_STAGE_TYPES, type FlowStageInput } from '@/lib/validation/flow-capture';

interface OpenStage {
  id: string;
  patientId: string;
  stageType: FlowStageInput;
  enteredAt: string;
}

interface StageMeta {
  titleAr: string;
  titleEn: string;
  color: string;
}

// Display metadata mirrors lib/dashboard/patientFlow.ts FLOW_STAGE_META.
const STAGE_META: Record<FlowStageInput, StageMeta> = {
  reception: { titleAr: 'الاستقبال', titleEn: 'Reception', color: '#0D9488' },
  triage: { titleAr: 'الفرز المبدئي', titleEn: 'Triage', color: '#0D9488' },
  diagnostics: { titleAr: 'الفحوصات والأشعة', titleEn: 'Diagnostics', color: '#2563EB' },
  consultation: { titleAr: 'مناظرة الاستشاري', titleEn: 'Consultation', color: '#7C3AED' },
  pre_op: { titleAr: 'التحضير قبل الجراحة', titleEn: 'Pre-Op', color: '#DB2777' },
  in_or: { titleAr: 'غرفة العمليات', titleEn: 'Operating Theater', color: '#DC2626' },
  procedure: { titleAr: 'الإجراءات', titleEn: 'Procedure', color: '#DC2626' },
  pacu: { titleAr: 'الإفاقة', titleEn: 'Recovery (PACU)', color: '#EA580C' },
  waiting_discharge: { titleAr: 'الخروج والتعليمات', titleEn: 'Discharge', color: '#65A30D' },
  discharged: { titleAr: 'خرج', titleEn: 'Discharged', color: '#65A30D' },
};

export default function FlowTab() {
  const { lang, t } = useLanguage();

  const [openStages, setOpenStages] = useState<OpenStage[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [patientId, setPatientId] = useState('');
  const [stage, setStage] = useState<FlowStageInput>('reception');
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async (signal: AbortSignal) => {
    setLoadError(false);
    try {
      const res = await fetch('/api/staff/patient-flow', { signal });
      if (!res.ok) {
        setLoadError(true);
        setOpenStages(null);
        return;
      }
      const json = await res.json();
      const rows = Array.isArray(json?.data?.openStages) ? (json.data.openStages as OpenStage[]) : [];
      setOpenStages(rows);
    } catch (err) {
      if ((err as Error)?.name !== 'AbortError') {
        setLoadError(true);
        setOpenStages(null);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load, reloadKey]);

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setSubmitting(true);
    try {
      const res = await fetch('/api/staff/patient-flow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: patientId.trim(), stageType: stage }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok) {
        setPatientId('');
        void setReloadKey((k) => k + 1);
      } else {
        setActionError(json?.messageAr ?? t('تعذر تسجيل المرحلة', 'Could not record the stage'));
      }
      if (res.status === 409 && json?.code === 'STAGE_ALREADY_OPEN' && json?.messageAr) {
        setActionError(lang === 'ar' ? json.messageAr : json.messageEn ?? json.messageAr);
      }
    } catch {
      setActionError(t('تعذر الاتصال بالخادم', 'Could not reach the server'));
    } finally {
      setSubmitting(false);
  }
  };

  const handleExit = async (row: OpenStage) => {
    setActionError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/staff/patient-flow/${row.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'exit' }),
      });
      if (res.ok) {
        void setReloadKey((k) => k + 1);
      } else {
        const json = await res.json().catch(() => null);
        setActionError(json?.messageAr ?? t('تعذر إغلاق المرحلة', 'Could not close the stage'));
      }
    } catch {
      setActionError(t('تعذر الاتصال بالخادم', 'Could not reach the server'));
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting;

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* Header banner */}
      <div className="bg-white p-5 rounded-2xl border border-pine-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-pine-700" />
            <span>{t('تدفق المرضى بين المراحل', 'Patient Flow Stages')}</span>
          </h2>
          <p className="text-xs text-ink-500 mt-0.5">
            {t(
              'سجّل دخول المريض إلى كل مرحلة وخروجاً منها — زمن الانتظار والقمع الزمني في التحليلات يُبنى من هذه التسجيلات',
              'Record when a patient enters and leaves each stage — wait times and the analytics funnel are built from these records',
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((k) => k + 1)}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border border-pine-200 text-pine-800 hover:bg-bone-100 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          {t('تحديث', 'Refresh')}
        </button>
      </div>

      {/* Open-stage form */}
      <form
        onSubmit={handleOpen}
        className="bg-white p-5 rounded-2xl border border-pine-200 shadow-sm grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end"
      >
        <div>
          <label htmlFor="flow-patient-id" className="block text-xs font-bold text-ink-700 mb-1">
            {t('رمز المريض', 'Patient code')}
          </label>
          <div className="relative">
            <UserRound className="w-4 h-4 text-ink-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="flow-patient-id"
              name="patientId"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder={t('مثال: WALK-1234', 'e.g. WALK-1234')}
              maxLength={80}
              className="w-full ps-9 pe-3 py-2 text-xs bg-white border border-pine-900/15 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-none"
            />
          </div>
        </div>
        <div>
          <label htmlFor="flow-stage" className="block text-xs font-bold text-ink-700 mb-1">
            {t('المرحلة', 'Stage')}
          </label>
          <div className="relative">
            <select
              id="flow-stage"
              name="stageType"
              value={stage}
              onChange={(e) => setStage(e.target.value as FlowStageInput)}
              className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-xl appearance-none focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-none"
            >
              {FLOW_STAGE_TYPES.map((s) => (
                <option key={s} value={s}>
                  {lang === 'ar' ? STAGE_META[s].titleAr : STAGE_META[s].titleEn}
                </option>
              ))}
            </select>
            <ArrowRight className="w-3.5 h-3.5 text-ink-400 absolute end-2.5 top-1/2 -translate-y-1/2 pointer-events-none rotate-90" />
          </div>
        </div>
        <button
          type="submit"
          disabled={busy || !patientId.trim()}
          className="px-4 py-2.5 text-xs font-bold bg-pine-900 text-white rounded-xl hover:bg-pine-800 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
        >
          <PlayCircle className="w-4 h-4" />
          {t('فتح مرحلة', 'Open stage')}
        </button>
      </form>

      {actionError && (
        <div role="alert" className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-4 py-3 text-xs font-bold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Open stages list */}
      <div className="bg-white rounded-2xl border border-pine-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-pine-200 flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-pine-900">
            {t('مراحل مفتوحة الآن', 'Currently open stages')}
          </h3>
          {openStages && (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-pine-100 text-pine-800">
              {openStages.length}
            </span>
          )}
        </div>
        {openStages === null ? (
          <div className="p-8 text-center text-xs text-ink-500">
            {loadError
              ? t('تعذر تحميل البيانات', 'Could not load data')
              : t('جارٍ التحميل...', 'Loading...')}
          </div>
        ) : openStages.length === 0 ? (
          <div className="p-8 text-center text-xs text-ink-500">
            {t('لا توجد مراحل مفتوحة حالياً', 'No stages currently open')}
          </div>
        ) : (
          <ul className="divide-y divide-pine-100">
            {openStages.map((row) => {
              const entered = new Date(row.enteredAt);
              const minutes = Math.max(0, Math.round((Date.now() - entered.getTime()) / 60_000));
              return (
                <li key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-2 px-5 py-3.5">
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: STAGE_META[row.stageType].color }} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-xs font-extrabold text-ink-900 font-mono truncate">{row.patientId}</p>
                      <p className="text-[11px] text-ink-500">
                        {lang === 'ar' ? STAGE_META[row.stageType].titleAr : STAGE_META[row.stageType].titleEn}
                        {' · '}
                        {t('منذ', 'for')} {minutes} {t('دقيقة', 'min')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExit(row)}
                    disabled={busy}
                    className="self-start sm:self-auto px-3 py-1.5 text-[11px] font-bold rounded-lg border border-pine-200 text-pine-800 hover:bg-pine-50 disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t('تسجيل الخروج من المرحلة', 'Confirm exit')}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
