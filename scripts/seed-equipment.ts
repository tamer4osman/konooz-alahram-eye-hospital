import { DeviceStatus } from '@prisma/client';
import { runSeed,
  loadSeedJson } from './seed-runner';

interface SeedEquipment {
  id: string;
  nameAr: string;
  nameEn: string;
  brand: string;
  model: string;
  serialNumber: string;
  departmentAr: string;
  departmentEn: string;
  roomCode: string;
  status: DeviceStatus;
  uptimePercentage: number;
  totalProceduresRun: number;
  lastMaintenanceDate: string;
  nextServiceDue: string;
  firmwareVersion: string;
  technicianInChargeAr: string;
  technicianInChargeEn: string;
  healthScore: number;
  notesAr: string;
  notesEn: string;
}


runSeed(async (prisma) => {
  const items = loadSeedJson<SeedEquipment[]>('equipment.seed.json');

  for (const e of items) {
    const data = {
      nameAr: e.nameAr,
      nameEn: e.nameEn,
      modelNumber: e.model,
      status: e.status,
      brand: e.brand,
      serialNumber: e.serialNumber,
      departmentAr: e.departmentAr,
      departmentEn: e.departmentEn,
      roomCode: e.roomCode,
      uptimePercentage: e.uptimePercentage,
      totalProceduresRun: e.totalProceduresRun,
      lastMaintenanceDate: e.lastMaintenanceDate,
      nextServiceDue: e.nextServiceDue,
      firmwareVersion: e.firmwareVersion,
      technicianInChargeAr: e.technicianInChargeAr,
      technicianInChargeEn: e.technicianInChargeEn,
      healthScore: e.healthScore,
      notesAr: e.notesAr,
      notesEn: e.notesEn,
    };
    await prisma.equipment.upsert({ where: { id: e.id }, update: data, create: { id: e.id, ...data } });
  }
  console.log(`seeded ${items.length} equipment items`);
});
