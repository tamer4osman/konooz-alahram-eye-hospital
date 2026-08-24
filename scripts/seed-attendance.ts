import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient, ShiftType, AttendanceStatus, StaffCategory } from '@prisma/client';

interface SeedAttendance {
  id: string;
  staffId: string;
  staffNameAr: string;
  staffNameEn: string;
  roleAr: string;
  roleEn: string;
  avatar: string;
  category: StaffCategory;
  departmentAr: string;
  departmentEn: string;
  shiftType: ShiftType;
  shiftNameAr: string;
  shiftNameEn: string;
  shiftTiming: string;
  scheduledTime: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  punctualityMinutes: number;
  overtimeHours: number;
  monthlyAttendanceRate: number;
  badgeCode: string;
  notesAr: string;
  notesEn: string;
}

const prisma = new PrismaClient();

async function main() {
  const records = JSON.parse(
    readFileSync(join(__dirname, 'attendance.seed.json'), 'utf8'),
  ) as SeedAttendance[];

  for (const r of records) {
    const data = {
      staffId: r.staffId,
      staffNameAr: r.staffNameAr,
      staffNameEn: r.staffNameEn,
      shiftType: r.shiftType,
      date: new Date(),
      status: r.status,
      checkInTime: r.checkInTime,
      checkOutTime: r.checkOutTime,
      notesAr: r.notesAr ?? null,
      notesEn: r.notesEn ?? null,
      roleAr: r.roleAr,
      roleEn: r.roleEn,
      avatar: r.avatar,
      category: r.category,
      departmentAr: r.departmentAr,
      departmentEn: r.departmentEn,
      shiftNameAr: r.shiftNameAr,
      shiftNameEn: r.shiftNameEn,
      shiftTiming: r.shiftTiming,
      scheduledTime: r.scheduledTime,
      punctualityMinutes: r.punctualityMinutes,
      overtimeHours: r.overtimeHours,
      monthlyAttendanceRate: r.monthlyAttendanceRate,
      badgeCode: r.badgeCode,
    };
    await prisma.staffAttendanceRecord.upsert({ where: { id: r.id }, update: data, create: { id: r.id, ...data } });
  }
  console.log(`seeded ${records.length} attendance records`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
