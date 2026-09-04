import type {
  AnalyticsEngine,
  AnalyticsTimeframe,
  DepartmentsReader,
} from './ports';
import { computeAnalytics } from '@/lib/dashboard/analytics';

// Use case: orchestrate departments + analytics engine. The concrete engine
// from lib/dashboard/analytics is passed by the composition root (route), so
// this orchestration stays framework-free.

export async function loadAnalytics(
  departments: DepartmentsReader,
  engine: AnalyticsEngine,
  timeframe: AnalyticsTimeframe,
): Promise<unknown> {
  const specialties = await departments.listActive();
  return engine.compute(timeframe, specialties);
}

/** Concrete engine adapter over the entities-layer computation. */
export const dashboardAnalyticsEngine: AnalyticsEngine = {
  compute: (timeframe, departments) => computeAnalytics(timeframe, departments),
};
