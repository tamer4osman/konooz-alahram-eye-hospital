import { beforeEach, describe, expect, it, vi } from 'vitest';

// computeAnalytics imports the prisma singleton directly; replace it with a
// deterministic fake so tests never touch a database.
vi.mock('@/lib/prisma', () => ({
  prisma: {
    scheduledSurgery: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    clinicalConsultationRecord: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    diagnosticPacsOrder: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    hospitalBillingInvoice: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
    room: {
      count: vi.fn(async () => 2), // two operating theaters
    },
    patientSurvey: {
      findMany: vi.fn(async () => []),
    },
    patientFlowStage: {
      findMany: vi.fn(async () => []),
    },
    appointment: {
      findMany: vi.fn(async () => []),
    },
  },
}));

import { prisma } from '@/lib/prisma';
import { computeAnalytics, type AnalyticsTimeframe } from '@/lib/dashboard/analytics';
import type { Specialty } from '@/data/hospitalData';

const DEPARTMENTS_FIXTURE: Specialty[] = [
  { id: 'cataract-phaco', titleAr: 'جراحة المياه البيضاء', titleEn: 'Cataract Surgery & Micro-Phaco', iconName: 'Eye', shortDescAr: '', shortDescEn: '', fullDescAr: '', fullDescEn: '', badgeAr: '', badgeEn: '', proceduresAr: [], proceduresEn: [], technologiesAr: [], technologiesEn: [], durationAr: '', durationEn: '', recoveryAr: '', recoveryEn: '', suitableForAr: [], suitableForEn: [] },
  { id: 'retina-vitreous', titleAr: 'جراحات الشبكية', titleEn: 'Retinal Surgery & Vitrectomy', iconName: 'Activity', shortDescAr: '', shortDescEn: '', fullDescAr: '', fullDescEn: '', badgeAr: '', badgeEn: '', proceduresAr: [], proceduresEn: [], technologiesAr: [], technologiesEn: [], durationAr: '', durationEn: '', recoveryAr: '', recoveryEn: '', suitableForAr: [], suitableForEn: [] },
];

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);
const YESTERDAY = new Date(TODAY);
YESTERDAY.setDate(YESTERDAY.getDate() - 1);

function surgeryAt(hour: number, minute: number, overrides: Record<string, unknown> = {}) {
  const d = new Date(TODAY);
  d.setHours(hour, minute, 0, 0);
  return {
    scheduledAt: d,
    durationMin: 30,
    specialtyId: 'cataract',
    surgeonNameAr: 'د. أحمد',
    surgeonNameEn: 'Dr. Ahmed',
    ...overrides,
  };
}

/** Current-period rows land today; previous-period counters read the where-clause. */
function seedPrisma(opts: { prevSurgeries?: number; prevRevenue?: number } = {}) {
  const mocked = prisma as unknown as {
    scheduledSurgery: { count: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
    clinicalConsultationRecord: { count: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
    diagnosticPacsOrder: { count: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
    hospitalBillingInvoice: { aggregate: ReturnType<typeof vi.fn>; findMany: ReturnType<typeof vi.fn> };
  };

  mocked.scheduledSurgery.count.mockImplementation(async (args?: { where?: { scheduledAt?: { gte?: Date } } }) => {
    return args?.where?.scheduledAt?.gte?.getTime() === TODAY.getTime() ? 2 : (opts.prevSurgeries ?? 0);
  });
  mocked.scheduledSurgery.findMany.mockResolvedValue([
    surgeryAt(10, 30),
    surgeryAt(10, 45, { durationMin: 50, specialtyId: 'retina', surgeonNameAr: 'د. سارة', surgeonNameEn: 'Dr. Sara' }),
  ]);

  mocked.clinicalConsultationRecord.count.mockImplementation(async (args?: { where?: { date?: { gte?: Date } } }) => {
    return args?.where?.date?.gte?.getTime() === TODAY.getTime() ? 1 : 0;
  });
  const consultDate = new Date(TODAY);
  consultDate.setHours(11, 0, 0, 0);
  mocked.clinicalConsultationRecord.findMany.mockResolvedValue([{ date: consultDate }]);

  mocked.diagnosticPacsOrder.count.mockResolvedValue(0);
  mocked.diagnosticPacsOrder.findMany.mockResolvedValue([]);

  mocked.hospitalBillingInvoice.aggregate.mockImplementation(async (args?: { where?: { issuedDate?: { gte?: Date } } }) => {
    if (args?.where?.issuedDate?.gte?.getTime() !== TODAY.getTime()) return { _sum: { amount: opts.prevRevenue ?? null } };
    return { _sum: { amount: 1500.5 } };
  });
  const issued = new Date(TODAY);
  issued.setHours(10, 30, 0, 0);
  mocked.hospitalBillingInvoice.findMany.mockResolvedValue([{ issuedDate: issued, amount: 1500.5 }]);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('computeAnalytics (day timeframe)', () => {
  it('counts live KPIs and reports honest growth against the previous period', async () => {
    seedPrisma();
    const dto = await computeAnalytics('day' as AnalyticsTimeframe);

    expect(dto.periodLabelEn).toBe('Today (Live Data)');
    expect(dto.kpis.surgeriesCount).toBe(2);
    expect(dto.kpis.consultationsCount).toBe(1);
    expect(dto.kpis.diagnosticScans).toBe(0);
    expect(dto.kpis.revenueLYD).toBeCloseTo(1500.5, 2);
    // prev period empty -> +100% growth
    expect(dto.kpis.surgeriesGrowth).toBe('+100.0%');
    expect(dto.kpis.revenueGrowth).toBe('+100.0%');
  });

  it('renders +0.0% growth when both periods are empty', async () => {
    seedPrisma({ prevSurgeries: 0 });
    const dto = await computeAnalytics('day' as AnalyticsTimeframe);
    expect(dto.kpis.scansGrowth).toBe('+0.0%');
  });

  it('computes negative growth when the previous period outperforms today', async () => {
    seedPrisma({ prevSurgeries: 4 });
    const dto = await computeAnalytics('day' as AnalyticsTimeframe);
    expect(dto.kpis.surgeriesCount).toBe(2);
    expect(dto.kpis.surgeriesGrowth).toBe('-50.0%');
  });

  it('keeps unsourced metrics honestly null instead of fabricating numbers', async () => {
    seedPrisma();
    const dto = await computeAnalytics('day' as AnalyticsTimeframe);
    expect(dto.kpis.patientSatisfaction).toBeNull();
    expect(dto.kpis.averageWaitTimeMin).toBeNull();
    // no appointments -> no attendance universe -> honest null rate
    expect(dto.attendance.attendanceRate).toBeNull();
    expect(dto.attendance.universeCount).toBe(0);
  });

  it('computes the attendance KPI from appointment statuses (cancelled excluded)', async () => {
    seedPrisma();
    const mocked = prisma as unknown as {
      appointment: { findMany: ReturnType<typeof vi.fn> };
    };
    mocked.appointment.findMany.mockResolvedValue([
      { status: 'completed' },
      { status: 'in_queue' },
      { status: 'no_show' },
      { status: 'scheduled' },
      { status: 'cancelled' },
    ]);
    const dto = await computeAnalytics('day' as AnalyticsTimeframe);
    expect(dto.attendance.attendedCount).toBe(2);
    expect(dto.attendance.universeCount).toBe(4);
    expect(dto.attendance.attendanceRate).toBe(50);
    expect(dto.attendance.noShowCount).toBe(1);
    expect(dto.attendance.cancelledCount).toBe(1);
  });

  it('builds hourly buckets 08:00-19:00 with OR occupancy capped at 100', async () => {
    seedPrisma();
    const dto = await computeAnalytics('day' as AnalyticsTimeframe);

    expect(dto.timeline).toHaveLength(12); // 08..19 inclusive
    expect(dto.timeline[0].labelEn).toBe('08:00');
    expect(dto.timeline.at(-1)?.labelEn).toBe('19:00');

    const tenBucket = dto.timeline.find((b) => b.labelEn === '10:00');
    expect(tenBucket?.surgeries).toBe(2); // both surgeries at 10:30 & 10:45
    expect(tenBucket?.consultations).toBe(0); // consultation is at 11:00, not 10:xx
    // 80 occupied minutes across 2 theaters * 60 min capacity = ~67%
    expect(tenBucket?.orOccupancy).toBe(67);

    const eleven = dto.timeline.find((b) => b.labelEn === '11:00');
    expect(eleven?.consultations).toBe(1);

    for (const b of dto.timeline) {
      expect(b.orOccupancy ?? 0).toBeLessThanOrEqual(100);
    }
  });

  it('aggregates department workload by specialty with palette colors', async () => {
    seedPrisma();
    const dto = await computeAnalytics('day' as AnalyticsTimeframe, DEPARTMENTS_FIXTURE);

    const cataract = dto.departmentWorkload.find((d) => d.nameEn.toLowerCase().includes('cataract'));
    const retina = dto.departmentWorkload.find((d) => d.nameEn.toLowerCase().includes('retina'));
    expect(cataract?.count).toBe(1);
    expect(retina?.count).toBe(1);
    // sorted by count desc -> first entry gets the first palette color
    expect(dto.departmentWorkload[0].color).toBe('#0C2340');
  });

  it('aggregates surgeon workload with average durations rounded', async () => {
    seedPrisma();
    const dto = await computeAnalytics('day' as AnalyticsTimeframe);

    const ahmed = dto.surgeonWorkload.find((s) => s.nameEn === 'Dr. Ahmed');
    const sara = dto.surgeonWorkload.find((s) => s.nameEn === 'Dr. Sara');
    expect(ahmed).toMatchObject({ cases: 1, avgDurationMin: 30 });
    expect(sara).toMatchObject({ cases: 1, avgDurationMin: 50 });
  });

  it('caps OR utilization at 100 percent even with absurd surgical load', async () => {
    seedPrisma();
    const mocked = prisma as unknown as {
      scheduledSurgery: { findMany: ReturnType<typeof vi.fn> };
    };
    // 24 hours of surgeries across 2 rooms would exceed any honest ratio
    const rows = Array.from({ length: 10 }, (_, i) => surgeryAt(8 + Math.floor(i / 2), (i % 2) * 30));
    mocked.scheduledSurgery.findMany.mockResolvedValue(rows);

    const dto = await computeAnalytics('day' as AnalyticsTimeframe);
    expect(dto.kpis.orUtilizationRate).toBeLessThanOrEqual(100);
  });
});

describe('computeAnalytics (week/month/year buckets)', () => {
  it('returns 7 rolling day buckets ending today, named from a Sat-first week', async () => {
    seedPrisma();
    const dto = await computeAnalytics('week' as AnalyticsTimeframe);

    expect(dto.timeline).toHaveLength(7);
    // The window rolls: oldest -> newest ending today. Derive expected names.
    const SAT_FIRST = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const expected: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(TODAY);
      d.setDate(d.getDate() - i);
      expected.push(SAT_FIRST[(d.getDay() + 1) % 7]);
    }
    expect(dto.timeline.map((b) => b.labelEn)).toEqual(expected);
    // week timeline has no hourly occupancy
    expect(dto.timeline.every((b) => b.orOccupancy === undefined)).toBe(true);
  });

  it('returns weekly buckets for month', async () => {
    seedPrisma();
    const dto = await computeAnalytics('month' as AnalyticsTimeframe);
    expect(dto.timeline.length).toBeGreaterThanOrEqual(4);
    expect(dto.timeline.length).toBeLessThanOrEqual(6);
    expect(dto.timeline[0].labelEn).toBe('Week 1');
    expect(dto.periodLabelEn).toBe('This Month');
  });

  it('returns 12 monthly buckets for year with correct labels', async () => {
    seedPrisma();
    const dto = await computeAnalytics('year' as AnalyticsTimeframe);
    expect(dto.timeline).toHaveLength(12);
    expect(dto.timeline[0].labelEn).toBe('Jan');
    expect(dto.timeline.at(-1)?.labelEn).toBe('Dec');
    expect(dto.periodLabelEn).toBe(`This Year (${new Date().getFullYear()})`);
  });
});
