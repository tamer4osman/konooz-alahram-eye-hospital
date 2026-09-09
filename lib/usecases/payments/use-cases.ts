import type { PaymentDeps, PaymentTxnRecord } from './ports';
import {
  canCollectAgainstInvoice,
  computeAmountPaid,
  computeOutstanding,
  deriveInvoiceStatusFromPayments,
  isPaymentMethod,
  mapWebhookEventToStatus,
  validateOtp,
  validatePaymentAmount,
  resolvePaymentMethodFields,
  type PaymentTxnStatus,
} from './rules';
import {
  PaymentAmountError,
  PaymentCollectionNotAllowedError,
  PaymentFieldError,
  PaymentNotFoundError,
  PaymentStateError,
} from './errors';

// Use cases: orchestration only. Ports are injected as first arguments;
// rules.ts owns every decision. Gateway failures (DpayError) propagate
// unchanged — the route handler maps them onto bilingual HTTP responses.

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Re-collect paid totals with one freshly-updated row swapped in. */
function paidTotalWith(
  all: PaymentTxnRecord[],
  updated: PaymentTxnRecord,
): number {
  return computeAmountPaid([
    ...all.filter((t) => t.id !== updated.id),
    updated,
  ]);
}

/** Deps needed to push a derived invoice status change. */
type InvoiceAdvanceDeps = Pick<
  PaymentDeps,
  'invoiceReader' | 'invoiceStatusUpdater'
>;

/** Push the derived invoice status when the rule says it moved. */
async function advanceInvoice(
  deps: InvoiceAdvanceDeps,
  txn: PaymentTxnRecord,
  all: PaymentTxnRecord[],
): Promise<string | null> {
  const invoice = await deps.invoiceReader.getForPayment(txn.invoiceId);
  if (!invoice) return null;

  const amountPaid = paidTotalWith(all, txn);
  const next = deriveInvoiceStatusFromPayments({
    currentStatus: invoice.status,
    amountPaid,
    invoiceTotal: invoice.amount,
  });
  if (!next) return null;

  await deps.invoiceStatusUpdater.updateStatus(invoice.id, {
    status: next,
    paidDate: next === 'paid' ? new Date() : null,
  });
  return next;
}

// ---------------------------------------------------------------------------
// Open a payment session (staff-initiated collection)
// ---------------------------------------------------------------------------

export interface OpenPaymentSessionInput {
  invoiceId: string;
  method: string;
  amount: number;
  fields: { customerMobile?: unknown; birthYear?: unknown };
  actorEmail: string;
}

export interface OpenPaymentSessionResult {
  transaction: PaymentTxnRecord;
  /** Moamalat only — hosted LightBox URL for the patient. */
  paymentLink: string | null;
  /** Gateway total including the added fee — what the patient actually pays. */
  gatewayTotal: number;
}

export async function openPaymentSession(
  deps: PaymentDeps,
  input: OpenPaymentSessionInput,
): Promise<OpenPaymentSessionResult> {
  const invoice = await deps.invoiceReader.getForPayment(input.invoiceId);
  if (!invoice) throw new PaymentNotFoundError('Invoice not found');

  if (!canCollectAgainstInvoice(invoice.status)) {
    throw new PaymentCollectionNotAllowedError();
  }

  if (!isPaymentMethod(input.method)) {
    throw new PaymentFieldError('unknown_method');
  }

  const fields = resolvePaymentMethodFields(input.method, input.fields);
  if (!fields.ok) throw new PaymentFieldError(fields.reason);

  const existing = await deps.txnWriter.listByInvoiceId(invoice.id);
  const amount = validatePaymentAmount({
    method: input.method,
    amount: input.amount,
    invoiceTotal: invoice.amount,
    paidTxns: existing.map((t) => ({ status: t.status, amount: t.amount })),
  });
  if (!amount.ok) throw new PaymentAmountError(amount.reason);

  const session = await deps.gateway.openSession({
    payMethod: input.method,
    amount: input.amount,
    customerMobile: fields.fields.customerMobile,
    birthYear: fields.fields.birthYear,
    data: { konoozInvoiceNumber: invoice.invoiceNumber },
  });

  const transaction = await deps.txnWriter.create({
    invoiceId: invoice.id,
    dpaySessionId: session.sessionId,
    payMethod: session.payMethod,
    status: 'pending',
    amount: round2(input.amount),
    currency: invoice.currency ?? 'LYD',
    txId: null,
    receiptUrl: null,
    payerAccount: null,
    failureReason: null,
    confirmedBy: null,
    lastWebhookEvent: null,
    lastWebhookAt: null,
    lastPollAt: null,
  });

  return {
    transaction,
    paymentLink: session.paymentLink,
    gatewayTotal: session.total,
  };
}

// ---------------------------------------------------------------------------
// Verify an OTP-based payment (EDFali / Sadad — reception-assisted flow)
// ---------------------------------------------------------------------------

export interface VerifyPaymentOtpInput {
  txnId: string;
  otp: string;
  actorEmail: string;
}

export interface VerifyPaymentOtpResult {
  transaction: PaymentTxnRecord;
  /** Invoice status change applied, or null when none. */
  invoiceStatus: string | null;
}

export async function verifyPaymentOtp(
  deps: PaymentDeps,
  input: VerifyPaymentOtpInput,
): Promise<VerifyPaymentOtpResult> {
  const txn = await deps.txnWriter.findById(input.txnId);
  if (!txn) throw new PaymentNotFoundError();

  // Idempotent: re-submitting a settled transaction is a no-op, not an error.
  if (txn.status === 'paid') {
    return { transaction: txn, invoiceStatus: null };
  }
  if (txn.status !== 'pending') {
    throw new PaymentStateError();
  }

  const otp = validateOtp(txn.payMethod, input.otp);
  if (!otp.ok) throw new PaymentFieldError(otp.reason);

  const verified = await deps.gateway.verifyOtp(txn.dpaySessionId, input.otp);

  const updated = await deps.txnWriter.updateStatus(txn.id, {
    status: 'paid',
    txId: verified.txId,
    receiptUrl: verified.receiptUrl,
    confirmedBy: input.actorEmail,
  });

  const all = await deps.txnWriter.listByInvoiceId(txn.invoiceId);
  const invoiceStatus = await advanceInvoice(deps, updated, all);

  return { transaction: updated, invoiceStatus };
}

// ---------------------------------------------------------------------------
// Webhook handling (idempotent on session_id + event)
// ---------------------------------------------------------------------------

export interface WebhookPayload {
  event: string;
  session_id: number;
  status?: string;
  amount?: number;
  pay_method?: string;
  tx_id?: string | null;
  receipt_url?: string | null;
  paid_through?: string | null;
  payer_account?: string | null;
  data?: unknown;
}

export type WebhookOutcome =
  | { applied: true; transaction: PaymentTxnRecord; invoiceStatus: string | null }
  | { applied: false; reason: 'ignored_event' | 'unknown_session' | 'already_applied' };

export interface WebhookDeps
  extends Pick<PaymentDeps, 'invoiceReader' | 'txnWriter' | 'invoiceStatusUpdater'> {}

export async function handleWebhookEvent(
  deps: WebhookDeps,
  payload: WebhookPayload,
): Promise<WebhookOutcome> {
  const nextStatus = mapWebhookEventToStatus(payload.event);
  if (!nextStatus) {
    return { applied: false, reason: 'ignored_event' };
  }

  const txn = await deps.txnWriter.findBySessionId(payload.session_id);
  if (!txn) {
    // Unknown sessions are acknowledged, not failed — DPay retries on non-2xx
    // and we never want a webhook storm over an unrelated session id.
    return { applied: false, reason: 'unknown_session' };
  }

  if (txn.status === nextStatus) {
    return { applied: false, reason: 'already_applied' };
  }

  const updated = await deps.txnWriter.updateStatus(txn.id, {
    status: nextStatus,
    txId: payload.tx_id ?? txn.txId,
    receiptUrl: payload.receipt_url ?? txn.receiptUrl,
    payerAccount: payload.payer_account ?? txn.payerAccount,
    failureReason: nextStatus === 'failed' ? payload.event : txn.failureReason,
    lastWebhookEvent: payload.event,
    lastWebhookAt: new Date(),
  });

  const all = await deps.txnWriter.listByInvoiceId(txn.invoiceId);
  const invoiceStatus = await advanceInvoice(deps, updated, all);

  return { applied: true, transaction: updated, invoiceStatus };
}

// ---------------------------------------------------------------------------
// Gateway sync (polling fallback for missed webhooks)
// ---------------------------------------------------------------------------

const GATEWAY_STATUS_MAP: Readonly<Record<string, PaymentTxnStatus>> = {
  paid: 'paid',
  failed: 'failed',
  expired: 'expired',
};

export interface SyncResult {
  transaction: PaymentTxnRecord;
  invoiceStatus: string | null;
}

export async function syncTransactionFromGateway(
  deps: PaymentDeps,
  txnId: string,
): Promise<SyncResult> {
  const txn = await deps.txnWriter.findById(txnId);
  if (!txn) throw new PaymentNotFoundError();

  // Terminal states are settled facts; polling cannot improve on them.
  if (txn.status !== 'pending') {
    return { transaction: txn, invoiceStatus: null };
  }

  const session = await deps.gateway.getSession(txn.dpaySessionId);
  const mapped = GATEWAY_STATUS_MAP[session.status];

  const updated =
    mapped && mapped !== txn.status
      ? await deps.txnWriter.updateStatus(txn.id, {
          status: mapped,
          txId: session.txId ?? txn.txId,
          lastPollAt: new Date(),
        })
      : await deps.txnWriter.updateStatus(txn.id, { lastPollAt: new Date() });

  if (!mapped || mapped === 'pending') {
    return { transaction: updated, invoiceStatus: null };
  }

  const all = await deps.txnWriter.listByInvoiceId(txn.invoiceId);
  const invoiceStatus = await advanceInvoice(deps, updated, all);
  return { transaction: updated, invoiceStatus };
}

// ---------------------------------------------------------------------------
// Cancel (staff abandons a collection attempt)
// ---------------------------------------------------------------------------

export async function cancelTransaction(
  deps: Pick<PaymentDeps, 'txnWriter'>,
  txnId: string,
): Promise<PaymentTxnRecord> {
  const txn = await deps.txnWriter.findById(txnId);
  if (!txn) throw new PaymentNotFoundError();

  if (txn.status !== 'pending') {
    throw new PaymentStateError();
  }

  return deps.txnWriter.updateStatus(txn.id, { status: 'cancelled' });
}

// ---------------------------------------------------------------------------
// Listing + summary
// ---------------------------------------------------------------------------

export interface InvoicePaymentsSummary {
  transactions: PaymentTxnRecord[];
  amountPaid: number;
  outstanding: number;
}

export async function listTransactionsForInvoice(
  deps: Pick<PaymentDeps, 'txnWriter' | 'invoiceReader'>,
  invoiceId: string,
): Promise<InvoicePaymentsSummary> {
  const transactions = await deps.txnWriter.listByInvoiceId(invoiceId);
  const amountPaid = computeAmountPaid(
    transactions.map((t) => ({ status: t.status, amount: t.amount })),
  );
  const invoice = await deps.invoiceReader.getForPayment(invoiceId);
  const outstanding = invoice
    ? computeOutstanding(
        invoice.amount,
        transactions.map((t) => ({ status: t.status, amount: t.amount })),
      )
    : amountPaid;
  return { transactions, amountPaid, outstanding };
}
