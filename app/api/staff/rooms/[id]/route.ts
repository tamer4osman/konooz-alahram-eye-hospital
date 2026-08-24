import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
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

  try {
    const row = await prisma.room.update({ where: { id }, data: parsed.data })
    return apiSuccess(toRoomDTO(row))
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'ROOM_NOT_FOUND', 'الغرفة غير موجودة', 'Room not found')
    }
    return apiError(500, 'ROOM_UPDATE_FAILED', 'تعذر تحديث الغرفة', 'Failed to update room')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const { id } = await params
  try {
    await prisma.room.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'ROOM_NOT_FOUND', 'الغرفة غير موجودة', 'Room not found')
    }
    return apiError(500, 'ROOM_DELETE_FAILED', 'تعذر حذف الغرفة (قد تكون مرتبطة بمواعيد أو عمليات)', 'Failed to delete room (may have linked appointments or surgeries)')
  }
}
