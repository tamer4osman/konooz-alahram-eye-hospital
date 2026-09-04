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

// Prisma adapter implementing consumable ports. The expiryDate string↔Date
// conversion lives at this boundary (2026-09-04 grilling, Q2): the API keeps
// speaking ISO strings, the driver stores real timestamps.

/** Parse an ISO 'YYYY-MM-DD' string at UTC midnight; throws on garbage. */
function parseExpiryOrThrow(value: string): Date {
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid expiryDate: ${value}`);
  }
  return parsed;
}

/** '' / null -> null (clear), undefined -> untouched, ISO string -> Date. */
function toCreateData(resolved: ResolvedConsumableCreate) {
  return {
    ...resolved,
    expiryDate:
      resolved.expiryDate === null || resolved.expiryDate === ''
        ? null
        : resolved.expiryDate !== undefined
          ? parseExpiryOrThrow(resolved.expiryDate)
          : null,
  };
}

function toPatchData(patch: ConsumablePatch) {
  const { expiryDate, ...rest } = patch;
  if (expiryDate === undefined) return rest;
  return {
    ...rest,
    expiryDate: expiryDate === null || expiryDate === '' ? null : parseExpiryOrThrow(expiryDate),
  };
}

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
    const row = await prisma.consumableType.create({ data: toCreateData(resolved) });
    return toConsumableDTO(row);
  },
  async update(id: string, patch: ConsumablePatch): Promise<ConsumableDTO> {
    try {
      const row = await prisma.consumableType.update({
        where: { id },
        data: toPatchData(patch),
      });
      return toConsumableDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
};
