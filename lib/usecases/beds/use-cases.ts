import type { HospitalBed as BedDTO } from '@/data/dashboardData';
import type { BedPatch, CreateBedInput } from './types';
import type { BedReader, BedWriter } from './ports';
import { resolveBedCreate, resolveBedPatch } from './rules';

// Use cases: orchestration only. Typed errors (BedNotFoundError,
// BedConflictError) propagate from the adapter.

export async function listBeds(reader: BedReader): Promise<BedDTO[]> {
  return reader.list();
}

export async function createBed(writer: BedWriter, input: CreateBedInput): Promise<BedDTO> {
  return writer.create(resolveBedCreate(input));
}

export async function updateBed(
  writer: BedWriter,
  id: string,
  patch: BedPatch,
): Promise<BedDTO> {
  return writer.update(id, resolveBedPatch(patch));
}
