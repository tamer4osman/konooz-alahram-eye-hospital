import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireModuleAccess, readJson } from '@/lib/api/admin-route'
import { auditStaffMutation } from '@/lib/api/audit'
import { verifyPaymentOtp } from '@/lib/usecases/payments/use-cases'
import {
  prismaPaymentTxnWriter,
  prismaInvoicePaymentReader,
} from '@/lib/adapters/prisma/payment-adapter'
import { prismaInvoiceStatusUpdater } from '@/lib/adapters/prisma/invoice-adapter'
import { getDpayClient } from '@/lib/adapters/dpay/config'
import { DpayError } from '@/lib/adapters/dpay/client'
import {
  PaymentNotFoundError,
  PaymentStateError,
  PaymentFieldError,
} from '@/lib/usecases/payments/errors'

export const dynamic = 'force-dynamic'

const verifySchema = z.object({
  otp: z.string().min(4).max(6).regex(/^\d{4,6}$/),
})

// Thin handler: auth gate -> validate -> use case -> respond.

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; txnId: string }> },
) {
  const auth = await requireModuleAccess('billing', 'write')
  if (!auth.ok) return auth.response

  const body = await readJson(req, verifySchema, 'رمز التحقق غير صالح', 'The OTP code is invalid')
  if (!body.ok) return body.response

  const { txnId } = await params

  try {
    const result = await verifyPaymentOtp(
      {
        gateway: getDpayClient(),
        invoiceReader: prismaInvoicePaymentReader,
        txnWriter: prismaPaymentTxnWriter,
        invoiceStatusUpdater: prismaInvoiceStatusUpdater,
      },
      {
        txnId,
        otp: body.data.otp,
        actorEmail: auth.user.email,
      },
    )
    await auditStaffMutation(auth.user, {
      action: 'update',
      module: 'invoices',
      targetId: result.transaction.id,
    })
    return apiSuccess({
      transaction: result.transaction,
      invoiceStatus: result.invoiceStatus,
    })
  } catch (err) {
    if (err instanceof PaymentNotFoundError) {
      return apiError(404, 'PAYMENT_NOT_FOUND', 'العملية غير موجودة', 'Payment transaction not found')
    }
    if (err instanceof PaymentStateError) {
      return apiError(409, 'PAYMENT_STATE_INVALID', 'لا يمكن التحقق من هذه العملية في حالتها الحالية', 'This transaction cannot be verified in its current state')
    }
    if (err instanceof PaymentFieldError) {
      return apiError(422, 'PAYMENT_FIELD_INVALID', 'رمز التحقق غير صالح', 'The OTP code is invalid')
    }
    if (err instanceof DpayError) {
      return apiError(
        err.status === 422 ? 422 : 502,
        'GATEWAY_ERROR',
        `تعذر التحقق مع بوابة الدفع: ${err.message}`,
        `Gateway verification failed: ${err.message}`,
      )
    }
    throw err
  }
}
