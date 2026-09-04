import { describe, expect, it } from 'vitest';
import {
  computeActiveFlowCount,
  computeMeanPacuStayMin,
  computeEquipmentReadiness,
  computeSterileSetTelemetry,
  computeSurgeryTelemetry,
  computePacuOccupancy,
  systemHealthFromTelemetry,
} from '@/lib/usecases/ops-status/rules';

describe('computeActiveFlowCount', () => {
  it('counts only open flow stages', () => {
    const rows = [
      { exitedAt: null },
      { exitedAt: null },
      { exitedAt: new Date('2026-09-01T10:00:00Z') },
    ];
    expect(computeActiveFlowCount(rows)).toBe(2);
  });

  it('returns 0 on empty input', () => {
    expect(computeActiveFlowCount([])).toBe(0);
  });
});

describe('computeMeanPacuStayMin', () => {
  it('averages durations of closed pacu stages', () => {
    const rows = [
      { stageType: 'pacu', enteredAt: new Date('2026-09-01T10:00:00Z'), exitedAt: new Date('2026-09-01T10:30:00Z') },
      { stageType: 'pacu', enteredAt: new Date('2026-09-01T11:00:00Z'), exitedAt: new Date('2026-09-01T11:46:00Z') },
    ];
    expect(computeMeanPacuStayMin(rows)).toBe(38);
  });

  it('ignores stages other than pacu and open stages', () => {
    const rows = [
      { stageType: 'reception', enteredAt: new Date('2026-09-01T10:00:00Z'), exitedAt: new Date('2026-09-01T10:30:00Z') },
      { stageType: 'pacu', enteredAt: new Date('2026-09-01T10:00:00Z'), exitedAt: null },
    ];
    expect(computeMeanPacuStayMin(rows)).toBeNull();
  });

  it('returns null on empty input', () => {
    expect(computeMeanPacuStayMin([])).toBeNull();
  });
});

describe('computeEquipmentReadiness', () => {
  it('counts operational and in_use equipment as ready', () => {
    const rows = [
      { status: 'operational' },
      { status: 'in_use' },
      { status: 'under_calibration' },
      { status: 'maintenance_scheduled' },
      { status: 'offline_alert' },
    ];
    expect(computeEquipmentReadiness(rows)).toEqual({ readyCount: 2, totalCount: 5, readinessPercent: 40 });
  });

  it('returns null percent when no equipment exists', () => {
    expect(computeEquipmentReadiness([])).toEqual({ readyCount: 0, totalCount: 0, readinessPercent: null });
  });
});

describe('computeSterileSetTelemetry', () => {
  it('splits sets by status counts', () => {
    const rows = [
      { status: 'ready' },
      { status: 'ready' },
      { status: 'in_use' },
      { status: 'sterilizing' },
    ];
    expect(computeSterileSetTelemetry(rows)).toEqual({
      readyCount: 2,
      totalCount: 4,
      inUseCount: 1,
      sterilizingCount: 1,
    });
  });

  it('returns zeroed telemetry on empty inventory', () => {
    expect(computeSterileSetTelemetry([])).toEqual({
      readyCount: 0,
      totalCount: 0,
      inUseCount: 0,
      sterilizingCount: 0,
    });
  });
});

describe('computeSurgeryTelemetry', () => {
  it('computes mean duration of completed surgeries', () => {
    const rows = [
      { status: 'completed', durationMin: 30 },
      { status: 'completed', durationMin: 50 },
      { status: 'scheduled', durationMin: 999 },
    ];
    expect(computeSurgeryTelemetry(rows)).toEqual({ completedCount: 2, meanDurationMin: 40 });
  });

  it('returns null mean when no surgeries completed', () => {
    expect(computeSurgeryTelemetry([{ status: 'scheduled', durationMin: 60 }])).toEqual({
      completedCount: 0,
      meanDurationMin: null,
    });
  });

  it('returns null mean on empty input', () => {
    expect(computeSurgeryTelemetry([])).toEqual({ completedCount: 0, meanDurationMin: null });
  });
});

describe('computePacuOccupancy', () => {
  it('counts occupied beds vs total pacu beds', () => {
    const rows = [
      { wardType: 'pacu_recovery', status: 'occupied' },
      { wardType: 'pacu_recovery', status: 'occupied' },
      { wardType: 'pacu_recovery', status: 'ready_clean' },
      { wardType: 'vip_inpatient', status: 'occupied' },
    ];
    expect(computePacuOccupancy(rows)).toEqual({ occupied: 2, total: 3 });
  });

  it('returns zeros when no pacu beds exist', () => {
    expect(computePacuOccupancy([{ wardType: 'vip_inpatient', status: 'occupied' }])).toEqual({ occupied: 0, total: 0 });
  });
});

describe('systemHealthFromTelemetry', () => {
  it('flags critical when any laser-class equipment is offline', () => {
    const health = systemHealthFromTelemetry({ equipmentReadyPercent: 80, anyEquipmentOffline: true });
    expect(health).toEqual({ level: 'critical', labelAr: 'بحاجة لمراجعة', labelEn: 'Needs review' });
  });

  it('flags warning when readiness below 100 but nothing offline', () => {
    const health = systemHealthFromTelemetry({ equipmentReadyPercent: 70, anyEquipmentOffline: false });
    expect(health).toEqual({ level: 'warning', labelAr: 'جاهزية جزئية', labelEn: 'Partial readiness' });
  });

  it('reports fully operational when readiness is 100', () => {
    const health = systemHealthFromTelemetry({ equipmentReadyPercent: 100, anyEquipmentOffline: false });
    expect(health).toEqual({ level: 'operational', labelAr: 'الأجهزة جاهزة بالكامل', labelEn: 'Equipment fully ready' });
  });
});
