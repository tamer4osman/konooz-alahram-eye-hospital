import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
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
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const rows = await prisma.room.findMany({ orderBy: { createdAt: 'asc' } })
  return apiSuccess(rows.map(toRoomDTO))
}

export async function POST(req: NextRequest) {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload')
  }

  const parsed = createRoomSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', 'بيانات الغرفة غير مكتملة', 'Room data is incomplete or invalid')
  }
  const input = parsed.data
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
    const code = (err as { code?: string }).code
    if (code === 'P2002') {
      return apiError(409, 'CODE_TAKEN', 'رمز الغرفة مستخدم مسبقاً', 'Room code already exists')
    }
    return apiError(500, 'ROOM_CREATE_FAILED', 'تعذر إنشاء الغرفة', 'Failed to create room')
  }
}
