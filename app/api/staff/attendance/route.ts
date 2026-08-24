import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
import { toAttendanceDTO } from '@/lib/dashboard/attendance'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  staffId: z.string().optional(),
  staffNameAr: z.string().min(1),
  staffNameEn: z.string().optional(),
  roleAr: z.string().optional(),
  roleEn: z.string().optional(),
  avatar: z.string().optional(),
  category: z.enum(['surgeon', 'consultant', 'resident', 'nurse', 'technician', 'admin']).optional(),
  departmentAr: z.string().optional(),
  departmentEn: z.string().optional(),
  shiftType: z.enum(['morning', 'evening', 'night_call', 'full_day']),
  shiftNameAr: z.string().optional(),
  shiftNameEn: z.string().optional(),
  shiftTiming: z.string().optional(),
  scheduledTime: z.string().optional(),
  badgeCode: z.string().optional(),
})

export async function GET() {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const rows = await prisma.staffAttendanceRecord.findMany({ orderBy: { createdAt: 'asc' } })
  return apiSuccess(rows.map(toAttendanceDTO))
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
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', 'بيانات الحضور غير مكتملة', 'Attendance data is incomplete or invalid')
  }
  const input = parsed.data

  const row = await prisma.staffAttendanceRecord.create({
    data: {
      staffId: input.staffId ?? null,
      staffNameAr: input.staffNameAr,
      staffNameEn: input.staffNameEn ?? null,
      roleAr: input.roleAr ?? '',
      roleEn: input.roleEn ?? null,
      avatar: input.avatar ?? '',
      category: input.category ?? 'consultant',
      departmentAr: input.departmentAr ?? '',
      departmentEn: input.departmentEn ?? null,
      shiftType: input.shiftType,
      shiftNameAr: input.shiftNameAr ?? '',
      shiftNameEn: input.shiftNameEn ?? null,
      shiftTiming: input.shiftTiming ?? '',
      scheduledTime: input.scheduledTime ?? '',
      badgeCode: input.badgeCode ?? '',
      date: new Date(),
    },
  })
  return apiSuccess(toAttendanceDTO(row), 201)
}
