import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
import { toAttendanceDTO } from '@/lib/dashboard/attendance'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  checkInTime: z.string().nullable().optional(),
  checkOutTime: z.string().nullable().optional(),
  status: z.enum(['present', 'absent', 'on_leave', 'late', 'present_ontime', 'in_surgery', 'on_call']).optional(),
  notesAr: z.string().nullable().optional(),
  notesEn: z.string().nullable().optional(),
  overtimeHours: z.number().min(0).optional(),
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
    const row = await prisma.staffAttendanceRecord.update({ where: { id }, data: parsed.data })
    return apiSuccess(toAttendanceDTO(row))
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'RECORD_NOT_FOUND', 'سجل الحضور غير موجود', 'Attendance record not found')
    }
    return apiError(500, 'ATTENDANCE_UPDATE_FAILED', 'تعذر تحديث سجل الحضور', 'Failed to update attendance record')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const { id } = await params
  try {
    await prisma.staffAttendanceRecord.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'RECORD_NOT_FOUND', 'سجل الحضور غير موجود', 'Attendance record not found')
    }
    return apiError(500, 'ATTENDANCE_DELETE_FAILED', 'تعذر حذف السجل', 'Failed to delete record')
  }
}
