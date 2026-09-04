import type { FlowBoard, PatientFlowReader } from './ports';
import { computeFlowStages } from '@/lib/dashboard/patientFlow';

// Use case: fetch today's events, delegate computation to the pure rule.

export async function loadFlowBoard(reader: PatientFlowReader, now: Date = new Date()): Promise<FlowBoard> {
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const events = await reader.listTodayEvents(startOfDay);
  return computeFlowStages(events);
}
