import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireModuleAccess, readJson } from '@/lib/api/admin-route'
import { auditStaffMutation } from '@/lib/api/audit'
import {
  openPaymentSession,
  listTransactionsForInvoice,
} from '@/lib/usecases/payments/use-cases'
import {
  prismaPaymentTxnWriter,
  prismaInvoicePaymentReader,
} from '@/lib/adapters/prisma/payment-adapter'
import { prismaInvoiceStatusUpdater } from '@/lib/adapters/prisma/invoice-adapter'
import { getDpayClient } from '@/lib/adapters/dpay/config'
import { DpayError } from '@/lib/adapters/dpay/client'
import {
  PaymentNotFoundError,
  PaymentCollectionNotAllowedError,
  PaymentFieldError,
  PaymentAmountError,
} from '@/lib/usecases/payments/errors'
import { PAYMENT_METHOD_KEYS } from '@/lib/usecases/payments/rules'

export const dynamic = 'force-dynamic'

const openSchema = z.object({
  method: z.enum(PAYMENT_METHOD_KEYS),
  amount: z.number().positive(),
  customerMobile: z.string().optional(),
  birthYear: z.string().optional(),
})

// Bilingual copy for each typed payment failure. Gateway (DpayError) failures
// pass the gateway's own message through — it is patient-actionable
// (wrong PIN, insufficient balance) and contains no secrets.
function paymentFailure(err: unknown): Response | null {
  if (err instanceof PaymentNotFoundError) {
    return apiError(404, 'PAYMENT_NOT_FOUND', 'الفاتورة أو العملية غير موجودة', 'Invoice or payment transaction not found')
  }
  if (err instanceof PaymentCollectionNotAllowedError) {
    return apiError(409, 'COLLECTION_NOT_ALLOWED', 'لا يمكن تحصيل مدفوعات إلكترونية لهذه الفاتورة', 'This invoice cannot receive online collections')
  }
  if (err instanceof PaymentFieldError) {
    return apiError(422, 'PAYMENT_FIELD_INVALID', 'بيانات الدفع غير صالحة — تحقق من رقم الجوال أو رمز التحقق', 'Invalid payment details — check the mobile number or OTP')
  }
  if (err instanceof PaymentAmountError) {
    return apiError(422, 'PAYMENT_AMOUNT_INVALID', 'المبلغ غير مسموح — يجب أن يكون ضمن الرصيد المتبقي وحدود بوابة الدفع', 'Amount not allowed — it must be within the outstanding balance and gateway limits')
  }
  if (err instanceof DpayError) {
    return apiError(
      err.status === 422 ? 422 : 502,
      'GATEWAY_ERROR',
      `تعذر إتمام العملية مع بوابة الدفع: ${err.message}`,
      `Payment gateway rejected the operation: ${err.message}`,
    )
  }
  return null
}

function buildDeps() {
  return {
    gateway: getDpayClient(),
    invoiceReader: prismaInvoicePaymentReader,
    txnWriter: prismaPaymentTxnWriter,
    invoiceStatusUpdater: prismaInvoiceStatusUpdater,
  }
}

// Thin handler: auth gate -> validate -> use case -> respond.

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireModuleAccess('billing', 'read')
  if (!auth.ok) return auth.response

  const { id } = await params
  const summary = await listTransactionsForInvoice(buildDeps(), id)
  return apiSuccess(summary)
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireModuleAccess('billing', 'write')
  if (!auth.ok) return auth.response

  const body = await readJson(req, openSchema, 'بيانات الدفع غير مكتملة', 'Payment details are incomplete or invalid')
  if (!body.ok) return body.response

  const { id } = await params

  try {
    const result = await openPaymentSession(buildDeps(), {
      invoiceId: id,
      method: body.data.method,
      amount: body.data.amount,
      fields: {
        customerMobile: body.data.customerMobile,
        birthYear: body.data.birthYear,
      },
      actorEmail: auth.user.email,
    })
    await auditStaffMutation(auth.user, {
      action: 'create',
      module: 'invoices',
      targetId: result.transaction.id,
    })
    return apiSuccess(
      {
        transaction: result.transaction,
        paymentLink: result.paymentLink,
        gatewayTotal: result.gatewayTotal,
      },
      201,
    )
  } catch (err) {
    const mapped = paymentFailure(err)
    if (mapped) return mapped
    throw err
  }
}
