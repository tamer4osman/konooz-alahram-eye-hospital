import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireModuleAccess } from '@/lib/api/admin-route'
import { auditStaffMutation } from '@/lib/api/audit'
import { syncTransactionFromGateway } from '@/lib/usecases/payments/use-cases'
import {
  prismaPaymentTxnWriter,
  prismaInvoicePaymentReader,
} from '@/lib/adapters/prisma/payment-adapter'
import { prismaInvoiceStatusUpdater } from '@/lib/adapters/prisma/invoice-adapter'
import { getDpayClient } from '@/lib/adapters/dpay/config'
import { DpayError } from '@/lib/adapters/dpay/client'
import { PaymentNotFoundError } from '@/lib/usecases/payments/errors'

export const dynamic = 'force-dynamic'

// Polling fallback: re-reads the session straight from DPay when a webhook
// was missed. Read-only on the gateway, status-advancing on our side.

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ txnId: string }> },
) {
  const auth = await requireModuleAccess('billing', 'write')
  if (!auth.ok) return auth.response

  const { txnId } = await params

  try {
    const result = await syncTransactionFromGateway(
      {
        gateway: getDpayClient(),
        invoiceReader: prismaInvoicePaymentReader,
        txnWriter: prismaPaymentTxnWriter,
        invoiceStatusUpdater: prismaInvoiceStatusUpdater,
      },
      txnId,
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
    if (err instanceof DpayError) {
      return apiError(
        err.status === 404 ? 404 : 502,
        'GATEWAY_ERROR',
        `تعذر الاستعلام من بوابة الدفع: ${err.message}`,
        `Gateway lookup failed: ${err.message}`,
      )
    }
    throw err
  }
}
