import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
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
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload')
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', 'قيم التحديث غير صالحة', 'Invalid update values')
  }

  // Marking a bed ready_clean releases its occupant and clears vitals
  const data = parsed.data.status === 'ready_clean' ? { ...OCCUPANT_FIELDS } : { ...parsed.data }

  try {
    const row = await prisma.bed.update({ where: { id }, data })
    return apiSuccess(toBedDTO(row))
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'BED_NOT_FOUND', 'السرير غير موجود', 'Bed not found')
    }
    return apiError(500, 'BED_UPDATE_FAILED', 'تعذر تحديث السرير', 'Failed to update bed')
  }
}
