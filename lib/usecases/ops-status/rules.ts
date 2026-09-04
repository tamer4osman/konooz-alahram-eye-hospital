// Pure telemetry computations for the dashboard ops snapshot. Framework-free:
// inputs are plain rows, outputs are DTO-safe numbers or null (never a
// fabricated fallback). Seeded demo data feeds these at demo time; live rows
// replace it at go-live without any UI change.

export interface FlowStageRow {
  stageType: string;
  enteredAt: Date | null;
  exitedAt: Date | null;
}

export interface EquipmentRow {
  status: string;
}

export interface SterileSetRow {
  status: string;
}

export interface SurgeryRow {
  status: string;
  durationMin: number;
}

export interface BedRow {
  wardType: string;
  status: string;
}

export interface EquipmentReadiness {
  readyCount: number
  totalCount: number
  readinessPercent: number | null
}

export interface SterileSetTelemetry {
  readyCount: number
  totalCount: number
  inUseCount: number
  sterilizingCount: number
}

export interface SurgeryTelemetry {
  completedCount: number
  meanDurationMin: number | null
}

export interface PacuOccupancy {
  occupied: number
  total: number
}

export interface SystemHealth {
  level: 'operational' | 'warning' | 'critical'
  labelAr: string
  labelEn: string
}

const PACU_WARD = 'pacu_recovery';

/** Patients currently inside the facility journey: stages not yet exited. */
export function computeActiveFlowCount(rows: Array<{ exitedAt: Date | null }>): number {
  return rows.filter((r) => r.exitedAt === null).length;
}

/** Mean minutes spent in PACU across closed stages; null when none closed. */
export function computeMeanPacuStayMin(rows: FlowStageRow[]): number | null {
  const closed = rows.filter((r) => r.stageType === 'pacu' && r.enteredAt && r.exitedAt);
  if (closed.length === 0) return null;
  const totalMin = closed.reduce((acc, r) => {
    const mins = ((r.exitedAt as Date).getTime() - (r.enteredAt as Date).getTime()) / 60_000;
    return acc + mins;
  }, 0);
  return Math.round(totalMin / closed.length);
}

/** Ready = operational or in_use (serving patients right now). */
export function computeEquipmentReadiness(rows: EquipmentRow[]): EquipmentReadiness {
  const totalCount = rows.length;
  const readyCount = rows.filter((r) => r.status === 'operational' || r.status === 'in_use').length;
  return {
    readyCount,
    totalCount,
    readinessPercent: totalCount === 0 ? null : Math.round((readyCount / totalCount) * 100),
  };
}

/** CSSD tray board counts straight from inventory rows. */
export function computeSterileSetTelemetry(rows: SterileSetRow[]): SterileSetTelemetry {
  const count = (status: string) => rows.filter((r) => r.status === status).length;
  return {
    readyCount: count('ready'),
    totalCount: rows.length,
    inUseCount: count('in_use'),
    sterilizingCount: count('sterilizing'),
  };
}

/** Completed-surgery volume and mean planned duration for the period. */
export function computeSurgeryTelemetry(rows: SurgeryRow[]): SurgeryTelemetry {
  const completed = rows.filter((r) => r.status === 'completed');
  if (completed.length === 0) return { completedCount: 0, meanDurationMin: null };
  const mean = completed.reduce((acc, r) => acc + r.durationMin, 0) / completed.length;
  return { completedCount: completed.length, meanDurationMin: Math.round(mean * 10) / 10 };
}

/** PACU ward occupancy from bed rows. */
export function computePacuOccupancy(rows: BedRow[]): PacuOccupancy {
  const pacu = rows.filter((r) => r.wardType === PACU_WARD);
  return {
    occupied: pacu.filter((r) => r.status === 'occupied').length,
    total: pacu.length,
  };
}

/**
 * Header badge: derives system health from measured telemetry only.
 * critical = any laser-class device offline; warning = readiness below 100%;
 * operational = full readiness. No baseline percent claims.
 */
export function systemHealthFromTelemetry(input: {
  equipmentReadyPercent: number | null
  anyEquipmentOffline: boolean
}): SystemHealth {
  if (input.anyEquipmentOffline) {
    return { level: 'critical', labelAr: 'بحاجة لمراجعة', labelEn: 'Needs review' };
  }
  if (input.equipmentReadyPercent === null) {
    return {
      level: 'warning',
      labelAr: 'لا أجهزة مسجلة',
      labelEn: 'No equipment registered',
    };
  }
  if (input.equipmentReadyPercent < 100) {
    return { level: 'warning', labelAr: 'جاهزية جزئية', labelEn: 'Partial readiness' };
  }
  return {
    level: 'operational',
    labelAr: 'الأجهزة جاهزة بالكامل',
    labelEn: 'Equipment fully ready',
  };
}
