import type { PatientFlowStage as FlowStageDTO } from '@/data/dashboardData';
import type { FlowEvent } from '@/lib/dashboard/patientFlow';

// Per-use-case minimal port. The FlowEvent shape is owned by the entities
// layer (lib/dashboard/patientFlow.ts, next to the computation rule that
// consumes it) — this port references it inward, never the Prisma driver.

export interface PatientFlowReader {
  listTodayEvents(startOfDay: Date): Promise<FlowEvent[]>;
}

export type FlowBoard = FlowStageDTO[];
