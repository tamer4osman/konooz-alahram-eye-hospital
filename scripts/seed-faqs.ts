import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';

interface SeedFaq {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}

const prisma = new PrismaClient();

async function main() {
  const faqs = JSON.parse(
    readFileSync(join(__dirname, 'faqs.seed.json'), 'utf8'),
  ) as SeedFaq[];

  for (const [idx, f] of faqs.entries()) {
    const data = { qAr: f.qAr, qEn: f.qEn, aAr: f.aAr, aEn: f.aEn, sortOrder: idx };
    const existing = await prisma.faq.findFirst({ where: { qAr: f.qAr } });
    if (existing) {
      await prisma.faq.update({ where: { id: existing.id }, data });
    } else {
      await prisma.faq.create({ data });
    }
  }
  console.log(`seeded ${faqs.length} faqs`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
