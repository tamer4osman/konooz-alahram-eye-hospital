import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';

interface SeedStat {
  value: string;
  labelAr: string;
  labelEn: string;
  icon: string;
}

const prisma = new PrismaClient();

async function main() {
  const stats = JSON.parse(
    readFileSync(join(__dirname, 'trust-stats.seed.json'), 'utf8'),
  ) as SeedStat[];

  for (const [idx, s] of stats.entries()) {
    const data = { value: s.value, labelAr: s.labelAr, labelEn: s.labelEn, icon: s.icon, sortOrder: idx };
    const existing = await prisma.trustStat.findFirst({ where: { labelAr: s.labelAr } });
    if (existing) {
      await prisma.trustStat.update({ where: { id: existing.id }, data });
    } else {
      await prisma.trustStat.create({ data });
    }
  }
  console.log(`seeded ${stats.length} trust stats`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
