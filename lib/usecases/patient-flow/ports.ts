import type { PatientFlowStage as FlowStageDTO } from '@/data/dashboardData';
import type { FlowEvent, FlowStageType } from '@/lib/dashboard/patientFlow';

// Per-use-case minimal ports (ISP) for the patient-flow module. The FlowEvent
// and FlowStageType shapes are owned by the entities layer
// (lib/dashboard/patientFlow.ts); Prisma types never cross this boundary.

export interface PatientFlowReader {
  listTodayEvents(startOfDay: Date): Promise<FlowEvent[]>;
}

export type FlowBoard = FlowStageDTO[];

export interface FlowStageRef {
  id: string;
  patientId: string;
  stageType: FlowStageType;
  enteredAt: Date;
  exitedAt: Date | null;
}

export interface PatientFlowStageQuery {
  /** The patient's currently open (not yet exited) stage, or null. */
  findOpenByPatientId(patientId: string): Promise<FlowStageRef | null>;
  /** One stage row by id, or null if it does not exist. */
  findStage(id: string): Promise<FlowStageRef | null>;
}

export interface PatientFlowStageStore {
  create(input: { patientId: string; stageType: FlowStageType; enteredAt: Date }): Promise<{ id: string }>;
  closeById(id: string, exitedAt: Date, notes?: { noteAr?: string; noteEn?: string }): Promise<void>;
}

/** Open (not yet exited) stage rows for the dashboard capture UI. */
export interface OpenStageLister {
  listOpenStages(startOfDay: Date): Promise<FlowStageRef[]>;
}
