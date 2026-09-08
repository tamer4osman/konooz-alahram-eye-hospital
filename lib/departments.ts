import { prisma } from '@/lib/prisma';
import { withDbFallback } from '@/lib/db-fallback';
import type { Specialty } from '@/data/hospitalData';

/**
 * Active departments for the public site, ordered for display.
 * Consumed by server components (ISR-revalidated) and handed to the
 * LanguageProvider so client components read the same list.
 */
export async function getDepartments(): Promise<Specialty[]> {
  return withDbFallback('getDepartments', [], async () => {
  const rows = await prisma.department.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
  return rows.map((row) => ({
    id: row.id,
    iconName: row.iconName,
    image: row.image ?? undefined,
    titleAr: row.titleAr,
    titleEn: row.titleEn,
    shortDescAr: row.shortDescAr,
    shortDescEn: row.shortDescEn,
    fullDescAr: row.fullDescAr,
    fullDescEn: row.fullDescEn,
    badgeAr: row.badgeAr,
    badgeEn: row.badgeEn,
    proceduresAr: [...row.proceduresAr],
    proceduresEn: [...row.proceduresEn],
    technologiesAr: [...row.technologiesAr],
    technologiesEn: [...row.technologiesEn],
    durationAr: row.durationAr,
    durationEn: row.durationEn,
    recoveryAr: row.recoveryAr,
    recoveryEn: row.recoveryEn,
    suitableForAr: [...row.suitableForAr],
    suitableForEn: [...row.suitableForEn],
    intakeSchema: (row.intakeSchema as import('@/lib/types/intake-schema').IntakeSchema | null) ?? null,
  }));
  });
}
