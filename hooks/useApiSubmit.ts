'use client';

import { useCallback, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

/** Envelope returned by every /api/staff route: success wraps in `data`, failures in `error`. */
export interface ApiEnvelope<T> {
  data?: T;
  error?: {
    code?: string;
    messageAr?: string;
    messageEn?: string;
  };
}

interface SubmitOptions<T> {
  url: string;
  /** HTTP verb for the write. Defaults to POST. */
  method?: 'POST' | 'PATCH' | 'PUT';
  payload?: unknown;
  /** Receives the persisted record; only called when the server confirms. */
  onSuccess?: (data: T) => void;
}

interface UseApiSubmit<T> {
  submitting: boolean;
  error: string | null;
  clearError: () => void;
  /** Resolves true only when the server persisted the record. */
  submit: (options: SubmitOptions<T>) => Promise<boolean>;
}

const FALLBACK_AR = 'تعذر حفظ البيانات، يرجى المحاولة مرة أخرى';
const FALLBACK_EN = 'Could not save, please retry';
const UNCONFIRMED_AR = 'لم يرسل الخادم تأكيداً بالحفظ';
const UNCONFIRMED_EN = 'The server did not confirm the save';
const UNREACHABLE_AR = 'تعذر الوصول إلى الخادم';
const UNREACHABLE_EN = 'Could not reach the server';

/**
 * Shared write path for the dashboard modals.
 *
 * Closes the gap where a failed save dismissed the modal and discarded the
 * operator's input: callers must act on the boolean and only close when the
 * server actually confirmed. Server-provided messages are preferred over the
 * bilingual fallbacks so validation reasons survive translation.
 */
export function useApiSubmit<T>(): UseApiSubmit<T> {
  const { lang, t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const submit = useCallback(
    async ({ url, method = 'POST', payload, onSuccess }: SubmitOptions<T>) => {
      setError(null);
      setSubmitting(true);
      try {
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: payload === undefined ? undefined : JSON.stringify(payload),
        });
        const json = (await res.json().catch(() => null)) as ApiEnvelope<T> | null;

        if (!res.ok) {
          const serverMessage = lang === 'ar' ? json?.error?.messageAr : json?.error?.messageEn;
          setError(serverMessage ?? t(FALLBACK_AR, FALLBACK_EN));
          return false;
        }

        if (json?.data) {
          onSuccess?.(json.data);
          return true;
        }

        setError(t(UNCONFIRMED_AR, UNCONFIRMED_EN));
        return false;
      } catch {
        setError(t(UNREACHABLE_AR, UNREACHABLE_EN));
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [lang, t]
  );

  return { submitting, error, clearError, submit };
}
