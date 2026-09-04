// ISP ports for the ops-status snapshot. Prisma never crosses this boundary.

import type { EquipmentReadiness, PacuOccupancy, SterileSetTelemetry, SurgeryTelemetry } from './rules';

export interface PacuStayRow {
  enteredAt: Date
  exitedAt: Date
}

export interface OpsActivityRow {
  id: string
  messageAr: string
  messageEn: string | null
  level: string
  /** ISO timestamp — serialized at the adapter boundary for DTO use. */
  createdAt: string
}

export interface OpsActivityReader {
  listRecent(limit: number): Promise<OpsActivityRow[]>
}

export interface OpsTelemetryReader {
  countActiveFlowStages(): Promise<number>
  listClosedPacuStaysSince(since: Date): Promise<PacuStayRow[]>
  pacuOccupancy(): Promise<PacuOccupancy>
  sterileSetTelemetry(): Promise<SterileSetTelemetry>
  equipmentReadiness(): Promise<EquipmentReadiness>
  anyEquipmentOffline(): Promise<boolean>
  surgeryTelemetrySince(since: Date): Promise<SurgeryTelemetry>
}

export interface OpsSnapshot {
  activeInFlow: number
  pacu: PacuOccupancy & { meanStayMin: number | null }
  sterileSets: SterileSetTelemetry
  equipment: EquipmentReadiness & { anyOffline: boolean }
  surgery: SurgeryTelemetry
  systemHealth: { level: string; labelAr: string; labelEn: string }
  activity: Array<{
    id: string
    messageAr: string
    messageEn: string | null
    level: string
    createdAt: string
  }>
}
