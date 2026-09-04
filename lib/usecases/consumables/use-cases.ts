import type { SurgicalConsumable as ConsumableDTO } from '@/data/dashboardData';
import type { ConsumablePatch, CreateConsumableInput } from './types';
import type { ConsumableReader, ConsumableWriter } from './ports';
import { computeConsumablesSummary, resolveConsumableCreate, resolveConsumablePatch, type ConsumablesSummary } from './rules';

// Use cases: orchestration only.

export async function listConsumables(reader: ConsumableReader): Promise<ConsumableDTO[]> {
  return reader.list();
}

/** Inventory summary for the consumables board (pure rule). */
export async function loadConsumablesSummary(reader: ConsumableReader, now: Date = new Date()): Promise<ConsumablesSummary> {
  const items = await reader.list();
  return computeConsumablesSummary(
    items.map((c) => ({
      category: c.category,
      stockCurrent: c.stockCurrent,
      stockMinThreshold: c.stockMinThreshold,
      reorderStatus: c.reorderStatus,
      expiryDate: c.expiryDate,
      unitCostLYD: c.unitCostLYD,
    })),
    now,
  );
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
