import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { deleteSurgery, updateSurgery, SurgeryNotFoundError } from '@/lib/usecases/surgeries'
import { prismaSurgeryWriter } from '@/lib/adapters/prisma/surgery-adapter'

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

// Thin handler: auth gate -> validate -> use case -> respond.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const surgery = await updateSurgery(prismaSurgeryWriter, id, body.data)
    return apiSuccess(surgery)
  } catch (err) {
    if (err instanceof SurgeryNotFoundError) {
      return apiError(404, 'SURGERY_NOT_FOUND', 'العملية غير موجودة', 'Surgery not found')
    }
    throw err
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    await deleteSurgery(prismaSurgeryWriter, id)
    return apiSuccess({ ok: true })
  } catch (err) {
    if (err instanceof SurgeryNotFoundError) {
      return apiError(404, 'SURGERY_NOT_FOUND', 'العملية غير موجودة', 'Surgery not found')
    }
    throw err
  }
}
