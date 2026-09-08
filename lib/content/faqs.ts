import { prisma } from '@/lib/prisma'
import { withDbFallback } from '@/lib/db-fallback'
import type { Faq } from '@prisma/client'

export interface FaqDTO {
  id: string
  qAr: string
  qEn: string
  aAr: string
  aEn: string
}

function toFaqDTO(row: Faq): FaqDTO {
  return {
    id: row.id,
    qAr: row.qAr,
    qEn: row.qEn ?? '',
    aAr: row.aAr,
    aEn: row.aEn ?? '',
  }
}

export async function getFaqs(): Promise<FaqDTO[]> {
  return withDbFallback('getFaqs', [], async () => {
  const rows = await prisma.faq.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return rows.map(toFaqDTO)
  })
}
