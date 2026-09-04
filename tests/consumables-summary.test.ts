import { describe, it, expect } from 'vitest';
import { computeConsumablesSummary, type SummaryConsumableInput } from '@/lib/usecases/consumables/rules';

const item = (over: Partial<SummaryConsumableInput> & { id: string }): SummaryConsumableInput => ({
  category: 'iol_lens',
  stockCurrent: 50,
  stockMinThreshold: 10,
  reorderStatus: 'optimal',
  expiryDate: '',
  unitCostLYD: 100,
  ...over,
});

const now = new Date('2026-09-04T12:00:00Z');
const daysFromNow = (d: number) => new Date(now.getTime() + d * 86_400_000).toISOString().slice(0, 10);

describe('computeConsumablesSummary', () => {
  it('counts items, low stock, and reorder-placed', () => {
    const result = computeConsumablesSummary(
      [
        item({ id: 'a' }),
        item({ id: 'b', stockCurrent: 5, stockMinThreshold: 10 }),
        item({ id: 'c', stockCurrent: 10, stockMinThreshold: 10 }),
        item({ id: 'd', reorderStatus: 'reorder_placed', stockCurrent: 3 }),
      ],
      now,
    );
    expect(result.totalItems).toBe(4);
    expect(result.lowStockCount).toBe(3); // 5, 10 (at threshold counts), 3
    expect(result.reorderPlacedCount).toBe(1);
  });

  it('values inventory as stock x unit cost, rounded', () => {
    const result = computeConsumablesSummary(
      [item({ id: 'a', stockCurrent: 3, unitCostLYD: 100.1 }), item({ id: 'b', stockCurrent: 2, unitCostLYD: 50.2 })],
      now,
    );
    expect(result.totalValueLYD).toBe(400.7);
  });

  it('flags expired and expiring-soon separately; empty expiry is ignored', () => {
    const result = computeConsumablesSummary(
      [
        item({ id: 'a', expiryDate: daysFromNow(-5) }),
        item({ id: 'b', expiryDate: daysFromNow(30) }),
        item({ id: 'c', expiryDate: daysFromNow(60) }),
        item({ id: 'd', expiryDate: daysFromNow(61) }),
        item({ id: 'e', expiryDate: '' }),
      ],
      now,
    );
    expect(result.expiredCount).toBe(1);
    expect(result.expiringSoonCount).toBe(2); // 30 and 60 days
  });

  it('breaks down by category with low-stock subtotals', () => {
    const result = computeConsumablesSummary(
      [
        item({ id: 'a', category: 'iol_lens' }),
        item({ id: 'b', category: 'iol_lens', stockCurrent: 2 }),
        item({ id: 'c', category: 'viscoelastic', stockCurrent: 1 }),
      ],
      now,
    );
    const iol = result.categories.find((c) => c.category === 'iol_lens');
    const visco = result.categories.find((c) => c.category === 'viscoelastic');
    expect(iol).toEqual({ category: 'iol_lens', itemCount: 2, lowStockCount: 1 });
    expect(visco).toEqual({ category: 'viscoelastic', itemCount: 1, lowStockCount: 1 });
  });

  it('handles an empty inventory with a stable shape', () => {
    const result = computeConsumablesSummary([], now);
    expect(result).toEqual({
      totalItems: 0,
      lowStockCount: 0,
      reorderPlacedCount: 0,
      expiredCount: 0,
      expiringSoonCount: 0,
      totalValueLYD: 0,
      categories: [],
    });
  });
});
