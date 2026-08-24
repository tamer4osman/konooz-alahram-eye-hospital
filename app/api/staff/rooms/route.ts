import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson, prismaFailure } from '@/lib/api/admin-route'
import { toRoomDTO } from '@/lib/dashboard/rooms'

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

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const rows = await prisma.room.findMany({ orderBy: { createdAt: 'asc' } })
  return apiSuccess(rows.map(toRoomDTO))
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createRoomSchema, 'بيانات الغرفة غير مكتملة', 'Room data is incomplete or invalid')
  if (!body.ok) return body.response
  const input = body.data
  if (!input.nameAr && !input.nameEn) {
    return apiError(422, 'VALIDATION_ERROR', 'اسم الغرفة مطلوب', 'Room name is required')
  }

  try {
    const row = await prisma.room.create({
      data: {
        code: input.code,
        nameAr: input.nameAr ?? input.nameEn!,
        nameEn: input.nameEn ?? input.nameAr,
        type: input.type,
        floorAr: input.floorAr ?? '',
        floorEn: input.floorEn ?? null,
        capacity: input.capacity ?? 1,
        tempCelsius: input.tempCelsius ?? 20,
        humidityPercent: input.humidityPercent ?? 45,
        mainDeviceAssignedAr: input.mainDeviceAssignedAr ?? '',
        mainDeviceAssignedEn: input.mainDeviceAssignedEn ?? null,
      },
    })
    return apiSuccess(toRoomDTO(row), 201)
  } catch (err) {
    return prismaFailure(err, {
      conflict: { code: 'CODE_TAKEN', ar: 'رمز الغرفة مستخدم مسبقاً', en: 'Room code already exists' },
      failure: { code: 'ROOM_CREATE_FAILED', ar: 'تعذر إنشاء الغرفة', en: 'Failed to create room' },
    })
  }
}
