import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient, StaffCategory } from '@prisma/client';

interface SeedStaff {
  id: string;
  nameAr: string;
  nameEn: string;
  roleAr: string;
  roleEn: string;
  category: string;
  departmentAr: string;
  departmentEn: string;
  status: string;
  roomAssignedAr: string;
  roomAssignedEn: string;
  shift: string;
  patientCountToday: number;
  surgeriesCountToday: number;
  phone: string;
  email: string;
  avatar: string;
  rating: number;
}

const CATEGORIES: StaffCategory[] = ['surgeon', 'consultant', 'resident', 'nurse', 'technician', 'admin'];

const prisma = new PrismaClient();

async function main() {
  const staff = JSON.parse(
    readFileSync(join(__dirname, 'staff-members.seed.json'), 'utf8'),
  ) as SeedStaff[];

  for (const [idx, s] of staff.entries()) {
    const data = {
      nameAr: s.nameAr,
      nameEn: s.nameEn,
      roleAr: s.roleAr,
      roleEn: s.roleEn,
      category: CATEGORIES.includes(s.category as StaffCategory) ? (s.category as StaffCategory) : 'nurse',
      departmentAr: s.departmentAr,
      departmentEn: s.departmentEn,
      status: s.status,
      roomAssignedAr: s.roomAssignedAr ?? '',
      roomAssignedEn: s.roomAssignedEn,
      shift: s.shift,
      patientCountToday: s.patientCountToday ?? 0,
      surgeriesCountToday: s.surgeriesCountToday ?? 0,
      phone: s.phone,
      email: s.email,
      avatar: s.avatar,
      rating: s.rating ?? 4.5,
      sortOrder: idx,
    };
    const existing = await prisma.staffMember.findFirst({ where: { nameEn: s.nameEn } });
    if (existing) {
      await prisma.staffMember.update({ where: { id: existing.id }, data });
    } else {
      await prisma.staffMember.create({ data });
    }
  }
  console.log(`seeded ${staff.length} staff members`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
