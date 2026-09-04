import type { Specialty } from '@/data/hospitalData';
import type { AnalyticsTimeframe } from '@/lib/dashboard/analytics';

// Per-use-case minimal ports: the departments reader supplies the specialty
// catalog; the analytics engine computes indicators. The engine itself
// (lib/dashboard/analytics.ts computeAnalytics) is the entities-layer rule.

export interface DepartmentsReader {
  listActive(): Promise<Specialty[]>;
}

export interface AnalyticsEngine {
  compute(timeframe: AnalyticsTimeframe, departments: Specialty[]): Promise<unknown>;
}

export type { AnalyticsTimeframe };

const VALID_TIMEFRAMES: AnalyticsTimeframe[] = ['day', 'week', 'month', 'year'];

/** Pure rule: is the wire timeframe value acceptable? */
export function isValidTimeframe(value: string): value is AnalyticsTimeframe {
  return VALID_TIMEFRAMES.includes(value as AnalyticsTimeframe);
}
