import { prisma } from '@/lib/prisma';
import { toInvoiceDTO } from '@/lib/dashboard/billing';
import {
  InvoiceConflictError,
  InvoiceNotFoundError,
} from '@/lib/usecases/invoices';
import type {
  AgingSnapshotReader,
  AgingSnapshotInvoiceInput,
  InvoiceReader,
  InvoiceStatusUpdater,
  InvoiceWriter,
  ResolvedInvoiceCreate,
  ResolvedStatusPatch,
} from '@/lib/usecases/invoices';
import type { HospitalBillingInvoice as InvoiceDTO } from '@/data/dashboardData';

// Prisma adapter implementing the invoice use-case ports. This is the only
// place the invoice flow touches the driver: Prisma error codes are
// translated to typed use-case errors here, and rows are mapped to DTOs via
// lib/dashboard/billing.ts so Prisma types never cross the boundary.

function toTypedError(err: unknown): unknown {
  const code = (err as { code?: string } | null | undefined)?.code;
  if (code === 'P2025') return new InvoiceNotFoundError();
  if (code === 'P2002') return new InvoiceConflictError();
  return err;
}

export const prismaInvoiceReader: InvoiceReader = {
  async list(): Promise<InvoiceDTO[]> {
    const rows = await prisma.hospitalBillingInvoice.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toInvoiceDTO);
  },
};

export const prismaAgingSnapshotReader: AgingSnapshotReader = {
  async listForAging(): Promise<AgingSnapshotInvoiceInput[]> {
    const rows = await prisma.hospitalBillingInvoice.findMany({
      select: { status: true, issuedDate: true, paidDate: true, totalGrossLYD: true },
    });
    return rows.map((row) => ({
      status: row.status as AgingSnapshotInvoiceInput['status'],
      issuedDate: row.issuedDate,
      paidDate: row.paidDate,
      totalGrossLYD: Number(row.totalGrossLYD),
    }));
  },
};

export const prismaInvoiceWriter: InvoiceWriter = {
  async create(resolved: ResolvedInvoiceCreate): Promise<InvoiceDTO> {
    try {
      const row = await prisma.hospitalBillingInvoice.create({
        data: {
          invoiceNumber: resolved.invoiceNumber,
          ticketNumber: resolved.ticketNumber,
          patientId: resolved.patientId,
          patientNameAr: resolved.patientNameAr,
          patientNameEn: resolved.patientNameEn,
          serviceAr: resolved.serviceAr,
          serviceEn: resolved.serviceEn,
          insuranceNameAr: resolved.insuranceNameAr,
          insuranceNameEn: resolved.insuranceNameEn,
          surgeonFeeLYD: resolved.surgeonFeeLYD,
          orFacilityFeeLYD: resolved.orFacilityFeeLYD,
          anesthesiaFeeLYD: resolved.anesthesiaFeeLYD,
          lensOrDeviceFeeLYD: resolved.lensOrDeviceFeeLYD,
          consumablesFeeLYD: resolved.consumablesFeeLYD,
          totalGrossLYD: resolved.totalGrossLYD,
          insuranceCoveredLYD: resolved.insuranceCoveredLYD,
          patientCoPayLYD: resolved.patientCoPayLYD,
          amount: resolved.amount,
          status: resolved.status,
          issuedDate: resolved.issuedDate,
          createdBy: resolved.createdBy,
        },
      });
      return toInvoiceDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
};

export const prismaInvoiceStatusUpdater: InvoiceStatusUpdater = {
  async updateStatus(id: string, patch: ResolvedStatusPatch): Promise<InvoiceDTO> {
    try {
      const row = await prisma.hospitalBillingInvoice.update({
        where: { id },
        data: {
          ...(patch.status !== undefined ? { status: patch.status } : {}),
          ...(patch.paidDate !== undefined ? { paidDate: patch.paidDate } : {}),
        },
      });
      return toInvoiceDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
};
