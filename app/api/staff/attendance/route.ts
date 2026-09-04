import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { createAttendance, listAttendance } from '@/lib/usecases/attendance'
import {
  prismaAttendanceReader,
  prismaAttendanceWriter,
} from '@/lib/adapters/prisma/attendance-adapter'

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

// Thin handler: auth gate -> validate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const records = await listAttendance(prismaAttendanceReader)
  return apiSuccess(records)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات الحضور غير مكتملة', 'Attendance data is incomplete or invalid')
  if (!body.ok) return body.response

  const record = await createAttendance(prismaAttendanceWriter, body.data)
  return apiSuccess(record, 201)
}
