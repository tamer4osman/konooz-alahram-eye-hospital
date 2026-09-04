import type { ConsumableType } from '@prisma/client';
import type { SurgicalConsumable } from '@/data/dashboardData';

/** ISO date (YYYY-MM-DD) for the expiry radar; null/empty stays empty. */
function formatExpiry(d: Date | null): string {
  if (!d) return '';
  return d.toISOString().slice(0, 10);
}

export function toConsumableDTO(row: ConsumableType): SurgicalConsumable {
  return {
    id: row.id,
    nameAr: row.nameAr,
    nameEn: row.nameEn ?? '',
    category: row.category as SurgicalConsumable['category'],
    brand: row.brand,
    stockCurrent: row.stockLevel,
    stockMinThreshold: row.lowStockThreshold,
    unitAr: row.unitAr,
    unitEn: row.unitEn ?? '',
    reorderStatus: (row.reorderStatus || 'optimal') as SurgicalConsumable['reorderStatus'],
    batchLot: row.batchLot,
    expiryDate: formatExpiry(row.expiryDate),
    locationAr: row.locationAr,
    locationEn: row.locationEn ?? '',
    unitCostLYD: Number(row.unitCostLYD),
  };
}
