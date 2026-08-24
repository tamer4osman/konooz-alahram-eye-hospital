import { SurgeryStatus, Gender } from '@prisma/client';
import { runSeed,
  loadSeedJson } from './seed-runner';

interface SeedSurgery {
  id: string;
  patientNameAr: string;
  patientNameEn: string;
  patientPhone: string;
  patientAge: number;
  gender: 'male' | 'female';
  surgeonAr: string;
  surgeonEn: string;
  procedureAr: string;
  procedureEn: string;
  specialtyId: string;
  roomCode: string;
  time: string;
  estimatedDurationMin: number;
  priority: string;
  status: SurgeryStatus;
  anesthesiaTypeAr: string;
  anesthesiaTypeEn: string;
}


runSeed(async (prisma) => {
  const surgeries = loadSeedJson<SeedSurgery[]>('surgeries.seed.json');

  for (const s of surgeries) {
    const data = {
      procedureAr: s.procedureAr,
      procedureEn: s.procedureEn,
      // Same-day schedule; the time string is the display source
      scheduledAt: new Date(),
      durationMin: s.estimatedDurationMin,
      status: s.status,
      patientNameAr: s.patientNameAr,
      patientNameEn: s.patientNameEn,
      patientPhone: s.patientPhone,
      patientAge: s.patientAge,
      gender: (s.gender === 'female' ? 'FEMALE' : 'MALE') as Gender,
      surgeonNameAr: s.surgeonAr,
      surgeonNameEn: s.surgeonEn,
      specialtyId: s.specialtyId,
      roomCode: s.roomCode,
      time: s.time,
      priority: s.priority,
      anesthesiaTypeAr: s.anesthesiaTypeAr,
      anesthesiaTypeEn: s.anesthesiaTypeEn,
    };
    await prisma.scheduledSurgery.upsert({ where: { id: s.id }, update: data, create: { id: s.id, ...data } });
  }
  console.log(`seeded ${surgeries.length} surgeries`);
});
