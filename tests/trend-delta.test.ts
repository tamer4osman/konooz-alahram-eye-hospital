import { describe, it, expect } from 'vitest';
import { computeTrendDelta, type TrendDelta } from '@/lib/usecases/analytics/rules';

describe('computeTrendDelta', () => {
  it('reports up when current exceeds previous (numeric direction only)', () => {
    const result: TrendDelta | null = computeTrendDelta(80, 60);
    expect(result).toEqual({ direction: 'up', delta: 20 });
  });

  it('reports down when current is lower (regardless of whether that is good)', () => {
    expect(computeTrendDelta(12, 25)).toEqual({ direction: 'down', delta: -13 });
  });

  it('reports flat when values match', () => {
    expect(computeTrendDelta(50, 50)).toEqual({ direction: 'flat', delta: 0 });
  });

  it('handles negative deltas (NPS can go below zero)', () => {
    expect(computeTrendDelta(-20, -40)).toEqual({ direction: 'up', delta: 20 });
    expect(computeTrendDelta(-40, -20)).toEqual({ direction: 'down', delta: -20 });
  });

  it('returns null when the current period is unmeasured (no fake trend)', () => {
    expect(computeTrendDelta(null, 60)).toBeNull();
  });

  it('returns null when the previous period is unmeasured', () => {
    expect(computeTrendDelta(80, null)).toBeNull();
  });

  it('returns null when both periods are unmeasured', () => {
    expect(computeTrendDelta(null, null)).toBeNull();
  });
});
