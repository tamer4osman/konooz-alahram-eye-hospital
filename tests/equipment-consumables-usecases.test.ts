import { describe, it, expect, vi } from 'vitest';
import {
  resolveEquipmentCreate,
  resolveEquipmentPatch,
  createEquipment,
  listEquipment,
  EquipmentNameRequiredError,
} from '@/lib/usecases/equipment';
import {
  resolveConsumableCreate,
  resolveConsumablePatch,
  DEFAULT_LOW_STOCK_THRESHOLD,
  createConsumable,
  updateConsumable,
  listConsumables,
} from '@/lib/usecases/consumables';
import type {
  EquipmentReader,
  EquipmentWriter,
} from '@/lib/usecases/equipment';
import type { ConsumableReader as CReader, ConsumableWriter as CWriter } from '@/lib/usecases/consumables';
import type { HospitalEquipment as EquipmentDTO } from '@/data/dashboardData';
import type { SurgicalConsumable as ConsumableDTO } from '@/data/dashboardData';

const EQ_SAMPLE = { id: 'eq-1' } as unknown as EquipmentDTO;
const CO_SAMPLE = { id: 'co-1' } as unknown as ConsumableDTO;

function stubEquipmentWriter(row: EquipmentDTO): EquipmentWriter {
  return {
    create: vi.fn().mockResolvedValue(row),
    update: vi.fn().mockResolvedValue(row),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

function stubConsumableWriter(row: ConsumableDTO): CWriter {
  return {
    create: vi.fn().mockResolvedValue(row),
    update: vi.fn().mockResolvedValue(row),
  };
}

describe('equipment rules', () => {
  it('requires a name in at least one language', () => {
    expect(() => resolveEquipmentCreate({})).toThrow(EquipmentNameRequiredError);
  });

  it('falls back one language to the other', () => {
    const resolved = resolveEquipmentCreate({ nameEn: 'OCT Machine' });
    expect(resolved.nameAr).toBe('OCT Machine');
    expect(resolved.nameEn).toBe('OCT Machine');
  });

  it('defaults status operational and blanks strings', () => {
    const resolved = resolveEquipmentCreate({ nameAr: 'جهاز', model: 'X-100' });
    expect(resolved.status).toBe('operational');
    expect(resolved.brand).toBe('');
    expect(resolved.serialNumber).toBe('');
    expect(resolved.modelNumber).toBe('X-100');
  });

  it('patch passes through unchanged', () => {
    const patch = { status: 'in_use' as const, healthScore: 95 };
    expect(resolveEquipmentPatch(patch)).toEqual(patch);
  });

  it('createEquipment use case resolves then persists', async () => {
    const writer = stubEquipmentWriter(EQ_SAMPLE);
    await createEquipment(writer, { nameAr: 'جهاز' });
    expect(vi.mocked(writer.create).mock.calls[0][0].nameAr).toBe('جهاز');
  });

  it('listEquipment delegates to reader', async () => {
    const reader: EquipmentReader = { list: vi.fn().mockResolvedValue([EQ_SAMPLE]) };
    expect(await listEquipment(reader)).toEqual([EQ_SAMPLE]);
  });
});

describe('consumable rules', () => {
  it('defaults stock 0, threshold 10, reorder optimal, cost 0', () => {
    const resolved = resolveConsumableCreate({
      nameAr: 'عدسات',
      category: 'iol_lens',
      unitAr: 'قطعة',
    });
    expect(resolved.stockLevel).toBe(0);
    expect(resolved.lowStockThreshold).toBe(DEFAULT_LOW_STOCK_THRESHOLD);
    expect(resolved.lowStockThreshold).toBe(10);
    expect(resolved.reorderStatus).toBe('optimal');
    expect(resolved.unitCostLYD).toBe(0);
    expect(resolved.brand).toBe('');
    expect(resolved.expiryDate).toBeNull();
  });

  it('preserves explicit stock values', () => {
    const resolved = resolveConsumableCreate({
      nameAr: 'عدسات',
      category: 'iol_lens',
      unitAr: 'قطعة',
      stockCurrent: 25,
      stockMinThreshold: 5,
      unitCostLYD: 1200.5,
    });
    expect(resolved.stockLevel).toBe(25);
    expect(resolved.lowStockThreshold).toBe(5);
    expect(resolved.unitCostLYD).toBe(1200.5);
  });

  it('patch passes through unchanged', () => {
    const patch = { stockLevel: 8, reorderStatus: 'low_stock' as const };
    expect(resolveConsumablePatch(patch)).toEqual(patch);
  });

  it('create + update use cases wire rules to ports', async () => {
    const writer = stubConsumableWriter(CO_SAMPLE);
    await createConsumable(writer, {
      nameAr: 'عدسات',
      category: 'iol_lens',
      unitAr: 'قطعة',
    });
    expect(vi.mocked(writer.create).mock.calls[0][0].lowStockThreshold).toBe(10);

    await updateConsumable(writer, 'co-1', { stockLevel: 3 });
    const [id, patch] = vi.mocked(writer.update).mock.calls[0];
    expect(id).toBe('co-1');
    expect(patch.stockLevel).toBe(3);
  });

  it('listConsumables delegates to reader', async () => {
    const reader: CReader = { list: vi.fn().mockResolvedValue([CO_SAMPLE]) };
    expect(await listConsumables(reader)).toEqual([CO_SAMPLE]);
  });
});
