import type {
  FlowBoard,
  FlowStageRef,
  OpenStageLister,
  PatientFlowReader,
  PatientFlowStageQuery,
  PatientFlowStageStore,
} from './ports';
import { resolveStageExit, resolveStageOpen } from './rules';
import { computeFlowStages, type FlowStageType } from '@/lib/dashboard/patientFlow';

// Use cases: orchestration only. Business rules live in rules.ts; ports are
// injected as first arguments. Errors propagate unchanged — the route handler
// maps them onto HTTP responses.

// Use case: fetch today's events, delegate computation to the pure rule.

export async function loadFlowBoard(reader: PatientFlowReader, now: Date = new Date()): Promise<FlowBoard> {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const events = await reader.listTodayEvents(startOfDay);
  return computeFlowStages(events);
}

export interface StageOpenResult {
  id: string;
  stageType: FlowStageType;
}

/** Open a stage for a patient, auto-closing any previous open stage. */
export async function openPatientStage(
  query: PatientFlowStageQuery,
  store: PatientFlowStageStore,
  input: { patientId: string; stageType: FlowStageType },
  now: Date = new Date(),
): Promise<StageOpenResult> {
  const current = await query.findOpenByPatientId(input.patientId);
  const resolved = resolveStageOpen(current, input, now);
  if (resolved.closeId) {
    await store.closeById(resolved.closeId, now);
  }
  const created = await store.create(resolved.create);
  return { id: created.id, stageType: input.stageType };
}

/** Confirm the patient left a stage (stamps exitedAt). */
export async function exitPatientStage(
  query: PatientFlowStageQuery,
  store: PatientFlowStageStore,
  id: string,
  now: Date = new Date(),
): Promise<void> {
  const current = await query.findStage(id);
  const resolved = resolveStageExit(current, now);
  await store.closeById(resolved.id, resolved.exitedAt);
}

export type { FlowStageRef };

/** Snapshot for the capture UI: board + currently open stages. */
export interface FlowSnapshot {
  board: FlowBoard;
  openStages: Array<{
    id: string;
    patientId: string;
    stageType: FlowStageType;
    enteredAt: string;
  }>;
}

export async function loadFlowSnapshot(
  boardReader: PatientFlowReader,
  lister: OpenStageLister,
  now: Date = new Date(),
): Promise<FlowSnapshot> {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const [board, openStages] = await Promise.all([
    loadFlowBoard(boardReader, now),
    lister.listOpenStages(startOfDay),
  ]);
  return {
    board,
    openStages: openStages.map((row) => ({
      id: row.id,
      patientId: row.patientId,
      stageType: row.stageType,
      enteredAt: row.enteredAt.toISOString(),
    })),
  };
}
