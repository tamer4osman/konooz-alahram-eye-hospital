import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { auditStaffMutation } from '@/lib/api/audit'
import { createSurgery, listSurgeries, SurgeryNameRequiredError } from '@/lib/usecases/surgeries'
import { prismaSurgeryReader, prismaSurgeryWriter } from '@/lib/adapters/prisma/surgery-adapter'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  patientNameAr: z.string().optional(),
  patientNameEn: z.string().optional(),
  patientPhone: z.string().optional(),
  patientAge: z.number().int().min(0).max(130).optional(),
  gender: z.enum(['male', 'female']).optional(),
  surgeonAr: z.string().optional(),
  surgeonEn: z.string().optional(),
  procedureAr: z.string().optional(),
  procedureEn: z.string().optional(),
  specialtyId: z.string().optional(),
  roomCode: z.string().optional(),
  time: z.string().optional(),
  estimatedDurationMin: z.number().int().min(5).max(600).optional(),
  priority: z.enum(['urgent', 'elective', 'high_priority']).optional(),
  anesthesiaTypeAr: z.string().optional(),
  anesthesiaTypeEn: z.string().optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const surgeries = await listSurgeries(prismaSurgeryReader)
  return apiSuccess(surgeries)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات العملية غير مكتملة', 'Surgery data is incomplete or invalid')
  if (!body.ok) return body.response

  try {
    const surgery = await createSurgery(prismaSurgeryWriter, body.data)
    await auditStaffMutation(auth.user, {
      action: 'create',
      module: 'surgeries',
      targetId: surgery.id,
    })
    return apiSuccess(surgery, 201)
  } catch (err) {
    if (err instanceof SurgeryNameRequiredError) {
      return apiError(422, 'VALIDATION_ERROR', 'اسم المريض مطلوب', 'Patient name is required')
    }
    throw err
  }
}
