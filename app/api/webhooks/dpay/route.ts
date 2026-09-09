import { NextRequest, NextResponse } from 'next/server'
import { verifyDpaySignature } from '@/lib/security/dpay-signature'
import { handleWebhookEvent, type WebhookPayload } from '@/lib/usecases/payments/use-cases'
import {
  prismaPaymentTxnWriter,
  prismaInvoicePaymentReader,
} from '@/lib/adapters/prisma/payment-adapter'
import { prismaInvoiceStatusUpdater } from '@/lib/adapters/prisma/invoice-adapter'
import { getDpayWebhookSecret } from '@/lib/adapters/dpay/config'

export const dynamic = 'force-dynamic'

// DPay merchant webhook receiver. Security posture:
//  1. HMAC-SHA256 signature over timestamp + raw body, constant-time compare,
//     5-minute replay window (lib/security/dpay-signature.ts).
//  2. No session auth — DPay servers cannot hold one. The signature IS the auth.
//  3. Idempotent per (session_id + event): duplicate deliveries are no-ops.
//  4. Unknown sessions/events are acknowledged 2xx — DPay retries non-2xx for
//     up to 5 attempts, and we never want a retry storm over noise.
//  5. Any internal failure still 500s so DPay retries (delivery guarantee).
//  6. No secrets or PII in logs; only session_id + event name.

function deny(status: number, event: string): NextResponse {
  console.warn(`[dpay-webhook] rejected: ${event || 'unknown'} (${status})`)
  return NextResponse.json({ received: false }, { status })
}

export async function POST(req: NextRequest) {
  let secret: string
  try {
    secret = getDpayWebhookSecret()
  } catch {
    console.error('[dpay-webhook] DPAY_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ received: false }, { status: 503 })
  }

  const timestamp = req.headers.get('x-dpay-timestamp')
  const signature = req.headers.get('x-dpay-signature')
  const rawBody = await req.text()

  // Enforce a raw-body ceiling before parsing — a hostile oversized payload
  // must never reach JSON.parse or the DB layer.
  if (rawBody.length > 64 * 1024) {
    return deny(413, 'oversized')
  }

  const verification = verifyDpaySignature({
    timestamp,
    signature,
    rawBody,
    secret,
  })
  if (!verification.valid) {
    return deny(401, `signature:${verification.reason}`)
  }

  let payload: WebhookPayload
  try {
    const parsed: unknown = JSON.parse(rawBody)
    if (typeof parsed !== 'object' || parsed === null) throw new Error('not an object')
    const p = parsed as Record<string, unknown>
    if (typeof p.event !== 'string' || typeof p.session_id !== 'number') {
      throw new Error('missing required fields')
    }
    payload = p as unknown as WebhookPayload
  } catch {
    return deny(400, 'malformed_json')
  }

  try {
    const outcome = await handleWebhookEvent(
      {
        invoiceReader: prismaInvoicePaymentReader,
        txnWriter: prismaPaymentTxnWriter,
        invoiceStatusUpdater: prismaInvoiceStatusUpdater,
      },
      payload,
    )
    if (!outcome.applied) {
      console.info(
        `[dpay-webhook] no-op: session ${payload.session_id} ${payload.event} (${outcome.reason})`,
      )
    }
    return NextResponse.json({ received: true })
  } catch (err) {
    // Let DPay retry — a transient DB hiccup must not silently drop a payment.
    console.error(
      `[dpay-webhook] handler failed: session ${payload.session_id} ${payload.event}`,
      err,
    )
    return NextResponse.json({ received: false }, { status: 500 })
  }
}
