import { describe, it, expect, vi } from 'vitest';
import {
  resolveBedCreate,
  resolveBedPatch,
  OCCUPANT_FIELDS,
  createBed,
  updateBed,
  listBeds,
} from '@/lib/usecases/beds';
import type { BedReader, BedWriter } from '@/lib/usecases/beds';
import type { HospitalBed as BedDTO } from '@/data/dashboardData';

const SAMPLE_BED: BedDTO = {
  id: 'bed-1',
  bedNumber: 'P-01',
  wardType: 'pacu_recovery',
  status: 'occupied',
  patientNameAr: 'مريض',
  patientNameEn: 'Patient',
} as unknown as BedDTO;

function stubReader(rows: BedDTO[]): BedReader {
  return { list: vi.fn().mockResolvedValue(rows) };
}

function stubWriter(row: BedDTO): BedWriter {
  return {
    create: vi.fn().mockResolvedValue(row),
    update: vi.fn().mockResolvedValue(row),
  };
}

describe('resolveBedCreate', () => {
  it('applies empty-string defaults for missing bilingual fields', () => {
    const resolved = resolveBedCreate({ bedNumber: 'P-02', wardType: 'pacu_recovery' });
    expect(resolved.wardNameAr).toBe('');
    expect(resolved.wardNameEn).toBeNull();
    expect(resolved.floorAr).toBe('');
    expect(resolved.nurseInChargeAr).toBeNull();
  });
});

describe('resolveBedPatch — ready_clean occupant release rule', () => {
  it('clears occupant and vitals when status becomes ready_clean', () => {
    const resolved = resolveBedPatch({
      status: 'ready_clean',
      patientNameAr: 'مريض قديم',
      heartRateBpm: 80,
    });
    expect(resolved.patientId).toBeNull();
    expect(resolved.patientNameAr).toBeNull();
    expect(resolved.heartRateBpm).toBeNull();
    expect(resolved.admissionTime).toBeNull();
    expect(resolved.painScore).toBeNull();
    expect(Object.keys(OCCUPANT_FIELDS)).toHaveLength(15);
  });

  it('discards caller-supplied occupant fields on the same ready_clean patch (status is authoritative)', () => {
    const resolved = resolveBedPatch({
      status: 'ready_clean',
      patientNameAr: 'محاولة تعيين',
    });
    expect(resolved.patientNameAr).toBeNull();
  });

  it('leaves other statuses untouched', () => {
    const patch = { status: 'occupied' as const, patientNameAr: 'مريض جديد' };
    expect(resolveBedPatch(patch)).toEqual(patch);
  });

  it('passes a vitals-only patch through', () => {
    const patch = { bloodPressure: '120/80', spO2Percent: 98 };
    expect(resolveBedPatch(patch)).toEqual(patch);
  });
});

describe('use cases', () => {
  it('listBeds delegates to reader', async () => {
    const reader = stubReader([SAMPLE_BED]);
    expect(await listBeds(reader)).toEqual([SAMPLE_BED]);
  });

  it('createBed resolves then persists', async () => {
    const writer = stubWriter(SAMPLE_BED);
    await createBed(writer, { bedNumber: 'P-01', wardType: 'pacu_recovery' });
    const resolved = vi.mocked(writer.create).mock.calls[0][0];
    expect(resolved.bedNumber).toBe('P-01');
    expect(resolved.wardNameAr).toBe('');
  });

  it('updateBed applies the ready_clean rule before persisting', async () => {
    const writer = stubWriter(SAMPLE_BED);
    await updateBed(writer, 'bed-1', { status: 'ready_clean', patientNameAr: 'x' });
    const [id, patch] = vi.mocked(writer.update).mock.calls[0];
    expect(id).toBe('bed-1');
    expect(patch.status).toBe('ready_clean');
    expect(patch.patientNameAr).toBeNull();
  });
});
