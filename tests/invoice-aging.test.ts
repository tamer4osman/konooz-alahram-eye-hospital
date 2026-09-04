import { describe, it, expect } from 'vitest';
import { computeArAging, AR_AGING_BUCKETS, type AgingInvoiceInput } from '@/lib/usecases/invoices/rules';

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
