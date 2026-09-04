import { describe, it, expect } from 'vitest';
import {
  computeCataractOutcomes,
  parseSnellen,
  gradeVisualOutcome,
  WHO_GOOD_SIXTY,
  WHO_BORDERLINE_SIXTY,
  type OutcomeSurgeryInput,
  type OutcomeConsultationInput,
} from '@/lib/usecases/analytics/rules';

const surgery = (over: Partial<OutcomeSurgeryInput> & { id: string }): OutcomeSurgeryInput => ({
  procedureEn: 'Phacoemulsification & IOL Implantation',
  procedureAr: 'جراحة المياه البيضاء',
  status: 'completed',
  ...over,
});

const consultation = (over: Partial<OutcomeConsultationInput> & { id: string }): OutcomeConsultationInput => ({
  icdCode: 'H25.9',
  diagnosisEn: 'Cataract',
  diagnosisAr: 'مياه بيضاء',
  visualAcuityOD_BCVA: '6/6',
  visualAcuityOS_BCVA: '6/6',
  surgicalPlan: null,
  ...over,
});

describe('parseSnellen', () => {
  it('parses standard and metric fractions', () => {
    expect(parseSnellen('6/6')).toBe(1.0);
    expect(parseSnellen('6/60')).toBe(0.1);
    expect(parseSnellen('20/20')).toBe(1.0);
    expect(parseSnellen('20/40')).toBeCloseTo(0.5);
    expect(parseSnellen('20/200')).toBe(0.1);
    expect(parseSnellen('6/12')).toBeCloseTo(0.5);
    expect(parseSnellen('6/18')).toBeCloseTo(1 / 3);
  });

  it('handles common notation variants', () => {
    expect(parseSnellen('6/6p')).toBe(1.0);
    expect(parseSnellen('CF')).toBe(0.005);
    expect(parseSnellen('HM')).toBe(0.005);
    expect(parseSnellen('PL')).toBe(0.001);
    expect(parseSnellen('NLP')).toBe(0);
    expect(parseSnellen('counting fingers')).toBe(0.005);
  });

  it('returns null for empty or garbage', () => {
    expect(parseSnellen('')).toBeNull();
    expect(parseSnellen('   ')).toBeNull();
    expect(parseSnellen('N/A')).toBeNull();
    expect(parseSnellen('6/0')).toBeNull();
  });
});

describe('gradeVisualOutcome', () => {
  it('applies WHO cataract-surgery thresholds (>=6/18 good, <6/60 borderline)', () => {
    expect(gradeVisualOutcome(1.0)).toBe('good');
    expect(gradeVisualOutcome(WHO_GOOD_SIXTY)).toBe('good'); // exactly 6/18
    expect(gradeVisualOutcome(WHO_BORDERLINE_SIXTY + 0.01)).toBe('borderline');
    expect(gradeVisualOutcome(WHO_BORDERLINE_SIXTY)).toBe('borderline'); // exactly 6/60
    expect(gradeVisualOutcome(0.05)).toBe('poor');
    expect(gradeVisualOutcome(0)).toBe('poor');
    expect(gradeVisualOutcome(null)).toBe('unknown');
  });
});

describe('computeCataractOutcomes', () => {
  it('counts only cataract procedures as surgery volume', () => {
    const report = computeCataractOutcomes(
      [
        surgery({ id: 's1' }),
        surgery({ id: 's2', status: 'scheduled' }),
        surgery({ id: 's3', status: 'completed', procedureEn: 'Vitrectomy for retinal detachment', procedureAr: 'استئصال زجاجي' }),
        surgery({ id: 's4', status: 'completed', procedureEn: 'LASIK refractive correction', procedureAr: 'ليزك' }),
      ],
      [],
      new Date('2026-09-04T12:00:00Z'),
    );
    expect(report.surgeries.total).toBe(2);
    expect(report.surgeries.completed).toBe(1);
    expect(report.surgeries.scheduled).toBe(1);
    expect(report.surgeries.cancelled).toBe(0);
  });

  it('counts consultations with cataract ICD codes or cataract diagnosis text', () => {
    const report = computeCataractOutcomes(
      [],
      [
        consultation({ id: 'c1', icdCode: 'H25.0' }),
        consultation({ id: 'c2', icdCode: '', diagnosisEn: 'Senile cataract, right eye' }),
        consultation({ id: 'c3', icdCode: 'H26.4', diagnosisEn: 'After-cataract' }),
        consultation({ id: 'c4', icdCode: 'H35.3', diagnosisEn: 'AMD' }),
        consultation({ id: 'c5', icdCode: '', diagnosisEn: '' }),
      ],
      new Date('2026-09-04T12:00:00Z'),
    );
    expect(report.consultations.total).toBe(3);
    expect(report.consultations.surgicalPlanned).toBe(0);
  });

  it('grades BCVA into WHO buckets and counts unknowns', () => {
    const report = computeCataractOutcomes(
      [],
      [
        consultation({ id: 'c1', visualAcuityOD_BCVA: '6/6' }),
        consultation({ id: 'c2', visualAcuityOD_BCVA: '6/6', visualAcuityOS_BCVA: '6/18' }),
        consultation({ id: 'c3', visualAcuityOD_BCVA: 'CF', visualAcuityOS_BCVA: 'CF' }),
        consultation({ id: 'c4', visualAcuityOD_BCVA: '', visualAcuityOS_BCVA: '' }),
        consultation({ id: 'c5', visualAcuityOD_BCVA: '6/60', visualAcuityOS_BCVA: '6/60' }),
      ],
      new Date('2026-09-04T12:00:00Z'),
    );
    // best eye: c1 good, c2 good, c3 poor, c4 unknown, c5 borderline
    expect(report.visualOutcomes).toEqual({ good: 2, borderline: 1, poor: 1, unknown: 1 });
  });

  it('uses the best (higher) of both eyes for grading', () => {
    const report = computeCataractOutcomes(
      [],
      [
        consultation({ id: 'c1', visualAcuityOD_BCVA: 'CF', visualAcuityOS_BCVA: '6/12' }),
        consultation({ id: 'c2', visualAcuityOD_BCVA: '6/6', visualAcuityOS_BCVA: 'HM' }),
      ],
      new Date('2026-09-04T12:00:00Z'),
    );
    expect(report.visualOutcomes).toEqual({ good: 2, borderline: 0, poor: 0, unknown: 0 });
  });

  it('summarizes honestly: no fabricated success rate when data is missing', () => {
    const report = computeCataractOutcomes([], [], new Date('2026-09-04T12:00:00Z'));
    expect(report).toEqual({
      surgeries: { total: 0, completed: 0, scheduled: 0, cancelled: 0 },
      consultations: { total: 0, surgicalPlanned: 0 },
      visualOutcomes: { good: 0, borderline: 0, poor: 0, unknown: 0 },
      gradedCount: 0,
      goodOutcomeRate: null,
      hasData: false,
    });
  });

  it('computes good-outcome rate only over graded records, flags hasData', () => {
    const report = computeCataractOutcomes(
      [],
      [
        consultation({ id: 'c1', visualAcuityOD_BCVA: '6/6' }),
        consultation({ id: 'c2', visualAcuityOD_BCVA: '6/6', visualAcuityOS_BCVA: '6/6' }),
        consultation({ id: 'c3', visualAcuityOD_BCVA: '6/18', visualAcuityOS_BCVA: '6/18' }),
        consultation({ id: 'c4', visualAcuityOD_BCVA: 'CF', visualAcuityOS_BCVA: 'CF' }),
      ],
      new Date('2026-09-04T12:00:00Z'),
    );
    expect(report.gradedCount).toBe(4);
    expect(report.goodOutcomeRate).toBe(75); // 3 of 4 >= 6/18
    expect(report.hasData).toBe(true);
  });

  it('tracks surgical-plan mentions among cataract consultations', () => {
    const report = computeCataractOutcomes(
      [],
      [
        consultation({ id: 'c1', surgicalPlan: 'Phaco + IOL next week' }),
        consultation({ id: 'c2' }),
      ],
      new Date('2026-09-04T12:00:00Z'),
    );
    expect(report.consultations.surgicalPlanned).toBe(1);
  });
});
