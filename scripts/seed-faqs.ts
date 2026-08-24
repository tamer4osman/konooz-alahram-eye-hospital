import { runSeed,
  loadSeedJson } from './seed-runner';

interface SeedFaq {
  qAr: string;
  qEn: string;
  aAr: string;
  aEn: string;
}


runSeed(async (prisma) => {
  const faqs = loadSeedJson<SeedFaq[]>('faqs.seed.json');

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
});
