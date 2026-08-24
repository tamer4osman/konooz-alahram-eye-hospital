import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
import { toSurgeryDTO } from '@/lib/dashboard/surgeries'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z
    .enum(['scheduled', 'in_progress', 'pre_op_prep', 'in_or', 'post_op_recovery', 'completed', 'cancelled'])
    .optional(),
  roomCode: z.string().optional(),
  time: z.string().optional(),
  notesAr: z.string().nullable().optional(),
  notesEn: z.string().nullable().optional(),
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
    const row = await prisma.scheduledSurgery.update({ where: { id }, data: parsed.data })
    return apiSuccess(toSurgeryDTO(row))
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'SURGERY_NOT_FOUND', 'العملية غير موجودة', 'Surgery not found')
    }
    return apiError(500, 'SURGERY_UPDATE_FAILED', 'تعذر تحديث العملية', 'Failed to update surgery')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const { id } = await params
  try {
    await prisma.scheduledSurgery.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'SURGERY_NOT_FOUND', 'العملية غير موجودة', 'Surgery not found')
    }
    return apiError(500, 'SURGERY_DELETE_FAILED', 'تعذر حذف العملية', 'Failed to delete surgery')
  }
}
