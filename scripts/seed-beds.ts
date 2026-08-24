import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PrismaClient, WardType, BedStatus } from '@prisma/client';

interface SeedBed {
  id: string;
  bedNumber: string;
  wardType: WardType;
  wardNameAr: string;
  wardNameEn: string;
  floorAr: string;
  floorEn: string;
  status: BedStatus;
  patientId?: string;
  patientNameAr?: string;
  patientNameEn?: string;
  patientAge?: number;
  assignedDoctorAr?: string;
  assignedDoctorEn?: string;
  surgeryPerformedAr?: string;
  surgeryPerformedEn?: string;
  admissionTime?: string;
  estimatedDischargeTime?: string;
  bloodPressure?: string;
  heartRateBpm?: number;
  spO2Percent?: number;
  tempCelsius?: number;
  painScore?: number;
  nurseInChargeAr?: string;
  nurseInChargeEn?: string;
}

const prisma = new PrismaClient();

async function main() {
  const beds = JSON.parse(
    readFileSync(join(__dirname, 'beds.seed.json'), 'utf8'),
  ) as SeedBed[];

  for (const b of beds) {
    const data = {
      bedNumber: b.bedNumber,
      wardType: b.wardType,
      wardNameAr: b.wardNameAr,
      wardNameEn: b.wardNameEn,
      floorAr: b.floorAr,
      floorEn: b.floorEn,
      status: b.status,
      patientId: b.patientId ?? null,
      patientNameAr: b.patientNameAr ?? null,
      patientNameEn: b.patientNameEn ?? null,
      patientAge: b.patientAge ?? null,
      assignedDoctorAr: b.assignedDoctorAr ?? null,
      assignedDoctorEn: b.assignedDoctorEn ?? null,
      surgeryPerformedAr: b.surgeryPerformedAr ?? null,
      surgeryPerformedEn: b.surgeryPerformedEn ?? null,
      admissionTime: b.admissionTime ?? null,
      estimatedDischargeTime: b.estimatedDischargeTime ?? null,
      bloodPressure: b.bloodPressure ?? null,
      heartRateBpm: b.heartRateBpm ?? null,
      spO2Percent: b.spO2Percent ?? null,
      tempCelsius: b.tempCelsius ?? null,
      painScore: b.painScore ?? null,
      nurseInChargeAr: b.nurseInChargeAr ?? null,
      nurseInChargeEn: b.nurseInChargeEn ?? null,
    };
    await prisma.bed.upsert({ where: { id: b.id }, update: data, create: { id: b.id, ...data } });
  }
  console.log(`seeded ${beds.length} beds`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
