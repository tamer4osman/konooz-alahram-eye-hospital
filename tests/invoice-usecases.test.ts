import { describe, it, expect, vi } from 'vitest';
import {
  generateInvoiceNumber,
  resolveInvoiceCreate,
  resolveStatusPatch,
  createInvoice,
  listInvoices,
  updateInvoiceStatus,
} from '@/lib/usecases/invoices';
import type {
  InvoiceReader,
  InvoiceStatusUpdater,
  InvoiceWriter,
} from '@/lib/usecases/invoices';
import type { HospitalBillingInvoice as InvoiceDTO } from '@/data/dashboardData';
import { InvoiceNotFoundError } from '@/lib/usecases/invoices';

// Stub port implementations — no Prisma, no mocking of modules.
function makeStubReader(rows: InvoiceDTO[]): InvoiceReader {
  return { list: vi.fn().mockResolvedValue(rows) };
}

function makeStubWriter(row: InvoiceDTO): InvoiceWriter {
  return { create: vi.fn().mockResolvedValue(row) };
}

function makeStubUpdater(row: InvoiceDTO): InvoiceStatusUpdater {
  return { updateStatus: vi.fn().mockResolvedValue(row) };
}

const NOW = new Date('2026-09-03T10:00:00.000Z');
const CTX = { actorEmail: 'staff@konooz.test', now: NOW };

const SAMPLE_DTO: InvoiceDTO = {
  id: 'inv-1',
  invoiceNumber: 'INV-1',
  ticketNumber: 'T-100',
  patientNameAr: 'أحمد',
  patientNameEn: 'Ahmed',
  procedureAr: 'ساد الماء الأبيض',
  procedureEn: 'Cataract surgery',
  insuranceNameAr: 'التأمين الوطني',
  insuranceNameEn: 'National Insurance',
  dateIssued: '2026-09-03',
  surgeonFeeLYD: 1000,
  orFacilityFeeLYD: 500,
  anesthesiaFeeLYD: 200,
  lensOrDeviceFeeLYD: 800,
  consumablesFeeLYD: 100,
  totalGrossLYD: 2600,
  insuranceCoveredLYD: 1800,
  patientCoPayLYD: 800,
  status: 'pending_insurance',
};

describe('generateInvoiceNumber', () => {
  it('uses the supplied timestamp', () => {
    expect(generateInvoiceNumber(NOW)).toBe('INV-1788429600000');
  });
});

describe('resolveInvoiceCreate', () => {
  it('applies defaults: generated number, empty ticket, fallback service, pending_insurance', () => {
    const resolved = resolveInvoiceCreate({}, CTX);
    expect(resolved.invoiceNumber).toBe('INV-1788429600000');
    expect(resolved.ticketNumber).toBe('');
    expect(resolved.patientId).toBe('PT-1788429600000');
    expect(resolved.serviceAr).toBe('خدمة طبية');
    expect(resolved.serviceEn).toBeNull();
    expect(resolved.status).toBe('pending_insurance');
    expect(resolved.amount).toBe(0);
    expect(resolved.issuedDate).toBe(NOW);
    expect(resolved.createdBy).toBe('staff@konooz.test');
    expect(resolved.insuranceNameAr).toBe('');
    expect(resolved.insuranceNameEn).toBeNull();
  });

  it('mirrors totalGrossLYD into amount and derives patientId from ticket', () => {
    const resolved = resolveInvoiceCreate(
      { totalGrossLYD: 2600, ticketNumber: 'T-100', invoiceNumber: 'INV-X' },
      CTX,
    );
    expect(resolved.amount).toBe(2600);
    expect(resolved.patientId).toBe('PT-T-100');
    expect(resolved.invoiceNumber).toBe('INV-X');
  });

  it('does not mutate the input object', () => {
    const input = { totalGrossLYD: 100, status: 'draft' as const };
    resolveInvoiceCreate(input, CTX);
    expect(input.status).toBe('draft');
    expect(input.totalGrossLYD).toBe(100);
  });
});

describe('resolveStatusPatch', () => {
  it('stamps paidDate when transitioning to paid without one', () => {
    const resolved = resolveStatusPatch({ status: 'paid' }, NOW);
    expect(resolved.paidDate).toEqual(NOW);
  });

  it('keeps an explicit paidDate when transitioning to paid', () => {
    const explicit = new Date('2026-01-01');
    const resolved = resolveStatusPatch({ status: 'paid', paidDate: explicit.toISOString() }, NOW);
    expect(resolved.paidDate).toEqual(explicit);
  });

  it('treats null paidDate as absent: stamps when transitioning to paid (preserves original route semantics)', () => {
    // Original handler used `!data.paidDate`, so null triggers stamping.
    const resolved = resolveStatusPatch({ status: 'paid', paidDate: null }, NOW);
    expect(resolved.paidDate).toEqual(NOW);
  });

  it('normalizes ISO string paidDate to Date on non-paid statuses', () => {
    const resolved = resolveStatusPatch(
      { status: 'partially_paid', paidDate: '2026-01-01T00:00:00.000Z' },
      NOW,
    );
    expect(resolved.paidDate).toEqual(new Date('2026-01-01T00:00:00.000Z'));
  });

  it('passes status-only patches through untouched', () => {
    const resolved = resolveStatusPatch({ status: 'cancelled' }, NOW);
    expect(resolved).toEqual({ status: 'cancelled', paidDate: undefined });
  });
});

describe('listInvoices', () => {
  it('delegates to the reader port', async () => {
    const reader = makeStubReader([SAMPLE_DTO]);
    const result = await listInvoices(reader);
    expect(reader.list).toHaveBeenCalledOnce();
    expect(result).toEqual([SAMPLE_DTO]);
  });
});

describe('createInvoice', () => {
  it('resolves the input then persists via the writer port', async () => {
    const writer = makeStubWriter(SAMPLE_DTO);
    const result = await createInvoice(
      writer,
      { ticketNumber: 'T-100', totalGrossLYD: 2600, procedureAr: 'ساد' },
      CTX,
    );
    const call = vi.mocked(writer.create).mock.calls[0][0];
    expect(call.patientId).toBe('PT-T-100');
    expect(call.amount).toBe(2600);
    expect(call.createdBy).toBe('staff@konooz.test');
    expect(result).toEqual(SAMPLE_DTO);
  });
});

describe('updateInvoiceStatus', () => {
  it('resolves the patch (auto paidDate) and persists via the updater port', async () => {
    const updater = makeStubUpdater(SAMPLE_DTO);
    await updateInvoiceStatus(updater, 'inv-1', { status: 'paid' }, NOW);
    const [id, patch] = vi.mocked(updater.updateStatus).mock.calls[0];
    expect(id).toBe('inv-1');
    expect(patch.status).toBe('paid');
    expect(patch.paidDate).toEqual(NOW);
  });

  it('propagates port errors to the caller', async () => {
    const updater: InvoiceStatusUpdater = {
      updateStatus: vi.fn().mockRejectedValue(new InvoiceNotFoundError()),
    };
    await expect(
      updateInvoiceStatus(updater, 'missing', { status: 'paid' }, NOW),
    ).rejects.toThrow(InvoiceNotFoundError);
  });
});
