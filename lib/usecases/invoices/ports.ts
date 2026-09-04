import type {
  InvoiceStatusPatch,
  ResolvedInvoiceCreate,
} from './types';
import type { HospitalBillingInvoice as InvoiceDTO } from '@/data/dashboardData';

// Per-use-case minimal ports (ISP): each interface declares only the
// operations its use case performs. One shared Prisma adapter implements
// all of them (lib/adapters/prisma/invoice-adapter.ts).
//
// Ports return the frontend DTO — mapping Prisma rows to DTOs lives in the
// adapter via lib/dashboard/billing.ts toInvoiceDTO, so the use-case layer
// never touches framework types.

export interface InvoiceReader {
  list(): Promise<InvoiceDTO[]>;
}

export interface InvoiceWriter {
  create(resolved: ResolvedInvoiceCreate): Promise<InvoiceDTO>;
}

export interface InvoiceStatusUpdater {
  updateStatus(id: string, patch: ResolvedStatusPatch): Promise<InvoiceDTO>;
}

/** Status patch the adapter must persist (paidDate pre-resolved to Date). */
export interface ResolvedStatusPatch {
  status?: InvoiceStatusPatch['status'];
  paidDate?: Date | null;
}
