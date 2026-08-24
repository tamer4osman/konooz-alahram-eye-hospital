import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
import { computeFlowStages } from '@/lib/dashboard/patientFlow'

export const dynamic = 'force-dynamic'

export async function GET() {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

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
