import { prisma } from '@/lib/prisma';
import { toConsumableDTO } from '@/lib/dashboard/consumables';
import { ConsumableNotFoundError } from '@/lib/usecases/consumables';
import type {
  ConsumablePatch,
  ResolvedConsumableCreate,
  ConsumableReader,
  ConsumableWriter,
} from '@/lib/usecases/consumables';
import type { SurgicalConsumable as ConsumableDTO } from '@/data/dashboardData';

// Prisma adapter implementing consumable ports.

function toTypedError(err: unknown): unknown {
  const code = (err as { code?: string } | null | undefined)?.code;
  if (code === 'P2025') return new ConsumableNotFoundError();
  return err;
}

export const prismaConsumableReader: ConsumableReader = {
  async list(): Promise<ConsumableDTO[]> {
    const rows = await prisma.consumableType.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toConsumableDTO);
  },
};

export const prismaConsumableWriter: ConsumableWriter = {
  async create(resolved: ResolvedConsumableCreate): Promise<ConsumableDTO> {
    const row = await prisma.consumableType.create({ data: resolved });
    return toConsumableDTO(row);
  },
  async update(id: string, patch: ConsumablePatch): Promise<ConsumableDTO> {
    try {
      const row = await prisma.consumableType.update({ where: { id }, data: patch });
      return toConsumableDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
};
