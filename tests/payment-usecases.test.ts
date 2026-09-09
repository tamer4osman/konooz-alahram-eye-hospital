import { describe, it, expect, vi } from 'vitest';
import {
  openPaymentSession,
  verifyPaymentOtp,
  handleWebhookEvent,
  syncTransactionFromGateway,
  cancelTransaction,
  listTransactionsForInvoice,
} from '@/lib/usecases/payments/use-cases';
import {
  PaymentNotFoundError,
  PaymentStateError,
  PaymentFieldError,
  PaymentAmountError,
  PaymentCollectionNotAllowedError,
} from '@/lib/usecases/payments/errors';
import { DpayError } from '@/lib/adapters/dpay/client';
import type { DpayGateway } from '@/lib/usecases/payments/ports';
import type { PaymentTxnRecord } from '@/lib/usecases/payments/ports';
import type { InvoicePaymentReader } from '@/lib/usecases/payments/ports';
import type { InvoiceStatusUpdaterPort } from '@/lib/usecases/payments/ports';
import type { HospitalBillingInvoice as InvoiceDTO } from '@/data/dashboardData';

// ---------------------------------------------------------------------------
// Stub ports — no Prisma, no module mocks.
// ---------------------------------------------------------------------------

const NOW = new Date('2026-09-09T01:00:00.000Z');

let txnSeq = 0;

function makeTxn(overrides: Partial<PaymentTxnRecord> = {}): PaymentTxnRecord {
  txnSeq += 1;
  return {
    id: `txn-${txnSeq}`,
    invoiceId: 'inv-1',
    dpaySessionId: 1000 + txnSeq,
    payMethod: 'edfali',
    status: 'pending',
    amount: 100,
    currency: 'LYD',
    txId: null,
    receiptUrl: null,
    payerAccount: null,
    failureReason: null,
    confirmedBy: null,
    lastWebhookEvent: null,
    lastWebhookAt: null,
    lastPollAt: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
  };
}

const INVOICE: { id: string; amount: number; status: string; invoiceNumber: string; currency: string } = {
  id: 'inv-1',
  amount: 1000,
  status: 'pending',
  invoiceNumber: 'INV-1000',
  currency: 'LYD',
};

function makeGateway(overrides: Partial<DpayGateway> = {}): DpayGateway {
  return {
    openSession: vi.fn().mockResolvedValue({
      sessionId: 4242,
      status: 'pending',
      amount: 100,
      total: 100.2,
      payMethod: 'edfali',
      expiredAt: '2026-09-09T01:15:00.000000Z',
      paymentLink: null,
      data: { konoozInvoiceNumber: 'INV-1000' },
    }),
    verifyOtp: vi.fn().mockResolvedValue({
      status: 'paid',
      paymentId: 837,
      txId: 'sb_txn_ok',
      receiptUrl: 'https://dpay.ly/receipt/4242/x',
    }),
    getSession: vi.fn().mockResolvedValue({
      sessionId: 4242,
      status: 'paid',
      amount: 100,
      payMethod: 'edfali',
      txId: 'sb_txn_ok',
      expiredAt: null,
      data: {},
    }),
    ...overrides,
  };
}

interface DepsOverrides {
  gateway?: Partial<DpayGateway>;
  invoice?: Partial<typeof INVOICE> | null;
  txns?: PaymentTxnRecord[];
}

function makeDeps(overrides: DepsOverrides = {}) {
  const invoice = overrides.invoice === null ? null : { ...INVOICE, ...overrides.invoice };
  const txns = overrides.txns ?? [];

  const invoiceReader: InvoicePaymentReader = {
    getForPayment: vi.fn().mockResolvedValue(invoice),
  };

  const txnWriter = {
    create: vi
      .fn()
      .mockImplementation(async (input: Omit<PaymentTxnRecord, 'id' | 'createdAt' | 'updatedAt'>) =>
        makeTxn({ ...input }),
      ),
    updateStatus: vi
      .fn()
      .mockImplementation(async (id: string, patch: Partial<PaymentTxnRecord>) => {
        const existing = txns.find((t) => t.id === id) ?? makeTxn();
        return { ...existing, ...patch, updatedAt: NOW };
      }),
    findBySessionId: vi
      .fn()
      .mockImplementation(async (sessionId: number) =>
        txns.find((t) => t.dpaySessionId === sessionId) ?? null,
      ),
    findById: vi
      .fn()
      .mockImplementation(async (id: string) => txns.find((t) => t.id === id) ?? null),
    listByInvoiceId: vi.fn().mockResolvedValue(txns),
  };

  const statusUpdates: Array<{ status?: string; paidDate?: Date | null }> = [];
  const invoiceStatusUpdater: InvoiceStatusUpdaterPort = {
    updateStatus: vi.fn().mockImplementation(async (_id: string, patch: { status?: string; paidDate?: Date | null }) => {
      statusUpdates.push(patch);
      return {} as InvoiceDTO;
    }),
  };

  return {
    gateway: makeGateway(overrides.gateway) as DpayGateway,
    invoiceReader,
    txnWriter,
    invoiceStatusUpdater,
    statusUpdates,
    txns,
  };
}

const ACTOR = 'staff@konooz.test';

// ---------------------------------------------------------------------------
// openPaymentSession
// ---------------------------------------------------------------------------

describe('openPaymentSession', () => {
  const input = {
    invoiceId: 'inv-1',
    method: 'edfali' as const,
    amount: 100,
    actorEmail: ACTOR,
  };

  it('creates a pending transaction with gateway session id and invoice metadata', async () => {
    const deps = makeDeps();

    const result = await openPaymentSession(deps, {
      ...input,
      fields: { customerMobile: '0912345678' },
    });

    expect(deps.gateway.openSession).toHaveBeenCalledWith(
      expect.objectContaining({
        payMethod: 'edfali',
        amount: 100,
        customerMobile: '0912345678',
        data: { konoozInvoiceNumber: 'INV-1000' },
      }),
    );
    expect(result.transaction.status).toBe('pending');
    expect(result.transaction.dpaySessionId).toBe(4242);
    expect(result.paymentLink).toBeNull();
    expect(result.gatewayTotal).toBe(100.2);
  });

  it('surfaces the Moamalat hosted payment link', async () => {
    const deps = makeDeps({
      gateway: {
        openSession: vi.fn().mockResolvedValue({
          sessionId: 5001,
          status: 'pending',
          amount: 200,
          total: 200.4,
          payMethod: 'moamalat',
          expiredAt: null,
          paymentLink: 'https://dpay.ly/sandbox/moamalat-pay/5001/abc',
          data: { konoozInvoiceNumber: 'INV-1000' },
        }),
      },
    });

    const result = await openPaymentSession(deps, {
      invoiceId: 'inv-1',
      method: 'moamalat',
      amount: 200,
      fields: {},
      actorEmail: ACTOR,
    });

    expect(result.paymentLink).toBe('https://dpay.ly/sandbox/moamalat-pay/5001/abc');
  });

  // ── Worst-case scenarios ────────────────────────────────────────────────

  it('rejects when the invoice does not exist', async () => {
    const deps = makeDeps({ invoice: null });
    await expect(
      openPaymentSession(deps, { ...input, fields: { customerMobile: '0912345678' } }),
    ).rejects.toBeInstanceOf(PaymentNotFoundError);
  });

  it('refuses collection against a draft invoice', async () => {
    const deps = makeDeps({ invoice: { status: 'draft' } });
    await expect(
      openPaymentSession(deps, { ...input, fields: { customerMobile: '0912345678' } }),
    ).rejects.toBeInstanceOf(PaymentCollectionNotAllowedError);
  });

  it('refuses collection against a cancelled invoice', async () => {
    const deps = makeDeps({ invoice: { status: 'cancelled' } });
    await expect(
      openPaymentSession(deps, { ...input, fields: { customerMobile: '0912345678' } }),
    ).rejects.toBeInstanceOf(PaymentCollectionNotAllowedError);
  });

  it('rejects an unknown method before touching the gateway', async () => {
    const deps = makeDeps();
    await expect(
      openPaymentSession(deps, {
        ...input,
        method: 'attacker-gateway',
        fields: {},
      }),
    ).rejects.toBeInstanceOf(PaymentFieldError);
    expect(deps.gateway.openSession).not.toHaveBeenCalled();
  });

  it('rejects overpayment against prior collections before calling the gateway', async () => {
    const deps = makeDeps({
      txns: [makeTxn({ status: 'paid', amount: 900 })],
    });
    await expect(
      openPaymentSession(deps, {
        ...input,
        amount: 200, // outstanding is only 100
        fields: { customerMobile: '0912345678' },
      }),
    ).rejects.toBeInstanceOf(PaymentAmountError);
    expect(deps.gateway.openSession).not.toHaveBeenCalled();
  });

  it('propagates gateway rejections (e.g. wrong wallet PIN) to the route layer', async () => {
    const deps = makeDeps({
      gateway: {
        openSession: vi
          .fn()
          .mockRejectedValue(
            new DpayError({ code: 'GATEWAY', status: 400, message: 'Wrong PIN' }),
          ),
      },
    });
    await expect(
      openPaymentSession(deps, { ...input, fields: { customerMobile: '0912345678' } }),
    ).rejects.toBeInstanceOf(DpayError);
  });

  it('counts existing paid transactions when computing the outstanding cap', async () => {
    const deps = makeDeps({
      txns: [makeTxn({ status: 'paid', amount: 400 })],
    });

    await openPaymentSession(deps, {
      ...input,
      amount: 600, // exactly the remaining outstanding
      fields: { customerMobile: '0912345678' },
    });

    expect(deps.gateway.openSession).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// verifyPaymentOtp
// ---------------------------------------------------------------------------

describe('verifyPaymentOtp', () => {
  const baseTxn = (overrides: Partial<PaymentTxnRecord> = {}) =>
    makeTxn({ id: 'txn-1', dpaySessionId: 4242, payMethod: 'edfali', status: 'pending', amount: 1000, ...overrides });

  it('confirms payment, stamps the txn, and advances the invoice to paid', async () => {
    const deps = makeDeps({ txns: [baseTxn()] });

    const result = await verifyPaymentOtp(deps, {
      txnId: 'txn-1',
      otp: '111111',
      actorEmail: ACTOR,
    });

    expect(deps.gateway.verifyOtp).toHaveBeenCalledWith(4242, '111111');
    expect(result.transaction.status).toBe('paid');
    expect(result.transaction.txId).toBe('sb_txn_ok');
    expect(result.transaction.confirmedBy).toBe(ACTOR);
    expect(deps.statusUpdates).toEqual([{ status: 'paid', paidDate: expect.any(Date) }]);
  });

  it('advances a partially collected invoice to partially_paid', async () => {
    const deps = makeDeps({
      invoice: { amount: 2000 },
      txns: [baseTxn(), makeTxn({ id: 'txn-2', amount: 900, status: 'paid' })],
    });

    const result = await verifyPaymentOtp(deps, {
      txnId: 'txn-1',
      otp: '111111',
      actorEmail: ACTOR,
    });

    // txn-1 (1000) + txn-2 (900) = 1900 of 2000 → still partial.
    expect(deps.statusUpdates).toEqual([
      { status: 'partially_paid', paidDate: null },
    ]);
    expect(result.invoiceStatus).toBe('partially_paid');
  });

  it('is idempotent: verifying an already-paid transaction is a no-op', async () => {
    const deps = makeDeps({
      txns: [baseTxn({ status: 'paid', txId: 'sb_txn_ok' })],
    });

    const result = await verifyPaymentOtp(deps, {
      txnId: 'txn-1',
      otp: '111111',
      actorEmail: ACTOR,
    });

    expect(deps.gateway.verifyOtp).not.toHaveBeenCalled();
    expect(deps.statusUpdates).toEqual([]);
    expect(result.transaction.status).toBe('paid');
    expect(result.invoiceStatus).toBeNull();
  });

  // ── Worst-case scenarios ────────────────────────────────────────────────

  it('rejects verification of a failed/expired/cancelled transaction', async () => {
    for (const status of ['failed', 'expired', 'cancelled'] as const) {
      const deps = makeDeps({ txns: [baseTxn({ status })] });
      await expect(
        verifyPaymentOtp(deps, { txnId: 'txn-1', otp: '111111', actorEmail: ACTOR }),
      ).rejects.toBeInstanceOf(PaymentStateError);
    }
  });

  it('rejects malformed OTPs before calling the gateway', async () => {
    const deps = makeDeps({ txns: [baseTxn()] });
    await expect(
      verifyPaymentOtp(deps, { txnId: 'txn-1', otp: 'drop table', actorEmail: ACTOR }),
    ).rejects.toBeInstanceOf(PaymentFieldError);
    expect(deps.gateway.verifyOtp).not.toHaveBeenCalled();
  });

  it('rejects a Sadad OTP with the wrong length before the gateway call', async () => {
    const deps = makeDeps({
      txns: [baseTxn({ payMethod: 'sadad' })],
    });
    await expect(
      verifyPaymentOtp(deps, { txnId: 'txn-1', otp: '12345', actorEmail: ACTOR }),
    ).rejects.toBeInstanceOf(PaymentFieldError);
    expect(deps.gateway.verifyOtp).not.toHaveBeenCalled();
  });

  it('propagates a gateway wrong-OTP rejection', async () => {
    const deps = makeDeps({
      txns: [baseTxn()],
      gateway: {
        verifyOtp: vi
          .fn()
          .mockRejectedValue(new DpayError({ code: 'GATEWAY', status: 400, message: 'Wrong OTP' })),
      },
    });
    await expect(
      verifyPaymentOtp(deps, { txnId: 'txn-1', otp: '000000', actorEmail: ACTOR }),
    ).rejects.toBeInstanceOf(DpayError);
  });

  it('rejects when the transaction does not exist', async () => {
    const deps = makeDeps({ txns: [] });
    await expect(
      verifyPaymentOtp(deps, { txnId: 'missing', otp: '111111', actorEmail: ACTOR }),
    ).rejects.toBeInstanceOf(PaymentNotFoundError);
  });
});

// ---------------------------------------------------------------------------
// handleWebhookEvent
// ---------------------------------------------------------------------------

describe('handleWebhookEvent', () => {
  const payload = (overrides: Record<string, unknown> = {}) => ({
    event: 'payment.paid',
    session_id: 4242,
    status: 'paid',
    amount: 1000,
    pay_method: 'edfali',
    tx_id: 'txn_webhook_1',
    data: { konoozInvoiceNumber: 'INV-1000' },
    ...overrides,
  });

  it('marks the transaction paid and advances the invoice', async () => {
    const deps = makeDeps({ txns: [makeTxn({ id: 'txn-1', dpaySessionId: 4242, amount: 1000 })] });

    const result = await handleWebhookEvent(deps, payload());
    if (!result.applied) throw new Error('expected webhook to be applied');

    expect(result.transaction.status).toBe('paid');
    expect(deps.statusUpdates).toEqual([{ status: 'paid', paidDate: expect.any(Date) }]);
  });

  it('is idempotent for duplicate deliveries of the same terminal event', async () => {
    const deps = makeDeps({
      txns: [
        makeTxn({
          id: 'txn-1',
          dpaySessionId: 4242,
          status: 'paid',
          txId: 'txn_webhook_1',
          lastWebhookEvent: 'payment.paid',
        }),
      ],
    });

    const result = await handleWebhookEvent(deps, payload());
    if (result.applied) throw new Error('expected webhook to be a no-op');

    expect(result.reason).toBe('already_applied');
    expect(deps.statusUpdates).toEqual([]);
  });

  it('silently acknowledges webhooks for unknown sessions (no crash, still 2xx)', async () => {
    const deps = makeDeps({ txns: [] });
    const result = await handleWebhookEvent(deps, payload({ session_id: 999999 }));
    if (result.applied) throw new Error('expected unknown session to be acknowledged');

    expect(result.reason).toBe('unknown_session');
  });

  it('ignores webhook.test and unknown event types', async () => {
    const deps = makeDeps({ txns: [makeTxn({ dpaySessionId: 4242 })] });
    const result = await handleWebhookEvent(deps, payload({ event: 'webhook.test' }));
    if (result.applied) throw new Error('expected test webhook to be ignored');

    expect(result.reason).toBe('ignored_event');
  });

  it('records a failure event on the transaction without touching the invoice', async () => {
    const deps = makeDeps({ txns: [makeTxn({ dpaySessionId: 4242, amount: 1000 })] });
    const result = await handleWebhookEvent(deps, payload({ event: 'payment.failed' }));
    if (!result.applied) throw new Error('expected webhook to be applied');

    expect(result.transaction.status).toBe('failed');
    expect(deps.statusUpdates).toEqual([]);
  });

  it('downgrades the invoice when a refund reduces collections below the total', async () => {
    const deps = makeDeps({
      txns: [
        makeTxn({ id: 'txn-1', dpaySessionId: 4242, amount: 1000, status: 'paid' }),
        makeTxn({ id: 'txn-2', amount: 500, status: 'paid' }),
      ],
    });

    const result = await handleWebhookEvent(deps, payload({ event: 'payment.refunded' }));
    if (!result.applied) throw new Error('expected webhook to be applied');

    expect(result.transaction.status).toBe('refunded');
    // txn-2 (500) still collected of 1000 → partially_paid.
    expect(deps.statusUpdates).toEqual([{ status: 'partially_paid', paidDate: null }]);
  });

  it('stamps the webhook event name and time for the audit trail', async () => {
    const deps = makeDeps({ txns: [makeTxn({ id: 'txn-1', dpaySessionId: 4242 })] });
    await handleWebhookEvent(deps, payload());
    expect(deps.txnWriter.updateStatus).toHaveBeenCalledWith(
      'txn-1',
      expect.objectContaining({
        lastWebhookEvent: 'payment.paid',
        lastWebhookAt: expect.any(Date),
      }),
    );
  });
});

// ---------------------------------------------------------------------------
// syncTransactionFromGateway (polling fallback)
// ---------------------------------------------------------------------------

describe('syncTransactionFromGateway', () => {
  const baseTxn = (overrides: Partial<PaymentTxnRecord> = {}) =>
    makeTxn({ id: 'txn-1', dpaySessionId: 4242, payMethod: 'edfali', status: 'pending', amount: 1000, ...overrides });

  it('promotes a pending transaction to paid when the gateway confirms', async () => {
    const deps = makeDeps({ txns: [baseTxn()] });

    const result = await syncTransactionFromGateway(deps, 'txn-1');

    expect(deps.gateway.getSession).toHaveBeenCalledWith(4242);
    expect(result.transaction.status).toBe('paid');
    expect(deps.statusUpdates).toEqual([{ status: 'paid', paidDate: expect.any(Date) }]);
  });

  it('leaves the transaction untouched while the gateway still says pending', async () => {
    const deps = makeDeps({
      txns: [baseTxn()],
      gateway: {
        getSession: vi.fn().mockResolvedValue({
          sessionId: 4242,
          status: 'pending',
          amount: 1000,
          payMethod: 'edfali',
          txId: null,
          expiredAt: null,
          data: {},
        }),
      },
    });

    const result = await syncTransactionFromGateway(deps, 'txn-1');
    expect(result.transaction.status).toBe('pending');
    expect(deps.statusUpdates).toEqual([]);
  });

  it('maps a gateway-expired session to the expired status', async () => {
    const deps = makeDeps({
      txns: [baseTxn()],
      gateway: {
        getSession: vi.fn().mockResolvedValue({
          sessionId: 4242,
          status: 'expired',
          amount: 1000,
          payMethod: 'edfali',
          txId: null,
          expiredAt: '2026-09-09T01:15:00.000000Z',
          data: {},
        }),
      },
    });

    const result = await syncTransactionFromGateway(deps, 'txn-1');
    expect(result.transaction.status).toBe('expired');
    expect(deps.statusUpdates).toEqual([]);
  });

  it('treats an unrecognized gateway status as unchanged (defensive mapping)', async () => {
    const deps = makeDeps({
      txns: [baseTxn()],
      gateway: {
        getSession: vi.fn().mockResolvedValue({
          sessionId: 4242,
          status: 'in_quantum_flux',
          amount: 1000,
          payMethod: 'edfali',
          txId: null,
          expiredAt: null,
          data: {},
        }),
      },
    });

    const result = await syncTransactionFromGateway(deps, 'txn-1');
    expect(result.transaction.status).toBe('pending');
  });

  it('does not call the gateway for an already-terminal transaction', async () => {
    const deps = makeDeps({ txns: [baseTxn({ status: 'cancelled' })] });
    await syncTransactionFromGateway(deps, 'txn-1');
    expect(deps.gateway.getSession).not.toHaveBeenCalled();
  });

  it('rejects when the transaction does not exist', async () => {
    const deps = makeDeps({ txns: [] });
    await expect(syncTransactionFromGateway(deps, 'missing')).rejects.toBeInstanceOf(
      PaymentNotFoundError,
    );
  });
});

// ---------------------------------------------------------------------------
// cancelTransaction
// ---------------------------------------------------------------------------

describe('cancelTransaction', () => {
  it('cancels a pending transaction', async () => {
    const deps = makeDeps({
      txns: [makeTxn({ id: 'txn-1', status: 'pending' })],
    });

    const result = await cancelTransaction(deps, 'txn-1');
    expect(result.status).toBe('cancelled');
  });

  it('refuses to cancel a settled transaction', async () => {
    const deps = makeDeps({
      txns: [makeTxn({ id: 'txn-1', status: 'paid' })],
    });
    await expect(cancelTransaction(deps, 'txn-1')).rejects.toBeInstanceOf(PaymentStateError);
  });

  it('rejects when the transaction does not exist', async () => {
    const deps = makeDeps({ txns: [] });
    await expect(cancelTransaction(deps, 'missing')).rejects.toBeInstanceOf(PaymentNotFoundError);
  });
});

// ---------------------------------------------------------------------------
// listTransactionsForInvoice
// ---------------------------------------------------------------------------

describe('listTransactionsForInvoice', () => {
  it('returns transactions with collected and outstanding summary', async () => {
    const deps = makeDeps({
      txns: [
        makeTxn({ amount: 400, status: 'paid' }),
        makeTxn({ amount: 200, status: 'failed' }),
      ],
    });

    const result = await listTransactionsForInvoice(deps, 'inv-1');

    expect(result.transactions).toHaveLength(2);
    expect(result.amountPaid).toBe(400);
    expect(result.outstanding).toBe(600);
  });

  it('handles an invoice with zero transactions', async () => {
    const deps = makeDeps({ txns: [] });
    const result = await listTransactionsForInvoice(deps, 'inv-1');
    expect(result.transactions).toEqual([]);
    expect(result.amountPaid).toBe(0);
    expect(result.outstanding).toBe(1000);
  });
});
