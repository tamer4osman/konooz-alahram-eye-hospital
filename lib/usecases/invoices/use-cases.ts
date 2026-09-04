import type { HospitalBillingInvoice as InvoiceDTO } from '@/data/dashboardData';
import type {
  CreateInvoiceInput,
  InvoiceCreateContext,
  InvoiceStatusPatch,
} from './types';
import type { InvoiceReader, InvoiceStatusUpdater, InvoiceWriter } from './ports';
import type { AgingSnapshotReader } from './ports';
import { computeArAging, computeArAgingSnapshot, resolveInvoiceCreate, resolveStatusPatch, AR_TREND_LOOKBACK_DAYS, type ArAgingReport } from './rules';

// Use cases: orchestration only. Business rules live in rules.ts; ports are
// injected as first arguments. Errors propagate from the adapter unchanged —
// the route handler maps them onto HTTP responses.

export async function listInvoices(reader: InvoiceReader): Promise<InvoiceDTO[]> {
  return reader.list();
}

/** Aging trend: the live report plus a point-in-time reconstruction from `lookbackDays` ago. */
export interface ArAgingTrendReport {
  current: ArAgingReport;
  previous: ArAgingReport;
  lookbackDays: number;
}

export async function loadInvoiceAgingTrend(
  reader: AgingSnapshotReader,
  now: Date = new Date(),
): Promise<ArAgingTrendReport> {
  const invoices = await reader.listForAging();
  const previous = new Date(now.getTime() - AR_TREND_LOOKBACK_DAYS * 86_400_000);
  return {
    current: computeArAging(invoices, now),
    previous: computeArAgingSnapshot(invoices, previous),
    lookbackDays: AR_TREND_LOOKBACK_DAYS,
  };
}

export async function createInvoice(
  writer: InvoiceWriter,
  input: CreateInvoiceInput,
  ctx: InvoiceCreateContext,
): Promise<InvoiceDTO> {
  return writer.create(resolveInvoiceCreate(input, ctx));
}

export async function updateInvoiceStatus(
  updater: InvoiceStatusUpdater,
  id: string,
  patch: InvoiceStatusPatch,
  now: Date = new Date(),
): Promise<InvoiceDTO> {
  return updater.updateStatus(id, resolveStatusPatch(patch, now));
}
