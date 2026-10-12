import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, auditedAdminWrite } from '@/lib/api/admin-route'
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

const SURGERY_NOT_FOUND = {
  code: 'SURGERY_NOT_FOUND',
  ar: 'العملية غير موجودة',
  en: 'Surgery not found',
  is: (err: unknown) => err instanceof SurgeryNotFoundError,
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
    module: 'surgeries',
    targetId: id,
    run: () => updateSurgery(prismaSurgeryWriter, id, body.data),
    notFound: SURGERY_NOT_FOUND,
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
    module: 'surgeries',
    targetId: id,
    run: () => deleteSurgery(prismaSurgeryWriter, id),
    notFound: SURGERY_NOT_FOUND,
  })
  if (!result.ok) return result.response
  return apiSuccess({ ok: true })
}
