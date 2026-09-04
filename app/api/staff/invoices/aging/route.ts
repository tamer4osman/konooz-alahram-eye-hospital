import { apiSuccess } from '@/lib/api/response'
import { requireModuleAccess } from '@/lib/api/admin-route'
import { loadInvoiceAgingTrend } from '@/lib/usecases/invoices'
import { prismaAgingSnapshotReader } from '@/lib/adapters/prisma/invoice-adapter'

export const dynamic = 'force-dynamic'

// Thin handler: auth gate -> use case -> respond.
// AR aging trend (billing read level): the live report plus a point-in-time
// reconstruction of what outstanding AR looked like 30 days ago.

export async function GET() {
  const auth = await requireModuleAccess('billing', 'read')
  if (!auth.ok) return auth.response

  const trend = await loadInvoiceAgingTrend(prismaAgingSnapshotReader)
  return apiSuccess(trend)
}
