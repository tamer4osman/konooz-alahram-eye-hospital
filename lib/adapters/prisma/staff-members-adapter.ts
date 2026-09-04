import { prisma } from '@/lib/prisma';
import type { StaffMember } from '@prisma/client';
import {
  resolveDeactivation,
} from '@/lib/usecases/staff-members';
import type {
  ResolvedStaffMemberCreate,
  StaffDirectoryReader,
  StaffDirectoryWriter,
} from '@/lib/usecases/staff-members';

// Prisma adapter implementing the staff-directory ports. DTO mapping for the
// dashboard board stays here so Prisma types never cross the boundary.

function toStaffMemberDTO(row: StaffMember) {
  return {
    id: row.id,
    nameAr: row.nameAr,
    nameEn: row.nameEn ?? '',
    roleAr: row.roleAr,
    roleEn: row.roleEn ?? '',
    category: row.category,
    departmentAr: row.departmentAr,
    departmentEn: row.departmentEn ?? '',
    status: row.status,
    roomAssignedAr: row.roomAssignedAr,
    roomAssignedEn: row.roomAssignedEn ?? '',
    shift: row.shift,
    patientCountToday: row.patientCountToday,
    surgeriesCountToday: row.surgeriesCountToday,
    phone: row.phone ?? '',
    email: row.email ?? '',
    avatar: row.avatar ?? '',
    rating: row.rating,
  };
}

export const prismaStaffDirectoryReader: StaffDirectoryReader = {
  async listActive() {
    const rows = await prisma.staffMember.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    return rows.map(toStaffMemberDTO);
  },
};

export const prismaStaffDirectoryWriter: StaffDirectoryWriter = {
  async maxSortOrder(): Promise<number> {
    const agg = await prisma.staffMember.aggregate({ _max: { sortOrder: true } });
    return agg._max.sortOrder ?? -1;
  },
  async create(resolved: ResolvedStaffMemberCreate) {
    const row = await prisma.staffMember.create({ data: resolved });
    return toStaffMemberDTO(row);
  },
  async updateStatus(id: string, status: string) {
    const row = await prisma.staffMember.update({ where: { id }, data: { status } });
    return toStaffMemberDTO(row);
  },
  async deactivate(id: string): Promise<void> {
    await prisma.staffMember.update({ where: { id }, data: resolveDeactivation() });
  },
};
