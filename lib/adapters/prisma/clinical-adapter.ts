import { prisma } from '@/lib/prisma';
import { toClinicalDTO } from '@/lib/dashboard/clinical';
import type {
  ResolvedClinicalCreate,
  ClinicalReader,
  ClinicalWriter,
  LinkedProfileReader,
} from '@/lib/usecases/clinical';
import type { ClinicalConsultationRecord as ClinicalDTO } from '@/data/dashboardData';

// Prisma adapter implementing clinical ports. Prescription items are created
// as nested writes — the adapter owns how the aggregate persists.

export const prismaClinicalReader: ClinicalReader = {
  async list(): Promise<ClinicalDTO[]> {
    const rows = await prisma.clinicalConsultationRecord.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toClinicalDTO);
  },
};

export const prismaClinicalWriter: ClinicalWriter = {
  async create(resolved: ResolvedClinicalCreate, actorEmail: string): Promise<ClinicalDTO> {
    const { prescriptions, ...recordData } = resolved;
    const row = await prisma.clinicalConsultationRecord.create({
      data: {
        ...recordData,
        createdBy: actorEmail,
        items: prescriptions ? { create: prescriptions } : undefined,
      },
      include: { items: true },
    });
    return toClinicalDTO(row);
  },
};

export const prismaLinkedProfileReader: LinkedProfileReader = {
  async profileIdForAccount(accountId: string): Promise<string | null> {
    const row = await prisma.patientProfile.findUnique({
      where: { accountId },
      select: { id: true },
    });
    return row?.id ?? null;
  },
};
