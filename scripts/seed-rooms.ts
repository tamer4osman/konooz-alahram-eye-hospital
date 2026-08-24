import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient, RoomType, RoomStatus } from '@prisma/client';

interface SeedRoom {
  id: string;
  nameAr: string;
  nameEn: string;
  code: string;
  type: RoomType;
  floorAr: string;
  floorEn: string;
  status: RoomStatus;
  currentDoctorAr?: string;
  currentDoctorEn?: string;
  currentPatientId?: string;
  currentProcedureAr?: string;
  currentProcedureEn?: string;
  sterilizationStatus: string;
  airPressureHepa: string;
  tempCelsius: number;
  humidityPercent: number;
  capacity: number;
  occupiedCount: number;
  mainDeviceAssignedAr: string;
  mainDeviceAssignedEn: string;
}

const prisma = new PrismaClient();

async function main() {
  const rooms = JSON.parse(
    readFileSync(join(__dirname, 'rooms.seed.json'), 'utf8'),
  ) as SeedRoom[];

  for (const r of rooms) {
    const data = {
      code: r.code,
      nameAr: r.nameAr,
      nameEn: r.nameEn,
      type: r.type,
      status: r.status,
      floorAr: r.floorAr,
      floorEn: r.floorEn,
      currentDoctorAr: r.currentDoctorAr ?? null,
      currentDoctorEn: r.currentDoctorEn ?? null,
      currentPatientId: r.currentPatientId ?? null,
      currentProcedureAr: r.currentProcedureAr ?? null,
      currentProcedureEn: r.currentProcedureEn ?? null,
      sterilizationStatus: r.sterilizationStatus,
      airPressureHepa: r.airPressureHepa,
      tempCelsius: r.tempCelsius,
      humidityPercent: r.humidityPercent,
      capacity: r.capacity,
      occupiedCount: r.occupiedCount,
      mainDeviceAssignedAr: r.mainDeviceAssignedAr,
      mainDeviceAssignedEn: r.mainDeviceAssignedEn,
    };
    await prisma.room.upsert({ where: { id: r.id }, update: data, create: { id: r.id, ...data } });
  }
  console.log(`seeded ${rooms.length} rooms`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
