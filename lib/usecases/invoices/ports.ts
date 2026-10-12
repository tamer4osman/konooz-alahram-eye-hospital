import type {
  ResolvedInvoiceCreate,
  ResolvedStatusPatch,
} from './types';
import type { AgingSnapshotInvoiceInput } from './rules';
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

/**
 * Reader port for the aging trend use case (extended ISP slice). Rows carry
 * `paidDate` so the snapshot rule can tell "paid since then" apart from
 * "still outstanding"; the absence of a cancellation timestamp is a
 * documented estimate bias of the reconstruction.
 */
export interface AgingSnapshotReader {
  listForAging(): Promise<AgingSnapshotInvoiceInput[]>;
}
