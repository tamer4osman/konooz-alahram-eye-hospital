export type ConsumableCategory =
  | 'iol_lens'
  | 'viscoelastic'
  | 'laser_pack'
  | 'surgical_gas'
  | 'microsuture'
  | 'phaco_pack';

export type ReorderStatus = 'optimal' | 'low_stock' | 'reorder_placed';

export interface CreateConsumableInput {
  nameAr: string;
  nameEn?: string;
  category: ConsumableCategory;
  brand?: string;
  stockCurrent?: number;
  stockMinThreshold?: number;
  unitAr: string;
  unitEn?: string;
  reorderStatus?: ReorderStatus;
  batchLot?: string;
  expiryDate?: string;
  locationAr?: string;
  locationEn?: string;
  unitCostLYD?: number;
}

export interface ConsumablePatch {
  stockLevel?: number;
  lowStockThreshold?: number;
  reorderStatus?: ReorderStatus;
  expiryDate?: string | null;
  batchLot?: string;
  unitCostLYD?: number;
  locationAr?: string;
  locationEn?: string | null;
}

export class ConsumableNotFoundError extends Error {
  constructor() {
    super('Consumable not found');
    this.name = 'ConsumableNotFoundError';
  }
}

/** Fully-resolved create payload the adapter persists verbatim. */
export interface ResolvedConsumableCreate {
  nameAr: string;
  nameEn: string | null;
  category: ConsumableCategory;
  unitAr: string;
  unitEn: string | null;
  stockLevel: number;
  lowStockThreshold: number;
  brand: string;
  reorderStatus: ReorderStatus;
  batchLot: string;
  expiryDate: string | null;
  locationAr: string;
  locationEn: string | null;
  unitCostLYD: number;
}
