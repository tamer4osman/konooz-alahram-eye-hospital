import { NextRequest } from 'next/server'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireModuleAccess } from '@/lib/api/admin-route'
import { auditStaffMutation } from '@/lib/api/audit'
import { cancelTransaction } from '@/lib/usecases/payments/use-cases'
import { prismaPaymentTxnWriter } from '@/lib/adapters/prisma/payment-adapter'
import { PaymentNotFoundError, PaymentStateError } from '@/lib/usecases/payments/errors'

export const dynamic = 'force-dynamic'

// Staff abandons a pending collection attempt. No gateway call — DPay
// sessions expire on their own; cancelling only closes our book on it.

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ txnId: string }> },
) {
  const auth = await requireModuleAccess('billing', 'write')
  if (!auth.ok) return auth.response

  const { txnId } = await params

  try {
    const transaction = await cancelTransaction(
      { txnWriter: prismaPaymentTxnWriter },
      txnId,
    )
    await auditStaffMutation(auth.user, {
      action: 'update',
      module: 'invoices',
      targetId: transaction.id,
    })
    return apiSuccess({ transaction })
  } catch (err) {
    if (err instanceof PaymentNotFoundError) {
      return apiError(404, 'PAYMENT_NOT_FOUND', 'العملية غير موجودة', 'Payment transaction not found')
    }
    if (err instanceof PaymentStateError) {
      return apiError(409, 'PAYMENT_STATE_INVALID', 'لا يمكن إلغاء عملية مكتملة', 'A completed payment cannot be cancelled')
    }
    throw err
  }
}
