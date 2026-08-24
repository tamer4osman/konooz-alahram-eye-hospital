import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, prismaFailure } from '@/lib/api/admin-route'
import { toRoomDTO } from '@/lib/dashboard/rooms'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z
    .enum(['occupied_surgery', 'in_consultation', 'ready_clean', 'sterilizing', 'maintenance'])
    .optional(),
  sterilizationStatus: z.enum(['sterile_verified', 'in_progress', 'required']).optional(),
  airPressureHepa: z.enum(['positive_optimal', 'standard', 'warning']).optional(),
  tempCelsius: z.number().optional(),
  humidityPercent: z.number().optional(),
  occupiedCount: z.number().int().min(0).optional(),
  currentDoctorAr: z.string().nullable().optional(),
  currentDoctorEn: z.string().nullable().optional(),
  currentPatientId: z.string().nullable().optional(),
  currentProcedureAr: z.string().nullable().optional(),
  currentProcedureEn: z.string().nullable().optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  mainDeviceAssignedAr: z.string().optional(),
  mainDeviceAssignedEn: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const row = await prisma.room.update({ where: { id }, data: body.data })
    return apiSuccess(toRoomDTO(row))
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'ROOM_NOT_FOUND', ar: 'الغرفة غير موجودة', en: 'Room not found' },
      failure: { code: 'ROOM_UPDATE_FAILED', ar: 'تعذر تحديث الغرفة', en: 'Failed to update room' },
    })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    await prisma.room.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'ROOM_NOT_FOUND', ar: 'الغرفة غير موجودة', en: 'Room not found' },
      failure: { code: 'ROOM_DELETE_FAILED', ar: 'تعذر حذف الغرفة (قد تكون مرتبطة بمواعيد أو عمليات)', en: 'Failed to delete room (may have linked appointments or surgeries)' },
    })
  }
}
