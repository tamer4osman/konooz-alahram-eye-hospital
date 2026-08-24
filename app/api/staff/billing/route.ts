import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/admin-route'
import { toInsurerDTO, toPacsDTO } from '@/lib/dashboard/billing'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const [insurers, pacs] = await Promise.all([
    prisma.insuranceProvider.findMany({ orderBy: { createdAt: 'asc' } }),
    prisma.diagnosticPacsOrder.findMany({ orderBy: { orderedAt: 'desc' } }),
  ])
  return apiSuccess({ insurances: insurers.map(toInsurerDTO), pacsOrders: pacs.map(toPacsDTO) })
}
