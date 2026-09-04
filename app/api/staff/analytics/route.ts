import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/admin-route'
import { loadAnalytics, dashboardAnalyticsEngine, isValidTimeframe } from '@/lib/usecases/analytics'
import type { AnalyticsTimeframe } from '@/lib/usecases/analytics'
import { prismaDepartmentsReader } from '@/lib/adapters/prisma/departments-adapter'

export const dynamic = 'force-dynamic'

// Thin handler: auth gate -> validate -> use case -> respond.

export async function GET(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const tfParam = new URL(request.url).searchParams.get('timeframe') ?? 'day'
  if (!isValidTimeframe(tfParam)) {
    return apiError(400, 'INVALID_TIMEFRAME', 'فترة زمنية غير صالحة', 'Invalid timeframe')
  }
  try {
    const data = await loadAnalytics(
      prismaDepartmentsReader,
      dashboardAnalyticsEngine,
      tfParam as AnalyticsTimeframe,
    )
    return apiSuccess(data)
  } catch {
    return apiError(500, 'ANALYTICS_FAILED', 'تعذر حساب المؤشرات', 'Failed to compute analytics')
  }
}
