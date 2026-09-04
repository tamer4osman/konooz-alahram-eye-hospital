import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { deleteAttendance, updateAttendance, AttendanceNotFoundError } from '@/lib/usecases/attendance'
import { prismaAttendanceWriter } from '@/lib/adapters/prisma/attendance-adapter'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  checkInTime: z.string().nullable().optional(),
  checkOutTime: z.string().nullable().optional(),
  status: z.enum(['present', 'absent', 'on_leave', 'late', 'present_ontime', 'in_surgery', 'on_call']).optional(),
  notesAr: z.string().nullable().optional(),
  notesEn: z.string().nullable().optional(),
  overtimeHours: z.number().min(0).optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const record = await updateAttendance(prismaAttendanceWriter, id, body.data)
    return apiSuccess(record)
  } catch (err) {
    if (err instanceof AttendanceNotFoundError) {
      return apiError(404, 'RECORD_NOT_FOUND', 'سجل الحضور غير موجود', 'Attendance record not found')
    }
    throw err
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    await deleteAttendance(prismaAttendanceWriter, id)
    return apiSuccess({ ok: true })
  } catch (err) {
    if (err instanceof AttendanceNotFoundError) {
      return apiError(404, 'RECORD_NOT_FOUND', 'سجل الحضور غير موجود', 'Attendance record not found')
    }
    throw err
  }
}
