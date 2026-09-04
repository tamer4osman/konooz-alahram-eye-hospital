import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import {
  createRoom,
  listRooms,
  RoomConflictError,
  RoomNameRequiredError,
} from '@/lib/usecases/rooms'
import { prismaRoomReader, prismaRoomWriter } from '@/lib/adapters/prisma/room-adapter'

export const dynamic = 'force-dynamic'

const roomTypeEnum = z.enum([
  'operating_theater',
  'outpatient_clinic',
  'diagnostic_suite',
  'recovery_ward',
  'laser_room',
])

const createRoomSchema = z.object({
  code: z.string().min(1).max(32),
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  type: roomTypeEnum,
  floorAr: z.string().optional(),
  floorEn: z.string().optional(),
  capacity: z.number().int().min(1).max(50).optional(),
  tempCelsius: z.number().optional(),
  humidityPercent: z.number().optional(),
  mainDeviceAssignedAr: z.string().optional(),
  mainDeviceAssignedEn: z.string().optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const rooms = await listRooms(prismaRoomReader)
  return apiSuccess(rooms)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createRoomSchema, 'بيانات الغرفة غير مكتملة', 'Room data is incomplete or invalid')
  if (!body.ok) return body.response

  try {
    const room = await createRoom(prismaRoomWriter, body.data)
    return apiSuccess(room, 201)
  } catch (err) {
    if (err instanceof RoomNameRequiredError) {
      return apiError(422, 'VALIDATION_ERROR', 'اسم الغرفة مطلوب', 'Room name is required')
    }
    if (err instanceof RoomConflictError) {
      return apiError(409, 'CODE_TAKEN', 'رمز الغرفة مستخدم مسبقاً', 'Room code already exists')
    }
    throw err
  }
}
