import { apiSuccess, apiError } from '@/lib/api/response'
import { getStaffUser } from '@/lib/auth/guards'
import { computeAnalytics, type AnalyticsTimeframe } from '@/lib/dashboard/analytics'

export const dynamic = 'force-dynamic'

const VALID: AnalyticsTimeframe[] = ['day', 'week', 'month', 'year']

export async function GET(request: Request) {
  const staffUser = await getStaffUser()
  if (!staffUser) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')
  const tfParam = new URL(request.url).searchParams.get('timeframe') ?? 'day'
  if (!VALID.includes(tfParam as AnalyticsTimeframe)) {
    return apiError(400, 'INVALID_TIMEFRAME', 'فترة زمنية غير صالحة', 'Invalid timeframe')
  }
  try {
    const data = await computeAnalytics(tfParam as AnalyticsTimeframe)
    return apiSuccess(data)
  } catch {
    return apiError(500, 'ANALYTICS_FAILED', 'تعذر حساب المؤشرات', 'Failed to compute analytics')
  }
}
