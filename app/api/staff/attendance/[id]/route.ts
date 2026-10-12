import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, auditedAdminWrite } from '@/lib/api/admin-route'
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

const RECORD_NOT_FOUND = {
  code: 'RECORD_NOT_FOUND',
  ar: 'سجل الحضور غير موجود',
  en: 'Attendance record not found',
  is: (err: unknown) => err instanceof AttendanceNotFoundError,
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
    module: 'attendance',
    targetId: id,
    run: () => updateAttendance(prismaAttendanceWriter, id, body.data),
    notFound: RECORD_NOT_FOUND,
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
    module: 'attendance',
    targetId: id,
    run: () => deleteAttendance(prismaAttendanceWriter, id),
    notFound: RECORD_NOT_FOUND,
  })
  if (!result.ok) return result.response
  return apiSuccess({ ok: true })
}
