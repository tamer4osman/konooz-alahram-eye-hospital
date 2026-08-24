import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await prisma.trustStat.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return apiSuccess(rows)
  } catch {
    return apiError(500, 'TRUST_STATS_FAILED', 'تعذر تحميل مؤشرات الثقة', 'Failed to load trust stats')
  }
}
