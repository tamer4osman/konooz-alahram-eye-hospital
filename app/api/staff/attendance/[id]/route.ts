import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, prismaFailure } from '@/lib/api/admin-route'
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
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const row = await prisma.staffAttendanceRecord.update({ where: { id }, data: body.data })
    return apiSuccess(toAttendanceDTO(row))
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'RECORD_NOT_FOUND', ar: 'سجل الحضور غير موجود', en: 'Attendance record not found' },
      failure: { code: 'ATTENDANCE_UPDATE_FAILED', ar: 'تعذر تحديث سجل الحضور', en: 'Failed to update attendance record' },
    })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    await prisma.staffAttendanceRecord.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'RECORD_NOT_FOUND', ar: 'سجل الحضور غير موجود', en: 'Attendance record not found' },
      failure: { code: 'ATTENDANCE_DELETE_FAILED', ar: 'تعذر حذف السجل', en: 'Failed to delete record' },
    })
  }
}
