import { runSeed,
  loadSeedJson } from './seed-runner';

interface SeedStat {
  value: string;
  labelAr: string;
  labelEn: string;
  icon: string;
}


runSeed(async (prisma) => {
  const stats = loadSeedJson<SeedStat[]>('trust-stats.seed.json');

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
});
