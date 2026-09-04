import { describe, it, expect, vi } from 'vitest';
import {
  resolveDayRange,
  normalizeAppointmentQuery,
  listAppointments,
  InvalidAppointmentQueryError,
} from '@/lib/usecases/appointments';
import type { AppointmentListReader } from '@/lib/usecases/appointments';
import type { AppointmentListItem, NormalizedAppointmentQuery } from '@/lib/usecases/appointments';

function makeRow(overrides: Partial<AppointmentListItem> = {}): AppointmentListItem {
  return {
    id: 'apt-1',
    ticketNumber: 'BK-123456',
    date: new Date(2026, 8, 2, 9, 0, 0),
    time: '09:00',
    status: 'scheduled',
    cancelReason: null,
    cancelNote: null,
    doctorDisplayNameAr: 'د. تجريبي',
    doctorDisplayNameEn: 'Dr. Test',
    specialtyAr: null,
    specialtyEn: null,
    ...overrides,
  };
}

function makeReader(rows: AppointmentListItem[]) {
  const list = vi.fn(async (_query: NormalizedAppointmentQuery) => rows);
  const reader: AppointmentListReader = { list };
  return { reader, list };
}

describe('resolveDayRange', () => {
  it('a date yields local midnight to next-day midnight', () => {
    const range = resolveDayRange('2026-09-02');
    expect(range.from).toEqual(new Date(2026, 8, 2, 0, 0, 0));
    expect(range.to).toEqual(new Date(2026, 8, 3, 0, 0, 0));
  });

  it('no date yields an unbounded range', () => {
    const range = resolveDayRange(undefined);
    expect(range.from).toBeNull();
    expect(range.to).toBeNull();
  });

  it('a non-YYYY-MM-DD date is rejected', () => {
    expect(() => resolveDayRange('09/02/2026')).toThrow(InvalidAppointmentQueryError);
    expect(() => resolveDayRange('2026-13-40')).toThrow(InvalidAppointmentQueryError);
    expect(() => resolveDayRange('garbage')).toThrow(InvalidAppointmentQueryError);
  });

  it('rejects impossible calendar dates like 2026-02-30', () => {
    expect(() => resolveDayRange('2026-02-30')).toThrow(InvalidAppointmentQueryError);
  });
});

describe('normalizeAppointmentQuery', () => {
  it('defaults take to 200 when omitted', () => {
    expect(normalizeAppointmentQuery({}).take).toBe(200);
  });

  it('clamps take into 1..200', () => {
    expect(normalizeAppointmentQuery({ take: 500 }).take).toBe(200);
    expect(normalizeAppointmentQuery({ take: 0 }).take).toBe(1);
    expect(normalizeAppointmentQuery({ take: -5 }).take).toBe(1);
  });

  it('accepts known live statuses and rejects unknown ones', () => {
    expect(normalizeAppointmentQuery({ status: 'no_show' }).status).toBe('no_show');
    expect(normalizeAppointmentQuery({ status: 'scheduled' }).status).toBe('scheduled');
    expect(() => normalizeAppointmentQuery({ status: 'ghosted' })).toThrow(
      InvalidAppointmentQueryError,
    );
  });

  it('passes the day range through from the date', () => {
    const q = normalizeAppointmentQuery({ date: '2026-09-02' });
    expect(q.from).toEqual(new Date(2026, 8, 2, 0, 0, 0));
    expect(q.to).toEqual(new Date(2026, 8, 3, 0, 0, 0));
  });
});

describe('listAppointments', () => {
  it('passes the normalized query to the reader and returns its rows', async () => {
    const rows = [makeRow(), makeRow({ id: 'apt-2', status: 'no_show' })];
    const { reader, list } = makeReader(rows);

    const result = await listAppointments(reader, { date: '2026-09-02' });

    const arg = list.mock.calls[0][0] as NormalizedAppointmentQuery;
    expect(arg.from).toEqual(new Date(2026, 8, 2, 0, 0, 0));
    expect(arg.to).toEqual(new Date(2026, 8, 3, 0, 0, 0));
    expect(result).toEqual(rows);
    expect(result[1].status).toBe('no_show');
  });
});
