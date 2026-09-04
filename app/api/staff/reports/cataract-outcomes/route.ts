import { apiSuccess } from '@/lib/api/response'
import { requireModuleAccess } from '@/lib/api/admin-route'
import { loadCataractOutcomes } from '@/lib/usecases/analytics'
import {
  prismaOutcomeSurgeriesReader,
  prismaOutcomeConsultationsReader,
} from '@/lib/adapters/prisma/outcome-adapter'

export const dynamic = 'force-dynamic'

// Thin handler: auth gate -> use case -> respond.
// Cataract surgical outcomes (analytics read level): WHO-graded visual
// outcomes over clinical records + cataract procedure volume.

export async function GET() {
  const auth = await requireModuleAccess('analytics', 'read')
  if (!auth.ok) return auth.response

  const report = await loadCataractOutcomes(
    prismaOutcomeSurgeriesReader,
    prismaOutcomeConsultationsReader,
  )
  return apiSuccess(report)
}
