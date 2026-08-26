import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/admin-route'
import { computeAnalytics, type AnalyticsTimeframe } from '@/lib/dashboard/analytics'
import { getDepartments } from '@/lib/departments'

export const dynamic = 'force-dynamic'

const VALID: AnalyticsTimeframe[] = ['day', 'week', 'month', 'year']

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  const tfParam = new URL(request.url).searchParams.get('timeframe') ?? 'day'
  if (!VALID.includes(tfParam as AnalyticsTimeframe)) {
    return apiError(400, 'INVALID_TIMEFRAME', 'فترة زمنية غير صالحة', 'Invalid timeframe')
  }
  try {
    const departments = await getDepartments()
    const data = await computeAnalytics(tfParam as AnalyticsTimeframe, departments)
    return apiSuccess(data)
  } catch {
    return apiError(500, 'ANALYTICS_FAILED', 'تعذر حساب المؤشرات', 'Failed to compute analytics')
  }
}
