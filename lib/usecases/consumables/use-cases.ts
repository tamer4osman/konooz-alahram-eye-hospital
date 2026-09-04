import type { SurgicalConsumable as ConsumableDTO } from '@/data/dashboardData';
import type { ConsumablePatch, CreateConsumableInput } from './types';
import type { ConsumableReader, ConsumableWriter } from './ports';
import { resolveConsumableCreate, resolveConsumablePatch } from './rules';

// Use cases: orchestration only.

export async function listConsumables(reader: ConsumableReader): Promise<ConsumableDTO[]> {
  return reader.list();
}

export async function createConsumable(
  writer: ConsumableWriter,
  input: CreateConsumableInput,
): Promise<ConsumableDTO> {
  return writer.create(resolveConsumableCreate(input));
}

export async function updateConsumable(
  writer: ConsumableWriter,
  id: string,
  patch: ConsumablePatch,
): Promise<ConsumableDTO> {
  return writer.update(id, resolveConsumablePatch(patch));
}
