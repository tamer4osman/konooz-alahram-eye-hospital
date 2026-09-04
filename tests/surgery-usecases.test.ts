import { describe, it, expect, vi } from 'vitest';
import {
  resolveSurgeryCreate,
  resolveSurgeryPatch,
  DEFAULT_DURATION_MIN,
  FALLBACK_PROCEDURE_AR,
  createSurgery,
  listSurgeries,
  SurgeryNameRequiredError,
} from '@/lib/usecases/surgeries';
import type { SurgeryReader, SurgeryWriter } from '@/lib/usecases/surgeries';
import type { ScheduledSurgery as SurgeryDTO } from '@/data/dashboardData';

const NOW = new Date('2026-09-03T08:00:00.000Z');

const SAMPLE: SurgeryDTO = {
  id: 'sx-1',
  status: 'scheduled',
  patientNameAr: 'مريض',
  procedureAr: 'فاكو',
} as unknown as SurgeryDTO;

function stubReader(rows: SurgeryDTO[]): SurgeryReader {
  return { list: vi.fn().mockResolvedValue(rows) };
}

function stubWriter(row: SurgeryDTO): SurgeryWriter {
  return {
    create: vi.fn().mockResolvedValue(row),
    update: vi.fn().mockResolvedValue(row),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

describe('resolveSurgeryCreate', () => {
  it('applies defaults: 60min duration, elective priority, scheduled status, now', () => {
    const resolved = resolveSurgeryCreate({ patientNameAr: 'مريض' }, NOW);
    expect(resolved.durationMin).toBe(DEFAULT_DURATION_MIN);
    expect(resolved.durationMin).toBe(60);
    expect(resolved.priority).toBe('elective');
    expect(resolved.status).toBe('scheduled');
    expect(resolved.scheduledAt).toBe(NOW);
    expect(resolved.patientPhone).toBe('');
    expect(resolved.roomCode).toBe('');
    expect(resolved.gender).toBe('MALE');
  });

  it('requires a patient name in at least one language', () => {
    expect(() => resolveSurgeryCreate({}, NOW)).toThrow(SurgeryNameRequiredError);
  });

  it('falls back one language to the other (patient + procedure)', () => {
    const resolved = resolveSurgeryCreate(
      { patientNameEn: 'John', procedureEn: 'Phaco' },
      NOW,
    );
    expect(resolved.patientNameAr).toBe('John');
    expect(resolved.patientNameEn).toBe('John');
    expect(resolved.procedureAr).toBe('Phaco');
  });

  it('uses generic AR procedure fallback when neither language supplies one', () => {
    const resolved = resolveSurgeryCreate({ patientNameAr: 'مريض' }, NOW);
    expect(resolved.procedureAr).toBe(FALLBACK_PROCEDURE_AR);
    expect(resolved.procedureAr).toBe('إجراء جراحي');
  });

  it('maps gender female → FEMALE enum', () => {
    const resolved = resolveSurgeryCreate(
      { patientNameAr: 'م', gender: 'female' },
      NOW,
    );
    expect(resolved.gender).toBe('FEMALE');
  });
});

describe('resolveSurgeryPatch', () => {
  it('passes through unchanged', () => {
    const patch = { status: 'in_or' as const, roomCode: 'OR-2' };
    expect(resolveSurgeryPatch(patch)).toEqual(patch);
  });
});

describe('use cases', () => {
  it('listSurgeries delegates to reader', async () => {
    const reader = stubReader([SAMPLE]);
    expect(await listSurgeries(reader)).toEqual([SAMPLE]);
  });

  it('createSurgery resolves then persists', async () => {
    const writer = stubWriter(SAMPLE);
    await createSurgery(writer, { patientNameAr: 'مريض' }, NOW);
    const resolved = vi.mocked(writer.create).mock.calls[0][0];
    expect(resolved.patientNameAr).toBe('مريض');
    expect(resolved.durationMin).toBe(60);
  });
});
