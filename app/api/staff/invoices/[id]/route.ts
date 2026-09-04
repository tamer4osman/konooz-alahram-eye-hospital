import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireModuleAccess, readJson } from '@/lib/api/admin-route'
import { updateInvoiceStatus } from '@/lib/usecases/invoices'
import { prismaInvoiceStatusUpdater } from '@/lib/adapters/prisma/invoice-adapter'
import {
  InvoiceConflictError,
  InvoiceNotFoundError,
} from '@/lib/usecases/invoices'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['paid', 'pending_insurance', 'pre_auth_approved', 'draft', 'pending', 'partially_paid', 'cancelled']).optional(),
  paidDate: z.string().nullable().optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireModuleAccess('billing', 'write')
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const invoice = await updateInvoiceStatus(
      prismaInvoiceStatusUpdater,
      id,
      body.data,
    )
    return apiSuccess(invoice)
  } catch (err) {
    if (err instanceof InvoiceNotFoundError) {
      return apiError(
        404,
        'INVOICE_NOT_FOUND',
        'الفاتورة غير موجودة',
        'Invoice not found',
      )
    }
    if (err instanceof InvoiceConflictError) {
      return apiError(
        409,
        'INVOICE_CONFLICT',
        'تعارض في تحديث الفاتورة',
        'Invoice update conflict',
      )
    }
    throw err
  }
}
