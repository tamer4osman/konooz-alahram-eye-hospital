import type {
  CreateInvoiceInput,
  InvoiceCreateContext,
  InvoiceStatusPatch,
  ResolvedInvoiceCreate,
} from './types';
import type { ResolvedStatusPatch } from './ports';

// Pure business rules. No framework, no I/O — fully unit-testable.

/** Assign a timestamp-based invoice number when the caller did not supply one. */
export function generateInvoiceNumber(now: Date): string {
  return `INV-${now.getTime()}`;
}

/**
 * Resolve create input into a fully-persistable record:
 * - invoice number generated when absent
 * - serviceAr falls back to a non-empty medical-service label
 * - patientId synthesized from ticket number (booking-time snapshot model)
 * - amount mirrors totalGrossLYD
 * - default status: pending_insurance
 */
export function resolveInvoiceCreate(
  input: CreateInvoiceInput,
  ctx: InvoiceCreateContext,
): ResolvedInvoiceCreate {
  const totalGross = input.totalGrossLYD ?? 0;
  return {
    invoiceNumber: input.invoiceNumber ?? generateInvoiceNumber(ctx.now),
    ticketNumber: input.ticketNumber ?? '',
    patientId: `PT-${input.ticketNumber ?? ctx.now.getTime()}`,
    patientNameAr: input.patientNameAr ?? null,
    patientNameEn: input.patientNameEn ?? null,
    serviceAr: input.procedureAr ?? 'خدمة طبية',
    serviceEn: input.procedureEn ?? null,
    insuranceNameAr: input.insuranceNameAr ?? '',
    insuranceNameEn: input.insuranceNameEn ?? null,
    surgeonFeeLYD: input.surgeonFeeLYD ?? 0,
    orFacilityFeeLYD: input.orFacilityFeeLYD ?? 0,
    anesthesiaFeeLYD: input.anesthesiaFeeLYD ?? 0,
    lensOrDeviceFeeLYD: input.lensOrDeviceFeeLYD ?? 0,
    consumablesFeeLYD: input.consumablesFeeLYD ?? 0,
    totalGrossLYD: totalGross,
    insuranceCoveredLYD: input.insuranceCoveredLYD ?? 0,
    patientCoPayLYD: input.patientCoPayLYD ?? 0,
    amount: totalGross,
    status: input.status ?? 'pending_insurance',
    issuedDate: ctx.now,
    createdBy: ctx.actorEmail,
  };
}

/**
 * Stamp paidDate at the moment of transition when a status change marks the
 * invoice paid and the caller did not supply a date. Idempotent: an explicit
 * paidDate (including null, i.e. "unpay") always wins. Wire-format ISO
 * strings are normalized to Date for the persistence layer.
 */
export function resolveStatusPatch(
  patch: InvoiceStatusPatch,
  now: Date,
): ResolvedStatusPatch {
  const { paidDate, ...rest } = patch;
  const normalized: ResolvedStatusPatch = {
    ...rest,
    paidDate: paidDate === undefined ? undefined : paidDate === null ? null : new Date(paidDate),
  };
  if (patch.status === 'paid' && !normalized.paidDate) {
    return { ...normalized, paidDate: now };
  }
  return normalized;
}
