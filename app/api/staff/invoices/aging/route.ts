import { apiSuccess } from '@/lib/api/response'
import { requireModuleAccess } from '@/lib/api/admin-route'
import { loadInvoiceAging } from '@/lib/usecases/invoices'
import { prismaInvoiceReader } from '@/lib/adapters/prisma/invoice-adapter'

export const dynamic = 'force-dynamic'

// Thin handler: auth gate -> use case -> respond.
// AR aging report (billing read level): outstanding invoices bucketed by
// days since issue.

export async function GET() {
  const auth = await requireModuleAccess('billing', 'read')
  if (!auth.ok) return auth.response

  const report = await loadInvoiceAging(prismaInvoiceReader)
  return apiSuccess(report)
}
