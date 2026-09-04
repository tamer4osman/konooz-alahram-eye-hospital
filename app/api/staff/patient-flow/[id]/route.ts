import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireModuleAccess, readJson, prismaFailure } from '@/lib/api/admin-route'
import {
  exitPatientStage,
  FlowStageNotFoundError,
  StageAlreadyClosedError,
} from '@/lib/usecases/patient-flow'
import {
  prismaPatientFlowStageQuery,
  prismaPatientFlowStageStore,
} from '@/lib/adapters/prisma/patient-flow-adapter'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  action: z.literal('exit'),
  noteAr: z.string().max(300).optional(),
  noteEn: z.string().max(300).optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.
// Confirms the patient left a stage — the wait-time funnel derives from these
// exits.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireModuleAccess('patient_flow', 'write')
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم تحديث المرحلة غير صالحة', 'Invalid stage update values')
  if (!body.ok) return body.response

  try {
    await exitPatientStage(
      prismaPatientFlowStageQuery,
      prismaPatientFlowStageStore,
      id,
    )
    return apiSuccess({ ok: true })
  } catch (err) {
    if (err instanceof FlowStageNotFoundError) {
      return apiError(404, 'FLOW_STAGE_NOT_FOUND', err.message, err.message)
    }
    if (err instanceof StageAlreadyClosedError) {
      return apiError(409, 'STAGE_ALREADY_CLOSED', err.message, err.message)
    }
    return prismaFailure(err, {
      failure: {
        code: 'UPDATE_FAILED',
        ar: 'تعذر إغلاق مرحلة التدفق',
        en: 'Could not close the flow stage',
      },
    })
  }
}
