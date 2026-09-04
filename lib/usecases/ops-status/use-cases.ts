import type { OpsTelemetryReader, OpsSnapshot } from './ports';
import { systemHealthFromTelemetry } from './rules';

/** Hours of closed PACU stages considered for the average-stay metric. */
const PACU_STAY_LOOKBACK_HOURS = 72;

/** Hours of completed surgeries considered for mean-duration telemetry. */
const SURGERY_LOOKBACK_HOURS = 24;

/** Header feed size. */
const ACTIVITY_LIMIT = 8;

/**
 * Live ops snapshot for the dashboard. Every number is measured from a table;
 * unmeasured quantities are null (rendered as an em-dash), never defaulted.
 */
export async function loadOpsSnapshot(
  telemetry: OpsTelemetryReader,
  activityReader: { listRecent(limit: number): Promise<OpsSnapshot['activity']> },
  now = new Date(),
): Promise<OpsSnapshot> {
  const pacuSince = new Date(now.getTime() - PACU_STAY_LOOKBACK_HOURS * 3_600_000);
  const surgerySince = new Date(now.getTime() - SURGERY_LOOKBACK_HOURS * 3_600_000);

  const [activeInFlow, pacuStays, pacuBeds, sterileSets, equipment, anyOffline, surgery, activity] = await Promise.all([
    telemetry.countActiveFlowStages(),
    telemetry.listClosedPacuStaysSince(pacuSince),
    telemetry.pacuOccupancy(),
    telemetry.sterileSetTelemetry(),
    telemetry.equipmentReadiness(),
    telemetry.anyEquipmentOffline(),
    telemetry.surgeryTelemetrySince(surgerySince),
    activityReader.listRecent(ACTIVITY_LIMIT),
  ]);

  const meanStayMin = pacuStays.length
    ? Math.round(
        pacuStays.reduce(
          (acc, s) => acc + (s.exitedAt.getTime() - s.enteredAt.getTime()) / 60_000,
          0,
        ) / pacuStays.length,
      )
    : null;

  const systemHealth = systemHealthFromTelemetry({
    equipmentReadyPercent: equipment.readinessPercent,
    anyEquipmentOffline: anyOffline,
  });

  return {
    activeInFlow,
    pacu: { ...pacuBeds, meanStayMin },
    sterileSets,
    equipment: { ...equipment, anyOffline },
    surgery,
    systemHealth,
    activity,
  };
}
