import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, prismaFailure } from '@/lib/api/admin-route'
import { toBedDTO } from '@/lib/dashboard/beds'

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

// Fields cleared when a bed is marked ready_clean
const OCCUPANT_FIELDS = {
  patientId: null,
  patientNameAr: null,
  patientNameEn: null,
  patientAge: null,
  assignedDoctorAr: null,
  assignedDoctorEn: null,
  surgeryPerformedAr: null,
  surgeryPerformedEn: null,
  admissionTime: null,
  estimatedDischargeTime: null,
  bloodPressure: null,
  heartRateBpm: null,
  spO2Percent: null,
  tempCelsius: null,
  painScore: null,
} as const

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  // Marking a bed ready_clean releases its occupant and clears vitals
  const data =
    body.data.status === 'ready_clean'
      ? { ...body.data, ...OCCUPANT_FIELDS }
      : { ...body.data }

  try {
    const row = await prisma.bed.update({ where: { id }, data })
    return apiSuccess(toBedDTO(row))
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'BED_NOT_FOUND', ar: 'السرير غير موجود', en: 'Bed not found' },
      failure: { code: 'BED_UPDATE_FAILED', ar: 'تعذر تحديث السرير', en: 'Failed to update bed' },
    })
  }
}
