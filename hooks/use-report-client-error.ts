'use client';

import { useEffect } from 'react';

interface ReportErrorOptions {
  message: string;
  digest?: string;
  stack?: string;
}

export function useReportClientError({ message, digest, stack }: ReportErrorOptions) {
  useEffect(() => {
    if (!message) return;

    fetch('/api/telemetry/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        digest,
        stack,
        locale: document.documentElement.lang || 'ar',
        path: window.location.pathname,
        userAgent: navigator.userAgent,
      }),
    }).catch(() => {
      // telemetry is best-effort — never blocks the user
    });
  }, [message, digest, stack]);
}
