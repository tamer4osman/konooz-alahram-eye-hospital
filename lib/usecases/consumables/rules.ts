import type {
  ConsumablePatch,
  CreateConsumableInput,
  ResolvedConsumableCreate,
} from './types';

// Pure business rules.

/** Default low-stock threshold for new consumable types. */
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

/**
 * Resolve consumable create: stock starts at 0 unless stated, threshold
 * default 10 units, reorder status optimal, blank-string defaults.
 */
export function resolveConsumableCreate(
  input: CreateConsumableInput,
): ResolvedConsumableCreate {
  return {
    nameAr: input.nameAr,
    nameEn: input.nameEn ?? null,
    category: input.category,
    unitAr: input.unitAr,
    unitEn: input.unitEn ?? null,
    stockLevel: input.stockCurrent ?? 0,
    lowStockThreshold: input.stockMinThreshold ?? DEFAULT_LOW_STOCK_THRESHOLD,
    brand: input.brand ?? '',
    reorderStatus: input.reorderStatus ?? 'optimal',
    batchLot: input.batchLot ?? '',
    expiryDate: input.expiryDate ?? null,
    locationAr: input.locationAr ?? '',
    locationEn: input.locationEn ?? null,
    unitCostLYD: input.unitCostLYD ?? 0,
  };
}

/**
 * Consumable patch carries no derived transitions today. Single place to add
 * inventory derivations (e.g. stockLevel < lowStockThreshold forces
 * low_stock reorder status on save).
 */
export function resolveConsumablePatch(patch: ConsumablePatch): ConsumablePatch {
  return { ...patch };
}
