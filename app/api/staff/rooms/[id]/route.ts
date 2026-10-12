import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, auditedAdminWrite } from '@/lib/api/admin-route'
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

const ROOM_NOT_FOUND = {
  code: 'ROOM_NOT_FOUND',
  ar: 'الغرفة غير موجودة',
  en: 'Room not found',
  is: (err: unknown) => err instanceof RoomNotFoundError,
}

const ROOM_DELETE_CONFLICT = {
  code: 'ROOM_DELETE_CONFLICT',
  ar: 'تعذر حذف الغرفة (قد تكون مرتبطة بمواعيد أو عمليات)',
  en: 'Failed to delete room (may have linked appointments or surgeries)',
  is: (err: unknown) => err instanceof RoomConflictError,
}

// Thin handler: auth gate -> validate -> use case -> respond.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  const result = await auditedAdminWrite({
    user: auth.user,
    action: 'update',
    module: 'rooms',
    targetId: id,
    run: () => updateRoom(prismaRoomWriter, id, body.data),
    notFound: ROOM_NOT_FOUND,
  })
  if (!result.ok) return result.response
  return apiSuccess(result.data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const result = await auditedAdminWrite({
    user: auth.user,
    action: 'delete',
    module: 'rooms',
    targetId: id,
    run: () => deleteRoom(prismaRoomWriter, id),
    notFound: ROOM_NOT_FOUND,
    conflict: ROOM_DELETE_CONFLICT,
  })
  if (!result.ok) return result.response
  return apiSuccess({ ok: true })
}
