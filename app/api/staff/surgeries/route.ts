import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { toSurgeryDTO } from '@/lib/dashboard/surgeries'

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

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const rows = await prisma.scheduledSurgery.findMany({
    orderBy: { createdAt: 'desc' },
  })
  return apiSuccess(rows.map(toSurgeryDTO))
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات العملية غير مكتملة', 'Surgery data is incomplete or invalid')
  if (!body.ok) return body.response
  const input = body.data
  if (!input.patientNameAr && !input.patientNameEn) {
    return apiError(422, 'VALIDATION_ERROR', 'اسم المريض مطلوب', 'Patient name is required')
  }

  const row = await prisma.scheduledSurgery.create({
    data: {
      procedureAr: input.procedureAr ?? input.procedureEn ?? 'إجراء جراحي',
      procedureEn: input.procedureEn ?? input.procedureAr ?? null,
      scheduledAt: new Date(),
      durationMin: input.estimatedDurationMin ?? 60,
      status: 'scheduled',
      patientNameAr: input.patientNameAr ?? input.patientNameEn!,
      patientNameEn: input.patientNameEn ?? input.patientNameAr,
      patientPhone: input.patientPhone ?? '',
      patientAge: input.patientAge ?? null,
      gender: input.gender === 'female' ? 'FEMALE' : 'MALE',
      surgeonNameAr: input.surgeonAr ?? '',
      surgeonNameEn: input.surgeonEn ?? null,
      specialtyId: input.specialtyId ?? '',
      roomCode: input.roomCode ?? '',
      time: input.time ?? '',
      priority: input.priority ?? 'elective',
      anesthesiaTypeAr: input.anesthesiaTypeAr ?? '',
      anesthesiaTypeEn: input.anesthesiaTypeEn ?? null,
    },
  })
  return apiSuccess(toSurgeryDTO(row), 201)
}
