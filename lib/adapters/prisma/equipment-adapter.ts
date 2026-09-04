import { prisma } from '@/lib/prisma';
import { toEquipmentDTO } from '@/lib/dashboard/equipment';
import { EquipmentNotFoundError } from '@/lib/usecases/equipment';
import type {
  EquipmentPatch,
  ResolvedEquipmentCreate,
  EquipmentReader,
  EquipmentWriter,
} from '@/lib/usecases/equipment';
import type { HospitalEquipment as EquipmentDTO } from '@/data/dashboardData';

// Prisma adapter implementing equipment ports.

function toTypedError(err: unknown): unknown {
  const code = (err as { code?: string } | null | undefined)?.code;
  if (code === 'P2025') return new EquipmentNotFoundError();
  return err;
}

export const prismaEquipmentReader: EquipmentReader = {
  async list(): Promise<EquipmentDTO[]> {
    const rows = await prisma.equipment.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toEquipmentDTO);
  },
};

export const prismaEquipmentWriter: EquipmentWriter = {
  async create(resolved: ResolvedEquipmentCreate): Promise<EquipmentDTO> {
    const row = await prisma.equipment.create({ data: resolved });
    return toEquipmentDTO(row);
  },
  async update(id: string, patch: EquipmentPatch): Promise<EquipmentDTO> {
    try {
      const row = await prisma.equipment.update({ where: { id }, data: patch });
      return toEquipmentDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
  async delete(id: string): Promise<void> {
    try {
      await prisma.equipment.delete({ where: { id } });
    } catch (err) {
      throw toTypedError(err);
    }
  },
};
