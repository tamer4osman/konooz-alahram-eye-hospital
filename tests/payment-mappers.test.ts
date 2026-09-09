import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import { toPaymentTxnRecord } from '@/lib/adapters/prisma/payment-adapter';
import type { PaymentTransaction } from '@prisma/client';

// Mapper tests: payment rows carry exact-money Decimal amounts; the record
// exposed to use cases must carry plain JS numbers so no Decimal instance
// ever crosses the use-case boundary or a JSON response.

function makeRow(overrides: Partial<PaymentTransaction> = {}): PaymentTransaction {
  return {
    id: 'ptxn-1',
    invoiceId: 'inv-1',
    dpaySessionId: 4242,
    payMethod: 'edfali',
    status: 'paid',
    amount: new Prisma.Decimal(1234.56),
    currency: 'LYD',
    txId: 'sb_txn_abc',
    receiptUrl: 'https://dpay.ly/receipt/4242/x',
    payerAccount: null,
    failureReason: null,
    confirmedBy: 'staff@konooz.test',
    lastWebhookEvent: 'payment.paid',
    lastWebhookAt: new Date('2026-09-09T01:05:00.000Z'),
    lastPollAt: null,
    createdAt: new Date('2026-09-09T01:00:00.000Z'),
    updatedAt: new Date('2026-09-09T01:05:00.000Z'),
    ...overrides,
  } as PaymentTransaction;
}

describe('toPaymentTxnRecord', () => {
  it('converts the Decimal amount to a plain number at 2dp', () => {
    const record = toPaymentTxnRecord(makeRow());
    expect(record.amount).toBe(1234.56);
    expect(typeof record.amount).toBe('number');
  });

  it('maps every status and reference field verbatim', () => {
    const record = toPaymentTxnRecord(makeRow());
    expect(record).toEqual({
      id: 'ptxn-1',
      invoiceId: 'inv-1',
      dpaySessionId: 4242,
      payMethod: 'edfali',
      status: 'paid',
      amount: 1234.56,
      currency: 'LYD',
      txId: 'sb_txn_abc',
      receiptUrl: 'https://dpay.ly/receipt/4242/x',
      payerAccount: null,
      failureReason: null,
      confirmedBy: 'staff@konooz.test',
      lastWebhookEvent: 'payment.paid',
      lastWebhookAt: new Date('2026-09-09T01:05:00.000Z'),
      lastPollAt: null,
      createdAt: new Date('2026-09-09T01:00:00.000Z'),
      updatedAt: new Date('2026-09-09T01:05:00.000Z'),
    });
  });

  // ── Worst-case scenarios ────────────────────────────────────────────────

  it('handles every nullable column being null', () => {
    const record = toPaymentTxnRecord(
      makeRow({
        txId: null,
        receiptUrl: null,
        payerAccount: null,
        failureReason: null,
        confirmedBy: null,
        lastWebhookEvent: null,
        lastWebhookAt: null,
        lastPollAt: null,
      }),
    );
    expect(record.txId).toBeNull();
    expect(record.receiptUrl).toBeNull();
    expect(record.payerAccount).toBeNull();
    expect(record.confirmedBy).toBeNull();
    expect(record.lastWebhookAt).toBeNull();
  });

  it('preserves sub-cent precision losslessly through Decimal (no float drift)', () => {
    // 0.1 + 0.2 style hazards: Decimal('100.10') must land on exactly 100.1.
    const record = toPaymentTxnRecord(makeRow({ amount: new Prisma.Decimal('100.10') }));
    expect(record.amount).toBe(100.1);
  });

  it('maps large amounts (9,999,999,999.99) without precision loss', () => {
    const record = toPaymentTxnRecord(
      makeRow({ amount: new Prisma.Decimal('9999999999.99') }),
    );
    expect(record.amount).toBe(9_999_999_999.99);
  });

  it('tolerates statuses from the full PaymentTransactionStatus union', () => {
    for (const status of [
      'pending',
      'paid',
      'failed',
      'expired',
      'refunded',
      'voided',
      'cancelled',
    ] as const) {
      const record = toPaymentTxnRecord(makeRow({ status }));
      expect(record.status).toBe(status);
    }
  });
});
