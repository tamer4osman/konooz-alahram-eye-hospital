import { apiSuccess } from '@/lib/api/response'
import { requireModuleAccess } from '@/lib/api/admin-route'
import { loadConsumablesSummary } from '@/lib/usecases/consumables'
import { prismaConsumableReader } from '@/lib/adapters/prisma/consumable-adapter'

export const dynamic = 'force-dynamic'

// Thin handler: auth gate -> use case -> respond.
// Inventory summary (analytics read level): counts, value, expiry radar.

export async function GET() {
  const auth = await requireModuleAccess('analytics', 'read')
  if (!auth.ok) return auth.response

  const summary = await loadConsumablesSummary(prismaConsumableReader)
  return apiSuccess(summary)
}
