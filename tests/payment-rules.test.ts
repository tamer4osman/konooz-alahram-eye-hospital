import { describe, it, expect } from 'vitest';
import {
  PAYMENT_METHODS,
  GATEWAY_LIMITS,
  resolvePaymentMethodFields,
  validatePaymentAmount,
  validateOtp,
  mapWebhookEventToStatus,
  computeAmountPaid,
  computeOutstanding,
  deriveInvoiceStatusFromPayments,
  canCollectAgainstInvoice,
} from '@/lib/usecases/payments/rules';

describe('PAYMENT_METHODS + GATEWAY_LIMITS', () => {
  it('exposes exactly the three v1 gateways with their required fields', () => {
    expect(Object.keys(PAYMENT_METHODS).sort()).toEqual([
      'edfali',
      'moamalat',
      'sadad',
    ]);
    expect(PAYMENT_METHODS.moamalat.requiredFields).toEqual([]);
    expect(PAYMENT_METHODS.edfali.requiredFields).toEqual(['customerMobile']);
    expect(PAYMENT_METHODS.sadad.requiredFields).toEqual([
      'customerMobile',
      'birthYear',
    ]);
  });

  it('uses the merchant limits observed in the live pay-methods response', () => {
    // Spike 2026-09-08: sadad max 5000, others 60000 (merchant overrides).
    expect(GATEWAY_LIMITS.sadad.maxDeposit).toBe(5000);
    expect(GATEWAY_LIMITS.moamalat.maxDeposit).toBe(60000);
    expect(GATEWAY_LIMITS.edfali.maxDeposit).toBe(60000);
    expect(GATEWAY_LIMITS.sadad.minDeposit).toBe(1);
  });
});

describe('resolvePaymentMethodFields', () => {
  it('accepts moamalat with no extra fields', () => {
    expect(resolvePaymentMethodFields('moamalat', {})).toEqual({
      ok: true,
      fields: {},
    });
  });

  it('accepts a valid EDFali mobile (Libyan 09XXXXXXXX)', () => {
    expect(
      resolvePaymentMethodFields('edfali', { customerMobile: '0912345678' }),
    ).toEqual({ ok: true, fields: { customerMobile: '0912345678' } });
  });

  it('accepts a valid Sadad mobile + birth year', () => {
    expect(
      resolvePaymentMethodFields('sadad', {
        customerMobile: '0912345678',
        birthYear: '1994',
      }),
    ).toEqual({
      ok: true,
      fields: { customerMobile: '0912345678', birthYear: '1994' },
    });
  });

  it('trims whitespace around inputs', () => {
    expect(
      resolvePaymentMethodFields('edfali', { customerMobile: ' 0912345678 ' }),
    ).toEqual({ ok: true, fields: { customerMobile: '0912345678' } });
  });

  // ── Worst-case scenarios ────────────────────────────────────────────────

  it('rejects an unknown pay method (gateway drift)', () => {
    const result = resolvePaymentMethodFields('mpgs', {});
    expect(result.ok).toBe(false);
  });

  it('rejects a missing EDFali mobile', () => {
    const result = resolvePaymentMethodFields('edfali', {});
    expect(result).toEqual({ ok: false, reason: 'customerMobile_required' });
  });

  it('rejects a malformed mobile (wrong prefix, too short, letters)', () => {
    for (const bad of ['1234567890', '09123456', '09123456789', '09abc45678', '']) {
      expect(
        resolvePaymentMethodFields('edfali', { customerMobile: bad }).ok,
      ).toBe(false);
    }
  });

  it('rejects Sadad without birth year', () => {
    const result = resolvePaymentMethodFields('sadad', {
      customerMobile: '0912345678',
    });
    expect(result).toEqual({ ok: false, reason: 'birthYear_required' });
  });

  it('rejects an implausible birth year (too old, in the future, non-numeric)', () => {
    for (const bad of ['1850', String(new Date().getFullYear() + 1), '19ab', '94']) {
      expect(
        resolvePaymentMethodFields('sadad', {
          customerMobile: '0912345678',
          birthYear: bad,
        }).ok,
      ).toBe(false);
    }
  });
});

describe('validatePaymentAmount', () => {
  const makePaid = (amount: number) => [
    { status: 'paid' as const, amount },
  ];

  it('accepts an amount within outstanding and gateway limits', () => {
    const result = validatePaymentAmount({
      method: 'moamalat',
      amount: 500,
      invoiceTotal: 1000,
      paidTxns: [],
    });
    expect(result.ok).toBe(true);
  });

  it('accepts collecting exactly the outstanding remainder', () => {
    const result = validatePaymentAmount({
      method: 'edfali',
      amount: 400,
      invoiceTotal: 1000,
      paidTxns: makePaid(600),
    });
    expect(result.ok).toBe(true);
  });

  // ── Worst-case scenarios ────────────────────────────────────────────────

  it('rejects zero and negative amounts', () => {
    for (const amount of [0, -1, -100.5]) {
      expect(
        validatePaymentAmount({
          method: 'moamalat',
          amount,
          invoiceTotal: 1000,
          paidTxns: [],
        }).ok,
      ).toBe(false);
    }
  });

  it('rejects sub-cent dust amounts', () => {
    expect(
      validatePaymentAmount({
        method: 'moamalat',
        amount: 0.001,
        invoiceTotal: 1000,
        paidTxns: [],
      }).ok,
    ).toBe(false);
  });

  it('rejects overpayment beyond the outstanding amount', () => {
    const result = validatePaymentAmount({
      method: 'moamalat',
      amount: 600,
      invoiceTotal: 1000,
      paidTxns: makePaid(600),
    });
    expect(result).toEqual({ ok: false, reason: 'exceeds_outstanding' });
  });

  it('rejects amounts above the gateway max deposit (sadad 5000)', () => {
    const result = validatePaymentAmount({
      method: 'sadad',
      amount: 5000.01,
      invoiceTotal: 10000,
      paidTxns: [],
    });
    expect(result).toEqual({ ok: false, reason: 'gateway_limit' });
  });

  it('rejects amounts below the gateway min deposit (sadad 1)', () => {
    expect(
      validatePaymentAmount({
        method: 'sadad',
        amount: 0.5,
        invoiceTotal: 1000,
        paidTxns: [],
      }).ok,
    ).toBe(false);
  });

  it('rejects collection against a draft or cancelled invoice', () => {
    expect(
      canCollectAgainstInvoice('draft'),
      'draft must not be collectible',
    ).toBe(false);
    expect(
      canCollectAgainstInvoice('cancelled'),
      'cancelled must not be collectible',
    ).toBe(false);
  });

  it('allows collection against outstanding statuses', () => {
    for (const status of [
      'pending',
      'partially_paid',
      'pending_insurance',
      'pre_auth_approved',
    ] as const) {
      expect(canCollectAgainstInvoice(status)).toBe(true);
    }
  });

  it('handles float drift: 0.1 + 0.2 style sums still validate exactly', () => {
    // 300.10 + 299.95 = 600.05 collected of 1000 → outstanding 399.95.
    const result = validatePaymentAmount({
      method: 'edfali',
      amount: 399.95,
      invoiceTotal: 1000,
      paidTxns: [
        { status: 'paid' as const, amount: 300.1 },
        { status: 'paid' as const, amount: 299.95 },
      ],
    });
    expect(result.ok).toBe(true);
  });
});

describe('validateOtp', () => {
  it('accepts EDFali OTP of 4-6 digits (docs say 4, sandbox issues 6)', () => {
    for (const otp of ['1234', '111111']) {
      expect(validateOtp('edfali', otp).ok).toBe(true);
    }
  });

  it('accepts a Sadad 6-digit OTP and rejects other lengths', () => {
    expect(validateOtp('sadad', '985436').ok).toBe(true);
    expect(validateOtp('sadad', '12345').ok).toBe(false);
    expect(validateOtp('sadad', '1234567').ok).toBe(false);
  });

  // ── Worst-case scenarios ────────────────────────────────────────────────

  it('rejects non-numeric, empty, and whitespace-padded OTPs', () => {
    for (const otp of ['', '  ', '12 45', 'abc123', '١٢٣٤']) {
      expect(validateOtp('edfali', otp).ok).toBe(false);
    }
  });

  it('rejects OTPs beyond 6 digits (buffer-overflow style junk)', () => {
    expect(validateOtp('edfali', '1'.repeat(100)).ok).toBe(false);
  });

  it('rejects an OTP for a method with no OTP flow (moamalat)', () => {
    expect(validateOtp('moamalat', '111111').ok).toBe(false);
  });
});

describe('mapWebhookEventToStatus', () => {
  it('maps the five terminal DPay events to transaction statuses', () => {
    expect(mapWebhookEventToStatus('payment.paid')).toBe('paid');
    expect(mapWebhookEventToStatus('payment.failed')).toBe('failed');
    expect(mapWebhookEventToStatus('payment.expired')).toBe('expired');
    expect(mapWebhookEventToStatus('payment.refunded')).toBe('refunded');
    expect(mapWebhookEventToStatus('payment.voided')).toBe('voided');
  });

  // ── Worst-case scenarios ────────────────────────────────────────────────

  it('returns null (no state change) for webhook.test and unknown events', () => {
    expect(mapWebhookEventToStatus('webhook.test')).toBeNull();
    expect(mapWebhookEventToStatus('payment.hacked')).toBeNull();
    expect(mapWebhookEventToStatus('')).toBeNull();
  });
});

describe('computeAmountPaid / computeOutstanding', () => {
  it('sums only paid transactions', () => {
    expect(
      computeAmountPaid([
        { status: 'paid', amount: 100 },
        { status: 'pending', amount: 50 },
        { status: 'failed', amount: 75 },
      ]),
    ).toBe(100);
  });

  it('excludes refunded and voided rows from collected amounts', () => {
    // Row model: one row per DPay session with a mutable status. A refunded
    // session no longer counts; an independent still-paid session does.
    expect(
      computeAmountPaid([
        { status: 'paid', amount: 100 },
        { status: 'refunded', amount: 100 },
        { status: 'voided', amount: 40 },
      ]),
    ).toBe(100);
    expect(computeAmountPaid([{ status: 'refunded', amount: 100 }])).toBe(0);
    expect(computeAmountPaid([{ status: 'voided', amount: 40 }])).toBe(0);
  });

  it('handles float drift with 2dp rounding', () => {
    expect(
      computeAmountPaid([
        { status: 'paid', amount: 0.1 },
        { status: 'paid', amount: 0.2 },
      ]),
    ).toBe(0.3);
  });

  it('outstanding never goes negative even with gateway-reported overpay', () => {
    expect(
      computeOutstanding(100, [{ status: 'paid', amount: 120 }]),
    ).toBe(0);
  });

  it('returns the full amount for an invoice with no transactions', () => {
    expect(computeOutstanding(1000, [])).toBe(1000);
  });
});

describe('deriveInvoiceStatusFromPayments', () => {
  it('advances pending → paid when fully collected', () => {
    expect(
      deriveInvoiceStatusFromPayments({
        currentStatus: 'pending',
        amountPaid: 1000,
        invoiceTotal: 1000,
      }),
    ).toBe('paid');
  });

  it('advances pending → partially_paid on a partial collection', () => {
    expect(
      deriveInvoiceStatusFromPayments({
        currentStatus: 'pending',
        amountPaid: 400,
        invoiceTotal: 1000,
      }),
    ).toBe('partially_paid');
  });

  it('advances partially_paid → paid on the final collection', () => {
    expect(
      deriveInvoiceStatusFromPayments({
        currentStatus: 'partially_paid',
        amountPaid: 1000,
        invoiceTotal: 1000,
      }),
    ).toBe('paid');
  });

  it('returns null (no change) when nothing has been collected yet', () => {
    expect(
      deriveInvoiceStatusFromPayments({
        currentStatus: 'pending',
        amountPaid: 0,
        invoiceTotal: 1000,
      }),
    ).toBeNull();
  });

  // ── Worst-case scenarios ────────────────────────────────────────────────

  it('advances insurance-flow statuses when money actually arrives (live E2E bug)', () => {
    // Live check 2026-09-09: an invoice collected in full while in
    // pre_auth_approved stayed pre_auth_approved — dishonest. Insurance-flow
    // statuses may only move FORWARD (never backward) on real collections.
    expect(
      deriveInvoiceStatusFromPayments({
        currentStatus: 'pre_auth_approved',
        amountPaid: 1000,
        invoiceTotal: 1000,
      }),
    ).toBe('paid');
    expect(
      deriveInvoiceStatusFromPayments({
        currentStatus: 'pending_insurance',
        amountPaid: 1000,
        invoiceTotal: 1000,
      }),
    ).toBe('paid');
  });

  it('never overrides draft or cancelled invoices', () => {
    for (const status of ['draft', 'cancelled'] as const) {
      expect(
        deriveInvoiceStatusFromPayments({
          currentStatus: status,
          amountPaid: 1000,
          invoiceTotal: 1000,
        }),
      ).toBeNull();
    }
  });

  it('downgrades paid → partially_paid when a refund reduces collections', () => {
    // Money went back to the patient — the invoice is honestly not fully paid.
    expect(
      deriveInvoiceStatusFromPayments({
        currentStatus: 'paid',
        amountPaid: 400,
        invoiceTotal: 1000,
      }),
    ).toBe('partially_paid');
  });

  it('keeps status on a full refund (staff reviews the zero-collected invoice)', () => {
    // Fully refunded: collected is zero; auto-downgrading 'paid' → 'pending'
    // would fight possible concurrent manual edits. Staff sees collected=0 in
    // the transactions list and resolves manually.
    expect(
      deriveInvoiceStatusFromPayments({
        currentStatus: 'paid',
        amountPaid: 0,
        invoiceTotal: 1000,
      }),
    ).toBeNull();
  });

  it('is stable under repeated webhook delivery (idempotent derivation)', () => {
    const once = deriveInvoiceStatusFromPayments({
      currentStatus: 'pending',
      amountPaid: 1000,
      invoiceTotal: 1000,
    });
    const twice = deriveInvoiceStatusFromPayments({
      currentStatus: once ?? 'pending',
      amountPaid: 1000,
      invoiceTotal: 1000,
    });
    expect(twice).toBe('paid');
  });
});
