import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, prismaFailure } from '@/lib/api/admin-route'
import { toInvoiceDTO } from '@/lib/dashboard/billing'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['paid', 'pending_insurance', 'pre_auth_approved', 'draft', 'pending', 'partially_paid', 'cancelled']).optional(),
  paidDate: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  const data = { ...body.data }
  if (data.status === 'paid' && !data.paidDate) data.paidDate = new Date().toISOString()

  try {
    const row = await prisma.hospitalBillingInvoice.update({ where: { id }, data })
    return apiSuccess(toInvoiceDTO(row))
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'INVOICE_NOT_FOUND', ar: 'الفاتورة غير موجودة', en: 'Invoice not found' },
      failure: { code: 'INVOICE_UPDATE_FAILED', ar: 'تعذر تحديث الفاتورة', en: 'Failed to update invoice' },
    })
  }
}
