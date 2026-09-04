import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireModuleAccess, readJson, prismaFailure } from '@/lib/api/admin-route'
import {
  loadFlowSnapshot,
  openPatientStage,
  StageAlreadyOpenError,
} from '@/lib/usecases/patient-flow'
import {
  prismaPatientFlowReader,
  prismaOpenStageLister,
  prismaPatientFlowStageQuery,
  prismaPatientFlowStageStore,
} from '@/lib/adapters/prisma/patient-flow-adapter'

export const dynamic = 'force-dynamic'

const FLOW_STAGE_ENUM = z.enum([
  'reception',
  'triage',
  'diagnostics',
  'consultation',
  'pre_op',
  'in_or',
  'procedure',
  'pacu',
  'waiting_discharge',
  'discharged',
])

const openSchema = z.object({
  patientId: z.string().trim().min(1).max(80),
  stageType: FLOW_STAGE_ENUM,
})

// Thin handlers: auth gate -> validate -> use case -> respond.
// The patient_flow module (write level) governs capture; the board snapshot
// itself needs only read.

export async function GET() {
  const auth = await requireModuleAccess('patient_flow', 'read')
  if (!auth.ok) return auth.response

  const snapshot = await loadFlowSnapshot(prismaPatientFlowReader, prismaOpenStageLister)
  return apiSuccess(snapshot)
}

export async function POST(req: NextRequest) {
  const auth = await requireModuleAccess('patient_flow', 'write')
  if (!auth.ok) return auth.response

  const body = await readJson(req, openSchema, 'قيم فتح المرحلة غير صالحة', 'Invalid stage values')
  if (!body.ok) return body.response

  try {
    const created = await openPatientStage(
      prismaPatientFlowStageQuery,
      prismaPatientFlowStageStore,
      body.data,
    )
    return apiSuccess(created)
  } catch (err) {
    if (err instanceof StageAlreadyOpenError) {
      return apiError(409, 'STAGE_ALREADY_OPEN', err.message, err.message)
    }
    return prismaFailure(err, {
      failure: {
        code: 'CREATE_FAILED',
        ar: 'تعذر تسجيل مرحلة التدفق',
        en: 'Could not record the flow stage',
      },
    })
  }
}
