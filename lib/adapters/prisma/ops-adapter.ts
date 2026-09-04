import { prisma } from '@/lib/prisma';
import type { OpsTelemetryReader, OpsActivityReader } from '@/lib/usecases/ops-status/ports';

// Prisma adapter for the ops-status snapshot. All counts/filters live here;
// pure derivations stay in lib/usecases/ops-status/rules.ts.

export const prismaOpsTelemetryReader: OpsTelemetryReader = {
  async countActiveFlowStages() {
    return prisma.patientFlowStage.count({ where: { exitedAt: null } });
  },

  async listClosedPacuStaysSince(since: Date) {
    const rows = await prisma.patientFlowStage.findMany({
      where: { stageType: 'pacu', enteredAt: { gte: since }, exitedAt: { not: null } },
      select: { enteredAt: true, exitedAt: true },
    });
    return rows.map((r) => ({ enteredAt: r.enteredAt, exitedAt: r.exitedAt as Date }));
  },

  async pacuOccupancy() {
    const rows = await prisma.bed.findMany({
      where: { wardType: 'pacu_recovery' },
      select: { status: true },
    });
    return {
      occupied: rows.filter((r) => r.status === 'occupied').length,
      total: rows.length,
    };
  },

  async sterileSetTelemetry() {
    const rows = await prisma.sterileSet.findMany({ select: { status: true } });
    const count = (status: 'ready' | 'in_use' | 'sterilizing') =>
      rows.filter((r) => r.status === status).length;
    return {
      readyCount: count('ready'),
      totalCount: rows.length,
      inUseCount: count('in_use'),
      sterilizingCount: count('sterilizing'),
    };
  },

  async equipmentReadiness() {
    const rows = await prisma.equipment.findMany({ select: { status: true } });
    const readyCount = rows.filter(
      (r) => r.status === 'operational' || r.status === 'in_use',
    ).length;
    return {
      readyCount,
      totalCount: rows.length,
      readinessPercent: rows.length === 0 ? null : Math.round((readyCount / rows.length) * 100),
    };
  },

  async anyEquipmentOffline() {
    const count = await prisma.equipment.count({ where: { status: 'offline_alert' } });
    return count > 0;
  },

  async surgeryTelemetrySince(since: Date) {
    const rows = await prisma.scheduledSurgery.findMany({
      where: { scheduledAt: { gte: since } },
      select: { status: true, durationMin: true },
    });
    const completed = rows.filter((r) => r.status === 'completed');
    return {
      completedCount: completed.length,
      meanDurationMin:
        completed.length === 0
          ? null
          : Math.round((completed.reduce((a, r) => a + r.durationMin, 0) / completed.length) * 10) / 10,
    };
  },
};

export const prismaOpsActivityReader: OpsActivityReader = {
  async listRecent(limit: number) {
    const rows = await prisma.opsActivityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return rows.map((r) => ({
      id: r.id,
      messageAr: r.messageAr,
      messageEn: r.messageEn,
      level: r.level,
      createdAt: r.createdAt.toISOString(),
    }));
  },
};
