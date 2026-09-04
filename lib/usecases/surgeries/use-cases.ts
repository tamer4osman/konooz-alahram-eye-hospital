import type { ScheduledSurgery as SurgeryDTO } from '@/data/dashboardData';
import type { CreateSurgeryInput, SurgeryPatch } from './types';
import type { SurgeryReader, SurgeryWriter } from './ports';
import { resolveSurgeryCreate, resolveSurgeryPatch } from './rules';

// Use cases: orchestration only. Domain validation errors propagate from
// rules; adapter typed errors (SurgeryNotFoundError) propagate unchanged.

export async function listSurgeries(reader: SurgeryReader): Promise<SurgeryDTO[]> {
  return reader.list();
}

export async function createSurgery(
  writer: SurgeryWriter,
  input: CreateSurgeryInput,
  now: Date = new Date(),
): Promise<SurgeryDTO> {
  return writer.create(resolveSurgeryCreate(input, now));
}

export async function updateSurgery(
  writer: SurgeryWriter,
  id: string,
  patch: SurgeryPatch,
): Promise<SurgeryDTO> {
  return writer.update(id, resolveSurgeryPatch(patch));
}

export async function deleteSurgery(writer: SurgeryWriter, id: string): Promise<void> {
  await writer.delete(id);
}
