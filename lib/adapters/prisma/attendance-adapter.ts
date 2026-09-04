import { prisma } from '@/lib/prisma';
import { toAttendanceDTO } from '@/lib/dashboard/attendance';
import { AttendanceNotFoundError } from '@/lib/usecases/attendance';
import type {
  AttendancePatch,
  ResolvedAttendanceCreate,
  AttendanceReader,
  AttendanceWriter,
} from '@/lib/usecases/attendance';
import type { StaffAttendanceRecord as AttendanceDTO } from '@/data/dashboardData';

// Prisma adapter implementing attendance ports.

function toTypedError(err: unknown): unknown {
  const code = (err as { code?: string } | null | undefined)?.code;
  if (code === 'P2025') return new AttendanceNotFoundError();
  return err;
}

export const prismaAttendanceReader: AttendanceReader = {
  async list(): Promise<AttendanceDTO[]> {
    const rows = await prisma.staffAttendanceRecord.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return rows.map(toAttendanceDTO);
  },
};

export const prismaAttendanceWriter: AttendanceWriter = {
  async create(resolved: ResolvedAttendanceCreate): Promise<AttendanceDTO> {
    const row = await prisma.staffAttendanceRecord.create({ data: resolved });
    return toAttendanceDTO(row);
  },
  async update(id: string, patch: AttendancePatch): Promise<AttendanceDTO> {
    try {
      const row = await prisma.staffAttendanceRecord.update({
        where: { id },
        data: patch,
      });
      return toAttendanceDTO(row);
    } catch (err) {
      throw toTypedError(err);
    }
  },
  async delete(id: string): Promise<void> {
    try {
      await prisma.staffAttendanceRecord.delete({ where: { id } });
    } catch (err) {
      throw toTypedError(err);
    }
  },
};
