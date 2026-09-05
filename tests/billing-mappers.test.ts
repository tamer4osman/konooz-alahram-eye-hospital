import { describe, it, expect } from 'vitest';
import { Prisma } from '@prisma/client';
import { toInvoiceDTO } from '@/lib/dashboard/billing';
import type { HospitalBillingInvoice } from '@prisma/client';

// Mapper tests: Prisma rows carry exact-money Decimal fields; DTOs must
// expose plain JS numbers so dashboard components and JSON responses
// never receive Decimal instances.

function makeRow(overrides: Partial<HospitalBillingInvoice> = {}): HospitalBillingInvoice {
  return {
    id: 'inv-1',
    patientId: 'PT-T-100',
    patientRefId: null,
    patientNameAr: 'أحمد',
    patientNameEn: 'Ahmed',
    serviceAr: 'ساد الماء الأبيض',
    serviceEn: 'Cataract surgery',
    amount: new Prisma.Decimal(2600),
    currency: 'LYD',
    status: 'pending_insurance',
    issuedDate: new Date('2026-09-03T10:00:00.000Z'),
    paidDate: null,
    notesAr: null,
    notesEn: null,
    createdBy: 'actor@example.com',
    createdAt: new Date('2026-09-03T10:00:00.000Z'),
    updatedAt: new Date('2026-09-03T10:00:00.000Z'),
    invoiceNumber: 'INV-1',
    ticketNumber: 'T-100',
    insuranceNameAr: 'التأمين الوطني',
    insuranceNameEn: 'National Insurance',
    surgeonFeeLYD: new Prisma.Decimal(1000),
    orFacilityFeeLYD: new Prisma.Decimal(500),
    anesthesiaFeeLYD: new Prisma.Decimal(200.5),
    lensOrDeviceFeeLYD: new Prisma.Decimal(800),
    consumablesFeeLYD: new Prisma.Decimal(100),
    totalGrossLYD: new Prisma.Decimal(2600.5),
    insuranceCoveredLYD: new Prisma.Decimal(1800),
    patientCoPayLYD: new Prisma.Decimal(800.5),
    ...overrides,
  } as HospitalBillingInvoice;
}

describe('toInvoiceDTO money conversion', () => {
  it('converts every Decimal fee field to a plain number', () => {
    const dto = toInvoiceDTO(makeRow());
    expect(dto.surgeonFeeLYD).toBe(1000);
    expect(dto.orFacilityFeeLYD).toBe(500);
    expect(dto.anesthesiaFeeLYD).toBe(200.5);
    expect(dto.lensOrDeviceFeeLYD).toBe(800);
    expect(dto.consumablesFeeLYD).toBe(100);
    expect(dto.totalGrossLYD).toBe(2600.5);
    expect(dto.insuranceCoveredLYD).toBe(1800);
    expect(dto.patientCoPayLYD).toBe(800.5);
  });

  it('never leaks Decimal instances into the DTO', () => {
    const dto = toInvoiceDTO(makeRow());
    const feeValues = [
      dto.surgeonFeeLYD,
      dto.orFacilityFeeLYD,
      dto.anesthesiaFeeLYD,
      dto.lensOrDeviceFeeLYD,
      dto.consumablesFeeLYD,
      dto.totalGrossLYD,
      dto.insuranceCoveredLYD,
      dto.patientCoPayLYD,
    ];
    for (const value of feeValues) {
      expect(typeof value).toBe('number');
      expect(value).not.toBeInstanceOf(Prisma.Decimal);
    }
  });

  it('preserves exact 2dp values through the conversion', () => {
    const row = makeRow({ totalGrossLYD: new Prisma.Decimal('12345.67') });
    expect(toInvoiceDTO(row).totalGrossLYD).toBe(12345.67);
  });

  it('maps issuedDate to a YYYY-MM-DD string', () => {
    expect(toInvoiceDTO(makeRow()).dateIssued).toBe('2026-09-03');
  });
});
