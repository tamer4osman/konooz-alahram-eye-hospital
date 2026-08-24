import { runSeed,
  loadSeedJson } from './seed-runner';

interface SeedDoctor {
  id: string;
  nameAr: string;
  nameEn: string;
  titleAr: string;
  titleEn: string;
  doctorType: 'visiting' | 'local';
  specialtyId: string;
  specialtyAr: string;
  specialtyEn: string;
  originAr: string;
  originEn: string;
  universityAr: string;
  universityEn: string;
  status: 'available_now' | 'upcoming_visit' | 'regular';
  visitScheduleAr: string;
  visitScheduleEn: string;
  experienceYears: number;
  surgeriesCount: string;
  photoSeed: string;
  highlightsAr: string[];
  highlightsEn: string[];
}


function toAvailability(status: SeedDoctor['status']) {
  if (status === 'available_now') return 'AVAILABLE_NOW' as const;
  if (status === 'upcoming_visit') return 'UPCOMING_VISIT' as const;
  return 'REGULAR' as const;
}

runSeed(async (prisma) => {
  const doctors = loadSeedJson<SeedDoctor[]>('doctors.seed.json');

  for (const d of doctors) {
    await prisma.doctor.upsert({
      where: { id: d.id },
      update: {
        fullNameAr: d.nameAr,
        fullNameEn: d.nameEn,
        specialtyAr: d.specialtyAr,
        specialtyEn: d.specialtyEn,
        titleAr: d.titleAr,
        titleEn: d.titleEn,
        doctorType: d.doctorType === 'visiting' ? 'VISITING' : 'LOCAL',
        specialtyId: d.specialtyId,
        originAr: d.originAr,
        originEn: d.originEn,
        universityAr: d.universityAr,
        universityEn: d.universityEn,
        availability: toAvailability(d.status),
        visitScheduleAr: d.visitScheduleAr,
        visitScheduleEn: d.visitScheduleEn,
        experienceYears: d.experienceYears,
        surgeriesCount: d.surgeriesCount,
        photoSeed: d.photoSeed,
        highlightsAr: d.highlightsAr,
        highlightsEn: d.highlightsEn,
        isAvailable: true,
      },
      create: {
        id: d.id,
        fullNameAr: d.nameAr,
        fullNameEn: d.nameEn,
        specialtyAr: d.specialtyAr,
        specialtyEn: d.specialtyEn,
        titleAr: d.titleAr,
        titleEn: d.titleEn,
        doctorType: d.doctorType === 'visiting' ? 'VISITING' : 'LOCAL',
        specialtyId: d.specialtyId,
        originAr: d.originAr,
        originEn: d.originEn,
        universityAr: d.universityAr,
        universityEn: d.universityEn,
        availability: toAvailability(d.status),
        visitScheduleAr: d.visitScheduleAr,
        visitScheduleEn: d.visitScheduleEn,
        experienceYears: d.experienceYears,
        surgeriesCount: d.surgeriesCount,
        photoSeed: d.photoSeed,
        highlightsAr: d.highlightsAr,
        highlightsEn: d.highlightsEn,
      },
    });
  }
  console.log(`seeded ${doctors.length} doctors`);
});
