import { describe, it, expect } from 'vitest';
import {
  computeArAging,
  computeArAgingSnapshot,
  AR_AGING_BUCKETS,
  AR_TREND_LOOKBACK_DAYS,
  type AgingInvoiceInput,
  type AgingSnapshotInvoiceInput,
} from '@/lib/usecases/invoices/rules';
import { loadInvoiceAgingTrend } from '@/lib/usecases/invoices/use-cases';
import type { AgingSnapshotReader } from '@/lib/usecases/invoices/ports';

const DAY = 86_400_000;

const inv = (over: Partial<AgingInvoiceInput> & { id: string }): AgingInvoiceInput => ({
  status: 'pending_insurance',
  issuedDate: new Date('2026-09-04T10:00:00Z'),
  totalGrossLYD: 1000,
  ...over,
});

// Fixed clock: 2026-09-04
const now = new Date('2026-09-04T12:00:00Z');

describe('computeArAging', () => {
  it('buckets outstanding invoices by days since issue', () => {
    const result = computeArAging(
      [
        inv({ id: 'a', issuedDate: new Date(now.getTime() - 5 * DAY), totalGrossLYD: 500 }),
        inv({ id: 'b', issuedDate: new Date(now.getTime() - 45 * DAY), totalGrossLYD: 700 }),
        inv({ id: 'c', issuedDate: new Date(now.getTime() - 75 * DAY), totalGrossLYD: 200 }),
        inv({ id: 'd', issuedDate: new Date(now.getTime() - 120 * DAY), totalGrossLYD: 300 }),
      ],
      now,
    );
    expect(result.buckets).toEqual([
      { key: '0_30', count: 1, totalLYD: 500 },
      { key: '31_60', count: 1, totalLYD: 700 },
      { key: '61_90', count: 1, totalLYD: 200 },
      { key: '90_plus', count: 1, totalLYD: 300 },
    ]);
    expect(result.grandTotalLYD).toBe(1700);
    expect(result.outstandingCount).toBe(4);
  });

  it('excludes paid, cancelled and draft invoices', () => {
    const result = computeArAging(
      [
        inv({ id: 'a', status: 'paid' }),
        inv({ id: 'b', status: 'cancelled' }),
        inv({ id: 'c', status: 'draft' }),
        inv({ id: 'd', status: 'partially_paid', totalGrossLYD: 400 }),
      ],
      now,
    );
    expect(result.outstandingCount).toBe(1);
    expect(result.grandTotalLYD).toBe(400);
    expect(result.buckets[0].count).toBe(1);
  });

  it('includes pre_auth_approved and pending as outstanding', () => {
    const result = computeArAging(
      [inv({ id: 'a', status: 'pre_auth_approved', totalGrossLYD: 100 }), inv({ id: 'b', status: 'pending', totalGrossLYD: 200 })],
      now,
    );
    expect(result.outstandingCount).toBe(2);
    expect(result.grandTotalLYD).toBe(300);
  });

  it('treats day-30 as 0_30 and day-31 as 31_60 (no off-by-one)', () => {
    const result = computeArAging(
      [
        inv({ id: 'a', issuedDate: new Date(now.getTime() - 30 * DAY), totalGrossLYD: 1 }),
        inv({ id: 'b', issuedDate: new Date(now.getTime() - 31 * DAY), totalGrossLYD: 2 }),
      ],
      now,
    );
    expect(result.buckets[0]).toEqual({ key: '0_30', count: 1, totalLYD: 1 });
    expect(result.buckets[1]).toEqual({ key: '31_60', count: 1, totalLYD: 2 });
  });

  it('keeps all four buckets present even when empty (stable report shape)', () => {
    const result = computeArAging([], now);
    expect(result.buckets.map((b) => b.key)).toEqual(AR_AGING_BUCKETS);
    expect(result.buckets.every((b) => b.count === 0 && b.totalLYD === 0)).toBe(true);
    expect(result.grandTotalLYD).toBe(0);
    expect(result.outstandingCount).toBe(0);
  });

  it('rounds totals to 2 decimals (no float drift)', () => {
    const result = computeArAging(
      [
        inv({ id: 'a', totalGrossLYD: 100.1 }),
        inv({ id: 'b', totalGrossLYD: 200.2 }),
      ],
      now,
    );
    expect(result.buckets[0].totalLYD).toBe(300.3);
  });
});

// --------------------------------------------------------------------------
// Point-in-time reconstruction (30-day-ago estimate)
// --------------------------------------------------------------------------

const snapshotInv = (over: Partial<AgingSnapshotInvoiceInput> & { id: string }): AgingSnapshotInvoiceInput => ({
  status: 'pending_insurance',
  issuedDate: new Date('2026-09-04T10:00:00Z'),
  paidDate: null,
  totalGrossLYD: 1000,
  ...over,
});

const THIRTY_DAYS_AGO = new Date(now.getTime() - 30 * DAY);

describe('computeArAgingSnapshot (reconstructed estimate at a past date)', () => {
  it('buckets by age relative to the snapshot date, not today', () => {
    // Issued 45 days before `now` -> 15 days old at the snapshot -> 0_30 bucket.
    const result = computeArAgingSnapshot(
      [snapshotInv({ id: 'a', issuedDate: new Date(now.getTime() - 45 * DAY), totalGrossLYD: 700 })],
      THIRTY_DAYS_AGO,
    );
    expect(result.buckets[0]).toEqual({ key: '0_30', count: 1, totalLYD: 700 });
    expect(result.grandTotalLYD).toBe(700);
  });

  it('excludes invoices issued after the snapshot date (did not exist yet)', () => {
    const result = computeArAgingSnapshot(
      [snapshotInv({ id: 'a', issuedDate: new Date(now.getTime() - 10 * DAY), totalGrossLYD: 500 })],
      THIRTY_DAYS_AGO,
    );
    expect(result.outstandingCount).toBe(0);
    expect(result.grandTotalLYD).toBe(0);
  });

  it('keeps invoices that were paid after the snapshot date (outstanding then)', () => {
    const result = computeArAgingSnapshot(
      [
        snapshotInv({
          id: 'a',
          status: 'paid',
          issuedDate: new Date(now.getTime() - 50 * DAY),
          paidDate: new Date(now.getTime() - 20 * DAY), // paid after the snapshot
          totalGrossLYD: 400,
        }),
      ],
      THIRTY_DAYS_AGO,
    );
    expect(result.outstandingCount).toBe(1);
    expect(result.grandTotalLYD).toBe(400);
  });

  it('excludes invoices paid before the snapshot date (already settled then)', () => {
    const result = computeArAgingSnapshot(
      [
        snapshotInv({
          id: 'a',
          status: 'paid',
          issuedDate: new Date(now.getTime() - 50 * DAY),
          paidDate: new Date(now.getTime() - 40 * DAY), // settled before the snapshot
          totalGrossLYD: 400,
        }),
      ],
      THIRTY_DAYS_AGO,
    );
    expect(result.outstandingCount).toBe(0);
  });

  it('keeps still-unpaid invoices with no paidDate recorded', () => {
    const result = computeArAgingSnapshot(
      [snapshotInv({ id: 'a', issuedDate: new Date(now.getTime() - 60 * DAY), totalGrossLYD: 250 })],
      THIRTY_DAYS_AGO,
    );
    expect(result.outstandingCount).toBe(1);
    expect(result.grandTotalLYD).toBe(250);
  });

  it('keeps now-cancelled invoices issued before the snapshot (cancellation date untracked — documented estimate bias)', () => {
    const result = computeArAgingSnapshot(
      [snapshotInv({ id: 'a', status: 'cancelled', issuedDate: new Date(now.getTime() - 60 * DAY), totalGrossLYD: 300 })],
      THIRTY_DAYS_AGO,
    );
    expect(result.outstandingCount).toBe(1);
  });

  it('always excludes drafts', () => {
    const result = computeArAgingSnapshot(
      [snapshotInv({ id: 'a', status: 'draft', issuedDate: new Date(now.getTime() - 60 * DAY) })],
      THIRTY_DAYS_AGO,
    );
    expect(result.outstandingCount).toBe(0);
  });
});

describe('loadInvoiceAgingTrend (use case)', () => {
  const rows: AgingSnapshotInvoiceInput[] = [
    snapshotInv({ id: 'a', issuedDate: new Date(now.getTime() - 5 * DAY), totalGrossLYD: 500 }),
    snapshotInv({ id: 'b', issuedDate: new Date(now.getTime() - 45 * DAY), totalGrossLYD: 700 }),
    snapshotInv({
      id: 'c',
      status: 'paid',
      issuedDate: new Date(now.getTime() - 50 * DAY),
      paidDate: new Date(now.getTime() - 20 * DAY),
      totalGrossLYD: 200,
    }),
  ];

  const reader: AgingSnapshotReader = {
    listForAging: async () => rows,
  };

  it('returns the live report plus a 30-day-ago reconstruction', async () => {
    const trend = await loadInvoiceAgingTrend(reader, now);
    expect(trend.lookbackDays).toBe(AR_TREND_LOOKBACK_DAYS);

    // Current: a (500) + b (700) outstanding; c already paid -> 1200.
    expect(trend.current.grandTotalLYD).toBe(1200);
    expect(trend.current.outstandingCount).toBe(2);

    // 30 days ago: a did not exist yet; b 15 days old; c unpaid until day 20 -> 900.
    expect(trend.previous.grandTotalLYD).toBe(900);
    expect(trend.previous.outstandingCount).toBe(2);
  });

  it('returns an empty previous report when nothing was issued yet', async () => {
    const early = new Date('2026-06-01T12:00:00Z');
    const trend = await loadInvoiceAgingTrend(reader, early);
    expect(trend.current.outstandingCount).toBe(0);
    expect(trend.previous.outstandingCount).toBe(0);
    expect(trend.previous.grandTotalLYD).toBe(0);
  });
});
