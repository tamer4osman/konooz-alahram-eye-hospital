import { apiSuccess } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/admin-route'
import { loadFlowBoard } from '@/lib/usecases/patient-flow'
import { prismaPatientFlowReader } from '@/lib/adapters/prisma/patient-flow-adapter'

export const dynamic = 'force-dynamic'

// Thin handler: auth gate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const board = await loadFlowBoard(prismaPatientFlowReader)
  return apiSuccess(board)
}
