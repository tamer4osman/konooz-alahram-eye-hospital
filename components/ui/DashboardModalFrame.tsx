'use client';

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Modal from '@/components/ui/Modal';

export interface DashboardModalFrameProps {
  isOpen: boolean;
  onClose: () => void;
  /** id of the visible heading, referenced by aria-labelledby */
  labelledById: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: LucideIcon;
  /** Callers render their own <form> here. */
  children: React.ReactNode;
}

/**
 * Shared chrome for the dashboard "register a record" modals: the modal
 * shell, the corner close button, and the icon + bilingual title + subtitle
 * block. Callers keep full control of their fields; only this chrome is
 * shared, and every visual detail is preserved.
 */
export default function DashboardModalFrame({
  isOpen,
  onClose,
  labelledById,
  titleAr,
  titleEn,
  subtitleAr,
  subtitleEn,
  icon: Icon,
  children,
}: DashboardModalFrameProps) {
  const { t } = useLanguage();

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledById={labelledById} panelClassName="max-w-xl w-full p-6">
      <button
        onClick={onClose}
        className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="mb-5">
        <h3 id={labelledById} className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
          <Icon className="w-5 h-5 text-pine-700" />
          <span>{t(titleAr, titleEn)}</span>
        </h3>
        <p className="text-xs text-ink-500 mt-0.5">
          {t(subtitleAr, subtitleEn)}
        </p>
      </div>

      {children}
    </Modal>
  );
}
