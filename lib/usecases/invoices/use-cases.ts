import type { HospitalBillingInvoice as InvoiceDTO } from '@/data/dashboardData';
import type {
  CreateInvoiceInput,
  InvoiceCreateContext,
  InvoiceStatusPatch,
} from './types';
import type { InvoiceReader, InvoiceStatusUpdater, InvoiceWriter } from './ports';
import { resolveInvoiceCreate, resolveStatusPatch } from './rules';

// Use cases: orchestration only. Business rules live in rules.ts; ports are
// injected as first arguments. Errors propagate from the adapter unchanged —
// the route handler maps them onto HTTP responses.

export async function listInvoices(reader: InvoiceReader): Promise<InvoiceDTO[]> {
  return reader.list();
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
