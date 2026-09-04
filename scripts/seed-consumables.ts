import { ConsumableCategory } from '@prisma/client';
import { runSeed,
  loadSeedJson } from './seed-runner';

interface SeedConsumable {
  id: string;
  nameAr: string;
  nameEn: string;
  category: ConsumableCategory;
  brand: string;
  stockCurrent: number;
  stockMinThreshold: number;
  unitAr: string;
  unitEn: string;
  reorderStatus: 'optimal' | 'low_stock' | 'reorder_placed';
  batchLot: string;
  expiryDate: string;
  locationAr: string;
  locationEn: string;
  unitCostLYD: number;
}


runSeed(async (prisma) => {
  const items = loadSeedJson<SeedConsumable[]>('consumables.seed.json');

  for (const c of items) {
    const data = {
      nameAr: c.nameAr,
      nameEn: c.nameEn,
      category: c.category,
      unitAr: c.unitAr,
      unitEn: c.unitEn,
      stockLevel: c.stockCurrent,
      lowStockThreshold: c.stockMinThreshold,
      brand: c.brand,
      reorderStatus: c.reorderStatus,
      batchLot: c.batchLot,
      // Seed JSON speaks ISO strings; the column is a real DATE (2026-09-04
      // reporting-accuracy round), so convert at the seed boundary too.
      expiryDate: c.expiryDate ? new Date(`${c.expiryDate}T00:00:00.000Z`) : null,
      locationAr: c.locationAr,
      locationEn: c.locationEn,
      unitCostLYD: c.unitCostLYD,
    };
    await prisma.consumableType.upsert({ where: { id: c.id }, update: data, create: { id: c.id, ...data } });
  }
  console.log(`seeded ${items.length} consumables`);
});
