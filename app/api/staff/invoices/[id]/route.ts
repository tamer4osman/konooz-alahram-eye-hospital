import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
import { toInvoiceDTO } from '@/lib/dashboard/billing'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['paid', 'pending_insurance', 'pre_auth_approved', 'draft', 'pending', 'partially_paid', 'cancelled']).optional(),
  paidDate: z.string().nullable().optional(),
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

  const data = { ...parsed.data }
  if (data.status === 'paid' && !data.paidDate) data.paidDate = new Date().toISOString()

  try {
    const row = await prisma.hospitalBillingInvoice.update({ where: { id }, data })
    return apiSuccess(toInvoiceDTO(row))
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'INVOICE_NOT_FOUND', 'الفاتورة غير موجودة', 'Invoice not found')
    }
    return apiError(500, 'INVOICE_UPDATE_FAILED', 'تعذر تحديث الفاتورة', 'Failed to update invoice')
  }
}
