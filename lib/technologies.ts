import { prisma } from '@/lib/prisma';
import type { TechnologyItem } from '@/data/hospitalData';

/**
 * Active technology showcase items, ordered for display.
 * Fetched server-side (ISR) and passed to TechnologySection as props.
 */
export async function getTechnologies(): Promise<TechnologyItem[]> {
  const rows = await prisma.technology.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  return rows.map((row) => ({
    id: row.id,
    titleAr: row.titleAr,
    titleEn: row.titleEn,
    categoryAr: row.categoryAr,
    categoryEn: row.categoryEn,
    descAr: row.descAr,
    descEn: row.descEn,
    featuresAr: [...row.featuresAr],
    featuresEn: [...row.featuresEn],
    precision: row.precision,
    imageSeed: row.imageSeed,
    image: row.image ?? undefined,
  }));
}
