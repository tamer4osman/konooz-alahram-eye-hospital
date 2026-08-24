import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';

interface SeedTopic {
  id: string;
  titleAr: string;
  titleEn: string;
  icon: string;
  frequencyAr: string;
  frequencyEn: string;
}
interface SeedIssue {
  id: string;
  date: string;
  titleAr: string;
  titleEn: string;
  categoryAr: string;
  categoryEn: string;
  readTimeAr: string;
  readTimeEn: string;
  summaryAr: string;
  summaryEn: string;
}

const prisma = new PrismaClient();

async function main() {
  const { topics, issues } = JSON.parse(
    readFileSync(join(__dirname, 'newsletter.seed.json'), 'utf8'),
  ) as { topics: SeedTopic[]; issues: SeedIssue[] };

  for (const [idx, tp] of topics.entries()) {
    const data = {
      titleAr: tp.titleAr,
      titleEn: tp.titleEn,
      icon: tp.icon,
      frequencyAr: tp.frequencyAr,
      frequencyEn: tp.frequencyEn,
      sortOrder: idx,
    };
    await prisma.newsletterTopic.upsert({ where: { id: tp.id }, update: data, create: { id: tp.id, ...data } });
  }
  for (const [idx, is] of issues.entries()) {
    const data = {
      date: is.date,
      titleAr: is.titleAr,
      titleEn: is.titleEn,
      categoryAr: is.categoryAr,
      categoryEn: is.categoryEn,
      readTimeAr: is.readTimeAr,
      readTimeEn: is.readTimeEn,
      summaryAr: is.summaryAr,
      summaryEn: is.summaryEn,
      sortOrder: idx,
    };
    await prisma.newsletterIssue.upsert({ where: { id: is.id }, update: data, create: { id: is.id, ...data } });
  }
  console.log(`seeded ${topics.length} topics, ${issues.length} issues`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
