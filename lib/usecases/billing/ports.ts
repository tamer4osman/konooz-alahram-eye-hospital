import type {
  InsuranceProviderInfo,
  DiagnosticPacsOrder as PacsDTO,
} from '@/data/dashboardData';

// Billing read-model use case. The dashboard billing board fetches insurers
// and PACS orders in one round-trip. Read-only — no writer port today; add
// one when BCK billing writes arrive.

export interface BillingReader {
  listBoard(): Promise<{ insurances: InsuranceProviderInfo[]; pacsOrders: PacsDTO[] }>;
}

export type BillingBoard = Awaited<ReturnType<BillingReader['listBoard']>>;
