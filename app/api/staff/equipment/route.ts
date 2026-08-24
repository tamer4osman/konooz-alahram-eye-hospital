import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
import { toEquipmentDTO } from '@/lib/dashboard/equipment'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  departmentAr: z.string().optional(),
  departmentEn: z.string().optional(),
  roomCode: z.string().optional(),
  status: z.enum(['operational', 'in_use', 'under_calibration', 'maintenance_scheduled', 'offline_alert']).optional(),
  notesAr: z.string().optional(),
  notesEn: z.string().optional(),
})

export async function GET() {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const rows = await prisma.equipment.findMany({ orderBy: { createdAt: 'asc' } })
  return apiSuccess(rows.map(toEquipmentDTO))
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

  const parsed = createSchema.safeParse(body)
  if (!parsed.success || (!parsed.data.nameAr && !parsed.data.nameEn)) {
    return apiError(422, 'VALIDATION_ERROR', 'بيانات الجهاز غير مكتملة', 'Equipment data is incomplete or invalid')
  }
  const input = parsed.data

  const row = await prisma.equipment.create({
    data: {
      nameAr: input.nameAr ?? input.nameEn!,
      nameEn: input.nameEn ?? input.nameAr,
      brand: input.brand ?? '',
      modelNumber: input.model ?? null,
      serialNumber: input.serialNumber ?? '',
      departmentAr: input.departmentAr ?? '',
      departmentEn: input.departmentEn ?? null,
      roomCode: input.roomCode ?? '',
      status: input.status ?? 'operational',
      notesAr: input.notesAr ?? '',
      notesEn: input.notesEn ?? null,
    },
  })
  return apiSuccess(toEquipmentDTO(row), 201)
}
