'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

/** The pine-900 / CheckCircle2 variant used by Staff and Surgery. */
const SUBMIT_DARK =
  'px-5 py-2.5 bg-pine-900 hover:bg-pine-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50';
/** The pine-700 / Plus variant used by Room and Equipment. */
const SUBMIT_MID =
  'px-5 py-2.5 bg-pine-700 hover:bg-pine-800 text-white rounded-xl font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50';

const SUBMIT_ICON_ON_DARK = 'w-4 h-4 text-brass-400';
const SUBMIT_ICON_ON_MID = 'w-4 h-4';

export interface ModalFormFooterProps {
  onClose: () => void;
  /** Bilingual pair - the footer resolves them through the language context. */
  submitLabelAr: string;
  submitLabelEn: string;
  submitIcon: LucideIcon;
  /** 'dark' (pine-900) or 'mid' (pine-700); preserved per modal. */
  submitTone?: 'dark' | 'mid';
  submitting: boolean;
  /** Server or validation message; rendered in a role=alert banner. */
  error: string | null;
}

/**
 * Shared bottom row for the dashboard modals: the dismissed-banner, the
 * Cancel button, and the submit button. Submit stays disabled while the
 * write is in flight so a failed save can be retried without losing input.
 */
export default function ModalFormFooter({
  onClose,
  submitLabelAr,
  submitLabelEn,
  submitIcon: SubmitIcon,
  submitTone = 'dark',
  submitting,
  error,
}: ModalFormFooterProps) {
  const { t } = useLanguage();

  return (
    <>
      {error && (
        <div role="alert" className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-3 py-2.5 text-xs font-bold">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-ink-500 hover:bg-bone-100 rounded-xl font-bold transition-colors cursor-pointer"
        >
          {t('إلغاء', 'Cancel')}
        </button>
        <button
          type="submit"
          disabled={submitting}
          className={submitTone === 'mid' ? SUBMIT_MID : SUBMIT_DARK}
        >
          <SubmitIcon className={submitTone === 'mid' ? SUBMIT_ICON_ON_MID : SUBMIT_ICON_ON_DARK} />
          <span>{t(submitLabelAr, submitLabelEn)}</span>
        </button>
      </div>
    </>
  );
}
