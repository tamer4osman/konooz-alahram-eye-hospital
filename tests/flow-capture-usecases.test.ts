import { describe, it, expect, vi } from 'vitest';
import {
  openPatientStage,
  exitPatientStage,
  StageAlreadyOpenError,
  StageAlreadyClosedError,
  FlowStageNotFoundError,
  type PatientFlowStageQuery,
  type PatientFlowStageStore,
  type FlowStageRef,
} from '@/lib/usecases/patient-flow';

const ref = (over: Partial<FlowStageRef> = {}): FlowStageRef => ({
  id: 'fs-1',
  patientId: 'WALK-1',
  stageType: 'reception',
  enteredAt: new Date('2026-09-04T09:00:00Z'),
  exitedAt: null,
  ...over,
});

function makePorts(current: FlowStageRef | null) {
  const query: PatientFlowStageQuery = {
    findOpenByPatientId: vi.fn().mockResolvedValue(current),
    findStage: vi.fn().mockResolvedValue(current),
  };
  const closed: string[] = [];
  const created: Array<{ patientId: string; stageType: string; enteredAt: Date }> = [];
  const store: PatientFlowStageStore = {
    create: vi.fn(async (input) => {
      created.push(input);
      return { id: 'fs-new' };
    }),
    closeById: vi.fn(async (id) => {
      closed.push(id);
    }),
  };
  return { query, store, closed, created };
}

describe('openPatientStage', () => {
  const now = new Date('2026-09-04T10:00:00Z');

  it('creates the stage when the patient has no open stage', async () => {
    const { query, store, created } = makePorts(null);
    const result = await openPatientStage(query, store, { patientId: 'WALK-1', stageType: 'triage' }, now);
    expect(result).toEqual({ id: 'fs-new', stageType: 'triage' });
    expect(created).toEqual([{ patientId: 'WALK-1', stageType: 'triage', enteredAt: now }]);
  });

  it('rejects opening the same stage twice', async () => {
    const { query, store, created } = makePorts(ref({ stageType: 'triage' }));
    await expect(
      openPatientStage(query, store, { patientId: 'WALK-1', stageType: 'triage' }, now),
    ).rejects.toBeInstanceOf(StageAlreadyOpenError);
    expect(created).toHaveLength(0);
  });

  it('auto-closes the previous open stage when the stage changes', async () => {
    const { query, store, closed, created } = makePorts(ref({ id: 'fs-old', stageType: 'reception' }));
    const result = await openPatientStage(query, store, { patientId: 'WALK-1', stageType: 'triage' }, now);
    expect(closed).toEqual(['fs-old']);
    expect(created).toEqual([{ patientId: 'WALK-1', stageType: 'triage', enteredAt: now }]);
    expect(result).toEqual({ id: 'fs-new', stageType: 'triage' });
  });
});

describe('exitPatientStage', () => {
  const now = new Date('2026-09-04T10:30:00Z');

  it('closes an open stage', async () => {
    const { query, store, closed } = makePorts(ref());
    await exitPatientStage(query, store, 'fs-1', now);
    expect(closed).toEqual(['fs-1']);
  });

  it('throws when the stage does not exist', async () => {
    const { query, store } = makePorts(null);
    await expect(exitPatientStage(query, store, 'fs-x', now)).rejects.toBeInstanceOf(FlowStageNotFoundError);
  });

  it('throws when the stage is already closed', async () => {
    const { query, store } = makePorts(ref({ exitedAt: new Date('2026-09-04T09:30:00Z') }));
    await expect(exitPatientStage(query, store, 'fs-1', now)).rejects.toBeInstanceOf(StageAlreadyClosedError);
  });
});
