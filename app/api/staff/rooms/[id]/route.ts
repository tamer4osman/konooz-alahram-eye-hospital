import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { deleteRoom, updateRoom, RoomConflictError, RoomNotFoundError } from '@/lib/usecases/rooms'
import { prismaRoomWriter } from '@/lib/adapters/prisma/room-adapter'

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

// Thin handler: auth gate -> validate -> use case -> respond.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const room = await updateRoom(prismaRoomWriter, id, body.data)
    return apiSuccess(room)
  } catch (err) {
    if (err instanceof RoomNotFoundError) {
      return apiError(404, 'ROOM_NOT_FOUND', 'الغرفة غير موجودة', 'Room not found')
    }
    throw err
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    await deleteRoom(prismaRoomWriter, id)
    return apiSuccess({ ok: true })
  } catch (err) {
    if (err instanceof RoomNotFoundError) {
      return apiError(404, 'ROOM_NOT_FOUND', 'الغرفة غير موجودة', 'Room not found')
    }
    if (err instanceof RoomConflictError) {
      // FK constraint: room still referenced by appointments/surgeries
      return apiError(
        409,
        'ROOM_DELETE_CONFLICT',
        'تعذر حذف الغرفة (قد تكون مرتبطة بمواعيد أو عمليات)',
        'Failed to delete room (may have linked appointments or surgeries)',
      )
    }
    throw err
  }
}
