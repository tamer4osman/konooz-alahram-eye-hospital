import { describe, it, expect } from 'vitest';
import { computeAttendanceKpi, type AttendanceStatusRow } from '@/lib/usecases/analytics/rules';

const row = (status: string): AttendanceStatusRow => ({ status });

describe('computeAttendanceKpi', () => {
  it('computes attendance over completed+in_queue+confirmed+scheduled+no_show (excludes cancelled)', () => {
    const kpi = computeAttendanceKpi([
      row('completed'),
      row('completed'),
      row('in_queue'),
      row('confirmed'),
      row('scheduled'),
      row('no_show'),
      row('cancelled'),
      row('cancelled'),
    ]);
    // attended 3 / universe 6 (the 2 cancelled are excluded)
    expect(kpi.attendedCount).toBe(3);
    expect(kpi.universeCount).toBe(6);
    expect(kpi.attendanceRate).toBe(50);
    expect(kpi.noShowCount).toBe(1);
    expect(kpi.cancelledCount).toBe(2);
  });

  it('excludes cancelled from the universe (they are not attendance opportunities)', () => {
    const kpi = computeAttendanceKpi([row('cancelled'), row('cancelled'), row('completed')]);
    expect(kpi.universeCount).toBe(1);
    expect(kpi.attendanceRate).toBe(100);
  });

  it('yields null rate on empty universe — honest zero-appointment day', () => {
    const kpi = computeAttendanceKpi([]);
    expect(kpi.attendedCount).toBe(0);
    expect(kpi.universeCount).toBe(0);
    expect(kpi.attendanceRate).toBe(null);
  });

  it('null rate when only cancellations exist', () => {
    const kpi = computeAttendanceKpi([row('cancelled')]);
    expect(kpi.universeCount).toBe(0);
    expect(kpi.attendanceRate).toBe(null);
  });
});
