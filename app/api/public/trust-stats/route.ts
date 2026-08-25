import { apiSuccess, apiError } from '@/lib/api/response'
import { getTrustStats } from '@/lib/content/public-content'

export const revalidate = 300

export async function GET() {
  try {
    const stats = await getTrustStats()
    return apiSuccess(stats)
  } catch {
    return apiError(500, 'TRUST_STATS_FAILED', 'تعذر تحميل إحصائيات الثقة', 'Failed to load trust stats')
  }
}