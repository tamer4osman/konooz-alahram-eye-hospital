import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const rows = await prisma.testimonial.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return apiSuccess(rows)
  } catch {
    return apiError(500, 'TESTIMONIALS_FAILED', 'تعذر تحميل قصص النجاح', 'Failed to load testimonials')
  }
}
