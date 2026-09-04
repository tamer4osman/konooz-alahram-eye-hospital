import type {
  ConsumablePatch,
  CreateConsumableInput,
  ResolvedConsumableCreate,
} from './types';

// Pure business rules.

/** Default low-stock threshold for new consumable types. */
export const DEFAULT_LOW_STOCK_THRESHOLD = 10;

// ---------------------------------------------------------------------------
// Inventory summary (pure report rule for the consumables board)
// ---------------------------------------------------------------------------

export interface SummaryConsumableInput {
  category: string;
  stockCurrent: number;
  stockMinThreshold: number;
  reorderStatus: string;
  /** ISO date (YYYY-MM-DD); empty string means "no expiry tracked". */
  expiryDate: string;
  unitCostLYD: number;
}

export interface CategorySummary {
  category: string;
  itemCount: number;
  lowStockCount: number;
}

export interface ConsumablesSummary {
  totalItems: number;
  /** At or below the minimum threshold — the reorder trigger point. */
  lowStockCount: number;
  reorderPlacedCount: number;
  /** Expiry date strictly in the past. */
  expiredCount: number;
  /** Expiry within 60 days (inclusive), not yet expired. */
  expiringSoonCount: number;
  totalValueLYD: number;
  categories: CategorySummary[];
}

const EXPIRY_SOON_DAYS = 60;

function isLowStock(input: SummaryConsumableInput): boolean {
  return input.stockCurrent <= input.stockMinThreshold;
}

function expiryStatus(expiryDate: string, now: Date): 'expired' | 'soon' | 'ok' | 'none' {
  if (!expiryDate) return 'none';
  const expiry = new Date(`${expiryDate}T00:00:00Z`);
  if (Number.isNaN(expiry.getTime())) return 'none';
  const startOfDay = new Date(now);
  startOfDay.setUTCHours(0, 0, 0, 0);
  const diffDays = Math.floor((expiry.getTime() - startOfDay.getTime()) / 86_400_000);
  if (diffDays < 0) return 'expired';
  if (diffDays <= EXPIRY_SOON_DAYS) return 'soon';
  return 'ok';
}

/**
 * Inventory summary for the consumables board: counts, stock value
 * (stock x unit cost), expiry radar and per-category breakdown. Empty
 * expiry dates are excluded from the radar; at-threshold counts as low.
 */
export function computeConsumablesSummary(
  items: SummaryConsumableInput[],
  now: Date,
): ConsumablesSummary {
  let totalItems = 0;
  let lowStockCount = 0;
  let reorderPlacedCount = 0;
  let expiredCount = 0;
  let expiringSoonCount = 0;
  let totalValueLYD = 0;
  const byCategory = new Map<string, CategorySummary>();

  for (const item of items) {
    totalItems += 1;
    const low = isLowStock(item);
    if (low) lowStockCount += 1;
    if (item.reorderStatus === 'reorder_placed') reorderPlacedCount += 1;
    totalValueLYD += item.stockCurrent * item.unitCostLYD;

    const expiry = expiryStatus(item.expiryDate, now);
    if (expiry === 'expired') expiredCount += 1;
    else if (expiry === 'soon') expiringSoonCount += 1;

    const entry = byCategory.get(item.category) ?? { category: item.category, itemCount: 0, lowStockCount: 0 };
    entry.itemCount += 1;
    if (low) entry.lowStockCount += 1;
    byCategory.set(item.category, entry);
  }

  return {
    totalItems,
    lowStockCount,
    reorderPlacedCount,
    expiredCount,
    expiringSoonCount,
    totalValueLYD: Math.round(totalValueLYD * 100) / 100,
    categories: [...byCategory.values()],
  };
}

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
