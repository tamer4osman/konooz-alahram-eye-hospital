import { prisma } from '@/lib/prisma';
import { toSurgeryDTO } from '@/lib/dashboard/surgeries';
import { SurgeryNotFoundError } from '@/lib/usecases/surgeries';
import type {
  ResolvedSurgeryCreate,
  SurgeryPatch,
  SurgeryReader,
  SurgeryWriter,
} from '@/lib/usecases/surgeries';
import type { ScheduledSurgery as SurgeryDTO } from '@/data/dashboardData';

// Prisma adapter implementing surgery ports.

function toTypedError(err: unknown): unknown {
  const code = (err as { code?: string } | null | undefined)?.code;
  if (code === 'P2025') return new SurgeryNotFoundError();
  return err;
}

export const prismaSurgeryReader: SurgeryReader = {
  async list(): Promise<SurgeryDTO[]> {
    const rows = await prisma.scheduledSurgery.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toSurgeryDTO);
  },
};

export const prismaSurgeryWriter: SurgeryWriter = {
  async create(resolved: ResolvedSurgeryCreate): Promise<SurgeryDTO> {
    const row = await prisma.scheduledSurgery.create({ data: resolved });
    return toSurgeryDTO(row);
  },
  async update(id: string, patch: SurgeryPatch): Promise<SurgeryDTO> {
    try {
      const row = await prisma.scheduledSurgery.update({ where: { id }, data: patch });
      return toSurgeryDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
  async delete(id: string): Promise<void> {
    try {
      await prisma.scheduledSurgery.delete({ where: { id } });
    } catch (err) {
      throw toTypedError(err);
    }
  },
};
