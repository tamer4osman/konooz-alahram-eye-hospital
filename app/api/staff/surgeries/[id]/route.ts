import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, prismaFailure } from '@/lib/api/admin-route'
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
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const row = await prisma.scheduledSurgery.update({ where: { id }, data: body.data })
    return apiSuccess(toSurgeryDTO(row))
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'SURGERY_NOT_FOUND', ar: 'العملية غير موجودة', en: 'Surgery not found' },
      failure: { code: 'SURGERY_UPDATE_FAILED', ar: 'تعذر تحديث العملية', en: 'Failed to update surgery' },
    })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    await prisma.scheduledSurgery.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'SURGERY_NOT_FOUND', ar: 'العملية غير موجودة', en: 'Surgery not found' },
      failure: { code: 'SURGERY_DELETE_FAILED', ar: 'تعذر حذف العملية', en: 'Failed to delete surgery' },
    })
  }
}
