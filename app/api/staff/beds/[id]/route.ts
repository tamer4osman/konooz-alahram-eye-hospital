import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { updateBed, BedNotFoundError } from '@/lib/usecases/beds'
import { prismaBedWriter } from '@/lib/adapters/prisma/bed-adapter'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['occupied', 'ready_clean', 'dirty_cleaning', 'reserved']).optional(),
  bloodPressure: z.string().nullable().optional(),
  heartRateBpm: z.number().int().min(0).max(300).nullable().optional(),
  spO2Percent: z.number().int().min(0).max(100).nullable().optional(),
  tempCelsius: z.number().nullable().optional(),
  painScore: z.number().int().min(0).max(10).nullable().optional(),
  patientId: z.string().nullable().optional(),
  patientNameAr: z.string().nullable().optional(),
  patientNameEn: z.string().nullable().optional(),
  patientAge: z.number().int().nullable().optional(),
  assignedDoctorAr: z.string().nullable().optional(),
  assignedDoctorEn: z.string().nullable().optional(),
  surgeryPerformedAr: z.string().nullable().optional(),
  surgeryPerformedEn: z.string().nullable().optional(),
  admissionTime: z.string().nullable().optional(),
  estimatedDischargeTime: z.string().nullable().optional(),
  nurseInChargeAr: z.string().nullable().optional(),
  nurseInChargeEn: z.string().nullable().optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const bed = await updateBed(prismaBedWriter, id, body.data)
    return apiSuccess(bed)
  } catch (err) {
    if (err instanceof BedNotFoundError) {
      return apiError(404, 'BED_NOT_FOUND', 'السرير غير موجود', 'Bed not found')
    }
    throw err
  }
}
