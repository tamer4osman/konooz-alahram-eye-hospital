import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api/response'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [topics, issues] = await Promise.all([
      prisma.newsletterTopic.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
      prisma.newsletterIssue.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } }),
    ])
    return apiSuccess({ topics, issues })
  } catch {
    return apiError(500, 'NEWSLETTER_FAILED', 'تعذر تحميل نشرة العيون', 'Failed to load newsletter content')
  }
}
