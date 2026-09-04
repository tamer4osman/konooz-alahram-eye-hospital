import { describe, it, expect } from 'vitest';
import {
  computeSatisfactionKpi,
  computeWaitTimeFunnel,
  FLOW_STAGE_SEQUENCE,
  type FlowStageRow,
} from '@/lib/usecases/analytics/rules';

describe('computeSatisfactionKpi', () => {
  it('maps 1-5 ratings and 0-10 recommend scores to percentages and NPS', () => {
    const result = computeSatisfactionKpi([
      { overallRating: 5, recommendScore: 9 },
      { overallRating: 4, recommendScore: 8 },
      { overallRating: 3, recommendScore: 6 },
    ]);
    // avg rating 4.0 -> 80%; promoter 1/3, passive 1/3, detractor 1/3 -> NPS 0
    expect(result.avgRating).toBe(4);
    expect(result.satisfactionPercent).toBe(80);
    expect(result.nps).toBe(0);
    expect(result.responseCount).toBe(3);
  });

  it('computes positive NPS when promoters outnumber detractors', () => {
    const result = computeSatisfactionKpi([
      { overallRating: 5, recommendScore: 10 },
      { overallRating: 5, recommendScore: 9 },
      { overallRating: 4, recommendScore: 7 },
      { overallRating: 3, recommendScore: 5 },
    ]);
    // promoter 2/4, passive 1/4, detractor 1/4 -> NPS 25
    expect(result.nps).toBe(25);
  });

  it('rounds avgRating to one decimal', () => {
    const result = computeSatisfactionKpi([
      { overallRating: 5, recommendScore: 5 },
      { overallRating: 4, recommendScore: 5 },
      { overallRating: 4, recommendScore: 5 },
    ]);
    expect(result.avgRating).toBe(4.3);
  });

  it('returns nulls for empty input — never a fabricated zero', () => {
    const result = computeSatisfactionKpi([]);
    expect(result.avgRating).toBeNull();
    expect(result.satisfactionPercent).toBeNull();
    expect(result.nps).toBeNull();
    expect(result.responseCount).toBe(0);
  });

  it('ignores malformed rows defensively (null ratings)', () => {
    const result = computeSatisfactionKpi([
      { overallRating: 4, recommendScore: 7 },
      { overallRating: null, recommendScore: null },
    ]);
    expect(result.responseCount).toBe(1);
    expect(result.avgRating).toBe(4);
  });

  it('clamps NPS to -100..100 even with extreme inputs', () => {
    const result = computeSatisfactionKpi([{ overallRating: 1, recommendScore: 0 }]);
    expect(result.nps).toBe(-100);
  });
});

describe('computeWaitTimeFunnel', () => {
  const stage = (
    appointmentId: string,
    stageName: string,
    enteredAt: Date,
  ): FlowStageRow => ({ appointmentId, stageName, enteredAt });

  it('computes stage-to-stage wait in minutes per day using the canonical sequence', () => {
    const day = '2026-09-04';
    const rows = [
      stage('a', 'reception', new Date(2026, 8, 4, 9, 0)),
      stage('a', 'triage', new Date(2026, 8, 4, 9, 20)),
      stage('a', 'consultation', new Date(2026, 8, 4, 9, 50)),
    ];
    const result = computeWaitTimeFunnel(rows, day);
    expect(result.day).toBe(day);
    expect(result.stages).toHaveLength(2);
    expect(result.stages[0]).toEqual({
      fromStage: 'reception',
      toStage: 'triage',
      avgWaitMin: 20,
      transitions: 1,
    });
    expect(result.stages[1]).toEqual({
      fromStage: 'reception',
      toStage: 'consultation',
      avgWaitMin: 50,
      transitions: 1,
    });
  });

  it('averages across multiple patients on the same day', () => {
    const day = '2026-09-04';
    const rows = [
      stage('a', 'reception', new Date(2026, 8, 4, 9, 0)),
      stage('a', 'triage', new Date(2026, 8, 4, 9, 10)),
      stage('b', 'reception', new Date(2026, 8, 4, 10, 0)),
      stage('b', 'triage', new Date(2026, 8, 4, 10, 30)),
    ];
    const result = computeWaitTimeFunnel(rows, day);
    const first = result.stages.find((s) => s.fromStage === 'reception' && s.toStage === 'triage');
    expect(first?.transitions).toBe(2);
    expect(first?.avgWaitMin).toBe(20);
  });

  it('orders stages by the canonical sequence, not by arrival time or alphabetically', () => {
    const day = '2026-09-04';
    const rows = [
      stage('a', 'discharged', new Date(2026, 8, 4, 11, 0)),
      stage('a', 'reception', new Date(2026, 8, 4, 9, 0)),
      stage('a', 'procedure', new Date(2026, 8, 4, 10, 0)),
      stage('a', 'consultation', new Date(2026, 8, 4, 9, 30)),
    ];
    const result = computeWaitTimeFunnel(rows, day);
    expect(result.stages.map((s) => s.toStage)).toEqual([
      'consultation',
      'procedure',
      'discharged',
    ]);
  });

  it('skips negative or missing timestamps rather than reporting lies', () => {
    const day = '2026-09-04';
    const rows = [
      stage('a', 'reception', new Date(2026, 8, 4, 9, 0)),
      stage('a', 'triage', new Date(2026, 8, 4, 8, 30)), // before reception: impossible
      stage('a', 'consultation', new Date(2026, 8, 4, 9, 20)),
    ];
    const result = computeWaitTimeFunnel(rows, day);
    const triage = result.stages.find((s) => s.toStage === 'triage');
    expect(triage).toBeUndefined();
    const consultation = result.stages.find((s) => s.toStage === 'consultation');
    expect(consultation?.transitions).toBe(1);
    expect(consultation?.avgWaitMin).toBe(20);
  });

  it('ignores rows outside the requested day', () => {
    const day = '2026-09-04';
    const rows = [
      stage('a', 'reception', new Date(2026, 8, 4, 9, 0)),
      stage('a', 'triage', new Date(2026, 8, 4, 9, 10)),
      stage('c', 'reception', new Date(2026, 8, 5, 9, 0)),
      stage('c', 'triage', new Date(2026, 8, 5, 9, 40)),
    ];
    const result = computeWaitTimeFunnel(rows, day);
    const triage = result.stages.find((s) => s.toStage === 'triage');
    expect(triage?.transitions).toBe(1);
    expect(triage?.avgWaitMin).toBe(10);
  });
});

describe('FLOW_STAGE_SEQUENCE', () => {
  it('covers the DB enum values in clinical order', () => {
    expect(FLOW_STAGE_SEQUENCE[0]).toBe('reception');
    expect(FLOW_STAGE_SEQUENCE).toContain('triage');
    expect(FLOW_STAGE_SEQUENCE).toContain('consultation');
    expect(FLOW_STAGE_SEQUENCE).toContain('procedure');
    expect(FLOW_STAGE_SEQUENCE).toContain('pre_op');
    expect(FLOW_STAGE_SEQUENCE).toContain('in_or');
    expect(FLOW_STAGE_SEQUENCE).toContain('pacu');
    expect(FLOW_STAGE_SEQUENCE).toContain('waiting_discharge');
    expect(FLOW_STAGE_SEQUENCE).toContain('discharged');
    expect(FLOW_STAGE_SEQUENCE).toContain('diagnostics');
  });
});
