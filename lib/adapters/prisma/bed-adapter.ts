import { prisma } from '@/lib/prisma';
import { toBedDTO } from '@/lib/dashboard/beds';
import {
  BedConflictError,
  BedNotFoundError,
} from '@/lib/usecases/beds';
import type {
  BedPatch,
  ResolvedBedCreate,
  BedReader,
  BedWriter,
} from '@/lib/usecases/beds';
import type { HospitalBed as BedDTO } from '@/data/dashboardData';

// Prisma adapter implementing bed ports. Error-code translation lives here.

function toTypedError(err: unknown): unknown {
  const code = (err as { code?: string } | null | undefined)?.code;
  if (code === 'P2025') return new BedNotFoundError();
  if (code === 'P2002') return new BedConflictError();
  return err;
}

export const prismaBedReader: BedReader = {
  async list(): Promise<BedDTO[]> {
    const rows = await prisma.bed.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toBedDTO);
  },
};

export const prismaBedWriter: BedWriter = {
  async create(resolved: ResolvedBedCreate): Promise<BedDTO> {
    try {
      const row = await prisma.bed.create({ data: resolved });
      return toBedDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
  async update(id: string, patch: BedPatch): Promise<BedDTO> {
    try {
      const row = await prisma.bed.update({ where: { id }, data: patch });
      return toBedDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
};
