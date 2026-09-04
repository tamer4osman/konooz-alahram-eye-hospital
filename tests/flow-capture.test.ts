import { describe, it, expect } from 'vitest';
import { buildFlowOpenPayload, buildFlowExitPayload, type FlowFormInput } from '@/lib/validation/flow-capture';

const base: FlowFormInput = {
  patientId: '  WALK-1234  ',
  stageType: 'triage',
};

describe('buildFlowOpenPayload', () => {
  it('trims the patient id and keeps the stage', () => {
    const result = buildFlowOpenPayload(base);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload).toEqual({ patientId: 'WALK-1234', stageType: 'triage' });
  });

  it('rejects a blank patient id', () => {
    const result = buildFlowOpenPayload({ ...base, patientId: '   ' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.patientId).toBe(true);
  });

  it('rejects a patient id over 80 chars', () => {
    const result = buildFlowOpenPayload({ ...base, patientId: 'x'.repeat(81) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.patientId).toBe(true);
  });

  it('rejects a stage outside the canonical sequence', () => {
    const result = buildFlowOpenPayload({ ...base, stageType: 'lobby' as FlowFormInput['stageType'] });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.stageType).toBe(true);
  });
});

describe('buildFlowExitPayload', () => {
  it('accepts an optional note trimmed under the limit', () => {
    const result = buildFlowExitPayload({ noteAr: '  تم الإفراج  ' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload).toEqual({ noteAr: 'تم الإفراج' });
  });

  it('rejects a note over 300 chars', () => {
    const result = buildFlowExitPayload({ noteAr: 'x'.repeat(301) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.noteAr).toBe(true);
  });
});
