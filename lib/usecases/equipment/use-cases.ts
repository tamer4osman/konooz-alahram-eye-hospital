import type { HospitalEquipment as EquipmentDTO } from '@/data/dashboardData';
import type { CreateEquipmentInput, EquipmentPatch } from './types';
import type { EquipmentReader, EquipmentWriter } from './ports';
import { resolveEquipmentCreate, resolveEquipmentPatch } from './rules';

// Use cases: orchestration only.

export async function listEquipment(reader: EquipmentReader): Promise<EquipmentDTO[]> {
  return reader.list();
}

export async function createEquipment(
  writer: EquipmentWriter,
  input: CreateEquipmentInput,
): Promise<EquipmentDTO> {
  return writer.create(resolveEquipmentCreate(input));
}

export async function updateEquipment(
  writer: EquipmentWriter,
  id: string,
  patch: EquipmentPatch,
): Promise<EquipmentDTO> {
  return writer.update(id, resolveEquipmentPatch(patch));
}

export async function deleteEquipment(writer: EquipmentWriter, id: string): Promise<void> {
  await writer.delete(id);
}
