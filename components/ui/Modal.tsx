'use client';

import React, { useCallback, useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])'
].join(', ');

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** id of the visible heading element this dialog is labelled by */
  labelledById: string;
  children: React.ReactNode;
  /** Tailwind classes for the panel container (size, radius, padding) */
  panelClassName?: string;
  /** Close when the dark backdrop itself is clicked. Opt-in: forms may lose data. */
  closeOnBackdrop?: boolean;
}

/**
 * Accessible modal shell: Escape-to-close, focus trap + restore,
 * body scroll lock, aria-modal labelling. Callers render their own
 * chrome (headers/close buttons) inside `children`.
 */
export default function Modal({
  isOpen,
  onClose,
  labelledById,
  children,
  panelClassName = '',
  closeOnBackdrop = false
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  // Escape closes the topmost open modal
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!isOpen || typeof document === 'undefined') return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Move focus into the dialog on open, restore it on close
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    return () => {
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  // Minimal focus trap: keep Tab cycling inside the panel
  const handleTabKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !panelRef.current) return;
    const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      .filter((el) => el.offsetParent !== null);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!isOpen) return null;

  return (
    // Backdrop: pointer-close is opt-in and guarded; keyboard users close via
    // Escape (window listener above). role=presentation marks it as decorative.
    <div
      role="presentation"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-start sm:items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn"
      onClick={(e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) onClose();
      }}
    >
      {/* Focus-trap host: role=dialog + tabIndex=-1 per WAI-ARIA modal pattern;
          the keydown handler implements the required Tab cycling. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledById}
        tabIndex={-1}
        onKeyDown={handleTabKey}
        className={`relative bg-white rounded-2xl shadow-2xl border border-slate-200 outline-none ${panelClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
