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

/** Minimal cataract-surgery facts for the outcomes report (ISP port). */
export interface OutcomeSurgeriesReader {
  listForOutcomes(): Promise<Array<{
    procedureAr: string | null;
    procedureEn: string | null;
    status: string;
  }>>;
}

/** Minimal cataract-consultation facts for the outcomes report (ISP port). */
export interface OutcomeConsultationsReader {
  listForOutcomes(): Promise<Array<{
    icdCode: string;
    diagnosisAr: string | null;
    diagnosisEn: string | null;
    visualAcuityOD_BCVA: string;
    visualAcuityOS_BCVA: string;
    surgicalPlan: string | null;
  }>>;
}

export type { AnalyticsTimeframe };

const VALID_TIMEFRAMES: AnalyticsTimeframe[] = ['day', 'week', 'month', 'year'];

/** Pure rule: is the wire timeframe value acceptable? */
export function isValidTimeframe(value: string): value is AnalyticsTimeframe {
  return VALID_TIMEFRAMES.includes(value as AnalyticsTimeframe);
}
