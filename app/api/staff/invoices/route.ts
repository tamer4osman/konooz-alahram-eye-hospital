import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireModuleAccess, readJson } from '@/lib/api/admin-route'
import { createInvoice, listInvoices } from '@/lib/usecases/invoices'
import {
  prismaInvoiceReader,
  prismaInvoiceWriter,
} from '@/lib/adapters/prisma/invoice-adapter'
import { InvoiceConflictError } from '@/lib/usecases/invoices'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  invoiceNumber: z.string().optional(),
  ticketNumber: z.string().optional(),
  patientNameAr: z.string().optional(),
  patientNameEn: z.string().optional(),
  procedureAr: z.string().optional(),
  procedureEn: z.string().optional(),
  insuranceNameAr: z.string().optional(),
  insuranceNameEn: z.string().optional(),
  surgeonFeeLYD: z.number().min(0).optional(),
  orFacilityFeeLYD: z.number().min(0).optional(),
  anesthesiaFeeLYD: z.number().min(0).optional(),
  lensOrDeviceFeeLYD: z.number().min(0).optional(),
  consumablesFeeLYD: z.number().min(0).optional(),
  totalGrossLYD: z.number().min(0).optional(),
  insuranceCoveredLYD: z.number().min(0).optional(),
  patientCoPayLYD: z.number().min(0).optional(),
  status: z.enum(['paid', 'pending_insurance', 'pre_auth_approved', 'draft', 'pending', 'partially_paid', 'cancelled']).optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond. All business
// rules live in lib/usecases/invoices; persistence in the Prisma adapter.

export async function GET() {
  const auth = await requireModuleAccess('billing', 'read')
  if (!auth.ok) return auth.response

  const invoices = await listInvoices(prismaInvoiceReader)
  return apiSuccess(invoices)
}

export async function POST(req: NextRequest) {
  const auth = await requireModuleAccess('billing', 'write')
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات الفاتورة غير مكتملة', 'Invoice data is incomplete or invalid')
  if (!body.ok) return body.response

  try {
    const invoice = await createInvoice(
      prismaInvoiceWriter,
      body.data,
      { actorEmail: auth.user.email, now: new Date() },
    )
    return apiSuccess(invoice, 201)
  } catch (err) {
    if (err instanceof InvoiceConflictError) {
      return apiError(
        409,
        'INVOICE_NUMBER_TAKEN',
        'رقم الفاتورة مستخدم بالفعل',
        'Invoice number already exists',
      )
    }
    throw err
  }
}
