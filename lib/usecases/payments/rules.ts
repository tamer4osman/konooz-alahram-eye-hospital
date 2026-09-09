/**
 * Pure payment business rules. No framework, no I/O, no Prisma — the entire
 * module is unit-testable with plain values.
 *
 * Gateway facts verified against the live DPay sandbox (spike 2026-09-08):
 *  - Fee is ADDED on top of the requested amount (total = amount + fee).
 *  - `data` metadata round-trips on webhooks and session GET.
 *  - pay-methods limits (merchant overrides): sadad max 5000, others 60000.
 */

// ---------------------------------------------------------------------------
// Supported methods (v1)
// ---------------------------------------------------------------------------

export type PaymentMethod = 'moamalat' | 'edfali' | 'sadad';

export const PAYMENT_METHODS: Readonly<
  Record<PaymentMethod, { requiredFields: readonly ('customerMobile' | 'birthYear')[] }>
> = {
  moamalat: { requiredFields: [] },
  edfali: { requiredFields: ['customerMobile'] },
  sadad: { requiredFields: ['customerMobile', 'birthYear'] },
};

export const PAYMENT_METHOD_KEYS = Object.keys(PAYMENT_METHODS) as PaymentMethod[];

export function isPaymentMethod(value: string): value is PaymentMethod {
  return Object.prototype.hasOwnProperty.call(PAYMENT_METHODS, value);
}

/** Merchant limits from GET /pay-methods (2026-09-08 spike). */
export const GATEWAY_LIMITS: Readonly<
  Record<PaymentMethod, { minDeposit: number; maxDeposit: number }>
> = {
  moamalat: { minDeposit: 5, maxDeposit: 60_000 },
  edfali: { minDeposit: 5, maxDeposit: 60_000 },
  sadad: { minDeposit: 1, maxDeposit: 5_000 },
};

// ---------------------------------------------------------------------------
// Method field validation
// ---------------------------------------------------------------------------

const LIBYAN_MOBILE_RE = /^09\d{8}$/;
const BIRTH_YEAR_MIN = 1900;

function currentYear(): number {
  return new Date().getFullYear();
}

export type MethodFieldFailureReason =
  | 'unknown_method'
  | 'customerMobile_required'
  | 'customerMobile_invalid'
  | 'birthYear_required'
  | 'birthYear_invalid';

export type ResolveFieldsResult =
  | { ok: true; fields: { customerMobile?: string; birthYear?: string } }
  | { ok: false; reason: MethodFieldFailureReason };

/**
 * Validate and normalize per-method fields. Only allowed fields pass through;
 * anything else sent by a client is dropped, never forwarded to the gateway.
 */
export function resolvePaymentMethodFields(
  method: string,
  input: { customerMobile?: unknown; birthYear?: unknown },
): ResolveFieldsResult {
  if (!isPaymentMethod(method)) {
    return { ok: false, reason: 'unknown_method' };
  }

  const fields: { customerMobile?: string; birthYear?: string } = {};

  if (PAYMENT_METHODS[method].requiredFields.includes('customerMobile')) {
    const mobile =
      typeof input.customerMobile === 'string'
        ? input.customerMobile.trim()
        : '';
    if (mobile.length === 0) {
      return { ok: false, reason: 'customerMobile_required' };
    }
    if (!LIBYAN_MOBILE_RE.test(mobile)) {
      return { ok: false, reason: 'customerMobile_invalid' };
    }
    fields.customerMobile = mobile;
  }

  if (PAYMENT_METHODS[method].requiredFields.includes('birthYear')) {
    const year = typeof input.birthYear === 'string' ? input.birthYear.trim() : '';
    if (year.length === 0) {
      return { ok: false, reason: 'birthYear_required' };
    }
    const yearNum = Number(year);
    if (
      !/^\d{4}$/.test(year) ||
      !Number.isInteger(yearNum) ||
      yearNum < BIRTH_YEAR_MIN ||
      yearNum > currentYear()
    ) {
      return { ok: false, reason: 'birthYear_invalid' };
    }
    fields.birthYear = year;
  }

  return { ok: true, fields };
}

// ---------------------------------------------------------------------------
// Amount validation
// ---------------------------------------------------------------------------

export type AmountFailureReason =
  | 'invalid'
  | 'below_minimum'
  | 'exceeds_outstanding'
  | 'gateway_limit';

export type AmountValidationResult =
  | { ok: true }
  | { ok: false; reason: AmountFailureReason };

const CENT = 100;

function round2(value: number): number {
  return Math.round(value * CENT) / CENT;
}

export interface TxnAmountLike {
  status: string;
  amount: number;
}

/**
 * Validate a collection amount against the invoice's outstanding balance and
 * the gateway's deposit limits. Amounts are compared at 2dp to avoid float
 * drift (Prisma Decimal → number conversions land on exact cents).
 */
export function validatePaymentAmount(params: {
  method: string;
  amount: number;
  invoiceTotal: number;
  paidTxns: TxnAmountLike[];
}): AmountValidationResult {
  const { method, amount, invoiceTotal, paidTxns } = params;

  if (!Number.isFinite(amount) || round2(amount) !== amount || amount <= 0) {
    return { ok: false, reason: 'invalid' };
  }

  if (!isPaymentMethod(method)) {
    return { ok: false, reason: 'gateway_limit' };
  }

  const limits = GATEWAY_LIMITS[method];
  if (amount < limits.minDeposit) return { ok: false, reason: 'below_minimum' };

  const outstanding = computeOutstanding(invoiceTotal, paidTxns);
  if (amount > outstanding) return { ok: false, reason: 'exceeds_outstanding' };

  if (amount > limits.maxDeposit) return { ok: false, reason: 'gateway_limit' };

  return { ok: true };
}

/** Which invoice statuses may receive online collections. */
export function canCollectAgainstInvoice(status: string): boolean {
  return (
    status === 'pending' ||
    status === 'partially_paid' ||
    status === 'pending_insurance' ||
    status === 'pre_auth_approved'
  );
}

// ---------------------------------------------------------------------------
// OTP validation
// ---------------------------------------------------------------------------

export type OtpFailureReason = 'otp_flow' | 'invalid';

export type OtpValidationResult =
  | { ok: true }
  | { ok: false; reason: OtpFailureReason };

/** EDFali docs say 4 digits (sandbox issues 6); Sadad is strictly 6. */
export function validateOtp(method: string, otp: string): OtpValidationResult {
  if (method === 'moamalat') {
    return { ok: false, reason: 'otp_flow' };
  }
  if (!isPaymentMethod(method)) {
    return { ok: false, reason: 'invalid' };
  }
  const pattern = method === 'sadad' ? /^\d{6}$/ : /^\d{4,6}$/;
  if (!pattern.test(otp)) {
    return { ok: false, reason: 'invalid' };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Webhook event mapping
// ---------------------------------------------------------------------------

export type PaymentTxnStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'expired'
  | 'refunded'
  | 'voided'
  | 'cancelled';

const WEBHOOK_EVENT_STATUS: Readonly<Record<string, PaymentTxnStatus>> = {
  'payment.paid': 'paid',
  'payment.failed': 'failed',
  'payment.expired': 'expired',
  'payment.refunded': 'refunded',
  'payment.voided': 'voided',
};

/** Unknown events (webhook.test, future additions) map to null = no change. */
export function mapWebhookEventToStatus(event: string): PaymentTxnStatus | null {
  return WEBHOOK_EVENT_STATUS[event] ?? null;
}

// ---------------------------------------------------------------------------
// Amount-paid / outstanding / invoice status derivation
// ---------------------------------------------------------------------------

/** Collected = sum of `paid` transactions only. Refunds/voids exclude rows. */
export function computeAmountPaid(txns: TxnAmountLike[]): number {
  let sum = 0;
  for (const txn of txns) {
    if (txn.status === 'paid') sum += txn.amount;
  }
  return round2(sum);
}

export function computeOutstanding(
  invoiceTotal: number,
  txns: TxnAmountLike[],
): number {
  return Math.max(0, round2(invoiceTotal - computeAmountPaid(txns)));
}

/**
 * Derive the next invoice status from collected amounts. Returns null when
 * no change should be applied:
 *  - Draft and cancelled invoices are never overridden — those are human
 *    decisions about whether the invoice exists at all.
 *  - Insurance-flow statuses (pending_insurance, pre_auth_approved) only
 *    move FORWARD when money actually arrives — an invoice can't honestly
 *    say "awaiting insurance" once the patient paid it in full.
 *  - `paid` downgrades to `partially_paid` only when a refund reduces
 *    collections below the total; a full refund to zero leaves the invoice
 *    for manual staff review rather than fighting concurrent edits.
 */
export function deriveInvoiceStatusFromPayments(params: {
  currentStatus: string;
  amountPaid: number;
  invoiceTotal: number;
}): InvoiceStatusLite | null {
  const { currentStatus, amountPaid, invoiceTotal } = params;

  const advanceable =
    currentStatus === 'pending' ||
    currentStatus === 'partially_paid' ||
    currentStatus === 'pending_insurance' ||
    currentStatus === 'pre_auth_approved';

  if (advanceable) {
    if (amountPaid >= invoiceTotal && invoiceTotal > 0) return 'paid';
    if (amountPaid > 0) return 'partially_paid';
    return null;
  }

  if (currentStatus === 'paid') {
    if (amountPaid >= invoiceTotal && invoiceTotal > 0) {
      // Already settled — return the same status so derivation is a pure
      // idempotent function of (status, collected), not of delivery count.
      return 'paid';
    }
    // Refund reduced collections below the total (and above zero).
    if (amountPaid > 0) return 'partially_paid';
    return null;
  }

  return null;
}

/** Local minimal status literal to avoid importing Prisma types here. */
export type InvoiceStatusLite =
  | 'pending'
  | 'paid'
  | 'partially_paid'
  | 'cancelled'
  | 'pending_insurance'
  | 'pre_auth_approved'
  | 'draft';
