import { prisma } from '@/lib/prisma';
import { toInsurerDTO, toPacsDTO } from '@/lib/dashboard/billing';
import type { BillingReader } from '@/lib/usecases/billing';

// Prisma adapter for the billing read model. Row→DTO mapping via
// lib/dashboard/billing.ts mappers; Prisma types never cross the boundary.

export const prismaBillingReader: BillingReader = {
  async listBoard() {
    const [insurers, pacs] = await Promise.all([
      prisma.insuranceProvider.findMany({ orderBy: { createdAt: 'asc' } }),
      prisma.diagnosticPacsOrder.findMany({ orderBy: { orderedAt: 'desc' } }),
    ]);
    return { insurances: insurers.map(toInsurerDTO), pacsOrders: pacs.map(toPacsDTO) };
  },
};
