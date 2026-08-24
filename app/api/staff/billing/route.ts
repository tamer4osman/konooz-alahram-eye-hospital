import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
import { toInsurerDTO, toPacsDTO } from '@/lib/dashboard/billing'

export const dynamic = 'force-dynamic'

export async function GET() {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const [insurers, pacs] = await Promise.all([
    prisma.insuranceProvider.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.diagnosticPacsOrder.findMany({ orderBy: { orderedAt: 'desc' } }),
  ])
  return apiSuccess({ insurances: insurers.map(toInsurerDTO), pacsOrders: pacs.map(toPacsDTO) })
}
