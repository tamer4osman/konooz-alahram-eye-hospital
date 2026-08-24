import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/admin-route'
import { computeFlowStages } from '@/lib/dashboard/patientFlow'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const events = await prisma.patientFlowStage.findMany({
      where: { enteredAt: { gte: startOfDay } },
      orderBy: { enteredAt: 'asc' },
    })
    return apiSuccess(computeFlowStages(events))
  } catch {
    return apiError(500, 'FLOW_FAILED', 'تعذر تحميل مسار المرضى', 'Failed to load patient flow')
  }
}
