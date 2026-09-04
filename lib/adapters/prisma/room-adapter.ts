import { prisma } from '@/lib/prisma';
import { toRoomDTO } from '@/lib/dashboard/rooms';
import {
  RoomConflictError,
  RoomNotFoundError,
} from '@/lib/usecases/rooms';
import type {
  RoomPatch,
  ResolvedRoomCreate,
  RoomReader,
  RoomWriter,
} from '@/lib/usecases/rooms';
import type { HospitalRoom as RoomDTO } from '@/data/dashboardData';

// Prisma adapter implementing room ports. Error-code translation lives here.

function toTypedError(err: unknown): unknown {
  const code = (err as { code?: string } | null | undefined)?.code;
  if (code === 'P2025') return new RoomNotFoundError();
  if (code === 'P2002') return new RoomConflictError();
  return err;
}

export const prismaRoomReader: RoomReader = {
  async list(): Promise<RoomDTO[]> {
    const rows = await prisma.room.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map(toRoomDTO);
  },
};

export const prismaRoomWriter: RoomWriter = {
  async create(resolved: ResolvedRoomCreate): Promise<RoomDTO> {
    try {
      const row = await prisma.room.create({ data: resolved });
      return toRoomDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
  async update(id: string, patch: RoomPatch): Promise<RoomDTO> {
    try {
      const row = await prisma.room.update({ where: { id }, data: patch });
      return toRoomDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
  async delete(id: string): Promise<void> {
    try {
      await prisma.room.delete({ where: { id } });
    } catch (err) {
      throw toTypedError(err);
    }
  },
};
