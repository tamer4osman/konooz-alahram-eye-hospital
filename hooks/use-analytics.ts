'use client';

import { useEffect, useState } from 'react';
import type { AnalyticsDTO, AnalyticsTimeframe } from '@/lib/dashboard/analytics';

// KPIs, timelines, and workloads are computed server-side from live database
// records; this hook only carries the fetch lifecycle. Returns null until the
// first successful response so callers can render honest fallbacks.
export function useAnalytics(timeframe: AnalyticsTimeframe): AnalyticsDTO | null {
  const [analytics, setAnalytics] = useState<AnalyticsDTO | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/staff/analytics?timeframe=${timeframe}`)
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.data) setAnalytics(json.data as AnalyticsDTO);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [timeframe]);

  return analytics;
}
