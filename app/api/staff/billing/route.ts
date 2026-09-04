import { apiSuccess } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/admin-route'
import { loadBillingBoard } from '@/lib/usecases/billing'
import { prismaBillingReader } from '@/lib/adapters/prisma/billing-adapter'

export const dynamic = 'force-dynamic'

// Thin handler: auth gate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const board = await loadBillingBoard(prismaBillingReader)
  return apiSuccess(board)
}
