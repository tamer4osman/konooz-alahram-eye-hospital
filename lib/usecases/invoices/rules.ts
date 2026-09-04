import type {
  CreateInvoiceInput,
  InvoiceCreateContext,
  InvoiceStatusPatch,
  InvoiceStatus,
  ResolvedInvoiceCreate,
} from './types';
import type { ResolvedStatusPatch } from './ports';

// Pure business rules. No framework, no I/O — fully unit-testable.

// ---------------------------------------------------------------------------
// Accounts-receivable aging (pure report rule)
// ---------------------------------------------------------------------------

export const AR_AGING_BUCKETS = ['0_30', '31_60', '61_90', '90_plus'] as const;

/** Fixed lookback for the aging trend: the reconstruction distance in days. */
export const AR_TREND_LOOKBACK_DAYS = 30;

export type ArAgingBucketKey = (typeof AR_AGING_BUCKETS)[number];

/** Minimal invoice facts the aging report consumes (entities vocabulary). */
export interface AgingInvoiceInput {
  status: InvoiceStatus;
  issuedDate: Date;
  totalGrossLYD: number;
}

/** Aging invoice with payment-date info for point-in-time reconstruction. */
export interface AgingSnapshotInvoiceInput extends AgingInvoiceInput {
  paidDate: Date | null;
}

export interface ArAgingBucket {
  key: ArAgingBucketKey;
  count: number;
  totalLYD: number;
}

export interface ArAgingReport {
  buckets: ArAgingBucket[];
  grandTotalLYD: number;
  outstandingCount: number;
}

const OUTSTANDING_STATUSES: ReadonlySet<InvoiceStatus> = new Set([
  'pending_insurance',
  'pre_auth_approved',
  'pending',
  'partially_paid',
]);

function bucketForAge(days: number): ArAgingBucketKey {
  if (days <= 30) return '0_30';
  if (days <= 60) return '31_60';
  if (days <= 90) return '61_90';
  return '90_plus';
}

/**
 * AR aging: outstanding invoices (not paid/cancelled/draft) bucketed by days
 * since issue. The full invoice amount counts as outstanding — partial
 * payments are not tracked yet, and the UI says so. All four buckets are
 * always present so the report shape is stable.
 */
export function computeArAging(
  invoices: AgingInvoiceInput[],
  now: Date,
): ArAgingReport {
  const totals = new Map<ArAgingBucketKey, { count: number; totalLYD: number }>(
    AR_AGING_BUCKETS.map((key) => [key, { count: 0, totalLYD: 0 }]),
  );
  let grandTotalLYD = 0;
  let outstandingCount = 0;

  for (const invoice of invoices) {
    if (!OUTSTANDING_STATUSES.has(invoice.status)) continue;
    // An invoice issued after the reference clock cannot be outstanding yet.
    if (invoice.issuedDate > now) continue;
    const ageDays = Math.max(0, Math.floor((now.getTime() - invoice.issuedDate.getTime()) / 86_400_000));
    const bucket = totals.get(bucketForAge(ageDays))!;
    bucket.count += 1;
    bucket.totalLYD += invoice.totalGrossLYD;
    grandTotalLYD += invoice.totalGrossLYD;
    outstandingCount += 1;
  }

  const buckets = AR_AGING_BUCKETS.map((key) => {
    const entry = totals.get(key)!;
    return { key, count: entry.count, totalLYD: Math.round(entry.totalLYD * 100) / 100 };
  });

  return {
    buckets,
    grandTotalLYD: Math.round(grandTotalLYD * 100) / 100,
    outstandingCount,
  };
}

/**
 * Point-in-time aging reconstruction: what AR aging looked like at a past
 * date. An invoice was outstanding at the snapshot when it was issued on or
 * before it and not yet paid (no paidDate, or paidDate after the snapshot).
 * Cancelled invoices issued before the snapshot are counted — their
 * cancellation date is not tracked, so the estimate slightly overstates
 * outstanding AR; the UI labels this reconstruction as an estimate.
 * Drafts never count (never billed).
 */
export function computeArAgingSnapshot(
  invoices: AgingSnapshotInvoiceInput[],
  asOf: Date,
): ArAgingReport {
  const total = new Map<ArAgingBucketKey, { count: number; totalLYD: number }>(
    AR_AGING_BUCKETS.map((key) => [key, { count: 0, totalLYD: 0 }]),
  );
  let grandTotalLYD = 0;
  let outstandingCount = 0;

  for (const invoice of invoices) {
    if (invoice.status === 'draft') continue;
    if (invoice.issuedDate > asOf) continue;
    const paid = invoice.paidDate !== null && invoice.paidDate <= asOf;
    if (paid) continue;

    const ageDays = Math.max(0, Math.floor((asOf.getTime() - invoice.issuedDate.getTime()) / 86_400_000));
    const bucket = total.get(bucketForAge(ageDays))!;
    bucket.count += 1;
    bucket.totalLYD += invoice.totalGrossLYD;
    grandTotalLYD += invoice.totalGrossLYD;
    outstandingCount += 1;
  }

  const buckets = AR_AGING_BUCKETS.map((key) => {
    const entry = total.get(key)!;
    return { key, count: entry.count, totalLYD: Math.round(entry.totalLYD * 100) / 100 };
  });

  return {
    buckets,
    grandTotalLYD: Math.round(grandTotalLYD * 100) / 100,
    outstandingCount,
  };
}

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
