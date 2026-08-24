import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient, ConsumableCategory } from '@prisma/client';

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

const prisma = new PrismaClient();

async function main() {
  const items = JSON.parse(
    readFileSync(join(__dirname, 'consumables.seed.json'), 'utf8'),
  ) as SeedConsumable[];

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
      expiryDate: c.expiryDate,
      locationAr: c.locationAr,
      locationEn: c.locationEn,
      unitCostLYD: c.unitCostLYD,
    };
    await prisma.consumableType.upsert({ where: { id: c.id }, update: data, create: { id: c.id, ...data } });
  }
  console.log(`seeded ${items.length} consumables`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
