import { describe, it, expect, vi } from 'vitest';
import {
  resolveAttendanceCreate,
  resolveAttendancePatch,
  DEFAULT_CATEGORY,
  createAttendance,
  listAttendance,
} from '@/lib/usecases/attendance';
import type { AttendanceReader, AttendanceWriter } from '@/lib/usecases/attendance';
import type { StaffAttendanceRecord as AttendanceDTO } from '@/data/dashboardData';

const NOW = new Date('2026-09-03T06:00:00.000Z');

const SAMPLE: AttendanceDTO = {
  id: 'att-1',
  staffId: null,
  staffNameAr: 'د. سالم',
  staffNameEn: 'Dr. Salem',
  status: 'present',
} as unknown as AttendanceDTO;

function stubReader(rows: AttendanceDTO[]): AttendanceReader {
  return { list: vi.fn().mockResolvedValue(rows) };
}

function stubWriter(row: AttendanceDTO): AttendanceWriter {
  return {
    create: vi.fn().mockResolvedValue(row),
    update: vi.fn().mockResolvedValue(row),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe('resolveAttendanceCreate', () => {
  it('defaults category to consultant and blanks display fields', () => {
    const resolved = resolveAttendanceCreate(
      { staffNameAr: 'د. سالم', shiftType: 'morning' },
      NOW,
    );
    expect(resolved.category).toBe(DEFAULT_CATEGORY);
    expect(resolved.category).toBe('consultant');
    expect(resolved.roleAr).toBe('');
    expect(resolved.avatar).toBe('');
    expect(resolved.departmentAr).toBe('');
    expect(resolved.shiftTiming).toBe('');
    expect(resolved.badgeCode).toBe('');
    expect(resolved.staffId).toBeNull();
    expect(resolved.staffNameEn).toBeNull();
    expect(resolved.date).toBe(NOW);
  });

  it('preserves explicit category and staffId', () => {
    const resolved = resolveAttendanceCreate(
      { staffNameAr: 'ممرضة', shiftType: 'evening', category: 'nurse', staffId: 's-9' },
      NOW,
    );
    expect(resolved.category).toBe('nurse');
    expect(resolved.staffId).toBe('s-9');
  });
});

describe('resolveAttendancePatch', () => {
  it('passes through unchanged (no derived transitions today)', () => {
    const patch = { status: 'late' as const, checkInTime: '09:20' };
    expect(resolveAttendancePatch(patch)).toEqual(patch);
  });
});

describe('use cases', () => {
  it('listAttendance delegates to reader', async () => {
    const reader = stubReader([SAMPLE]);
    expect(await listAttendance(reader)).toEqual([SAMPLE]);
  });

  it('createAttendance resolves with now, persists via writer', async () => {
    const writer = stubWriter(SAMPLE);
    await createAttendance(
      writer,
      { staffNameAr: 'د. سالم', shiftType: 'morning' },
      NOW,
    );
    const resolved = vi.mocked(writer.create).mock.calls[0][0];
    expect(resolved.staffNameAr).toBe('د. سالم');
    expect(resolved.date).toBe(NOW);
  });
});
