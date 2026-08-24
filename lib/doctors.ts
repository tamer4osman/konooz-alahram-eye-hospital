import { prisma } from '@/lib/prisma';
import type { Doctor } from '@/data/hospitalData';

export async function getPublicDoctors(): Promise<Doctor[]> {
  const rows = await prisma.doctor.findMany({ orderBy: { createdAt: 'asc' } });
  return rows.map((row) => ({
    id: row.id,
    nameAr: row.fullNameAr,
    nameEn: row.fullNameEn ?? '',
    titleAr: row.titleAr,
    titleEn: row.titleEn ?? '',
    doctorType: row.doctorType === 'VISITING' ? 'visiting' : 'local',
    specialtyId: row.specialtyId,
    specialtyAr: row.specialtyAr,
    specialtyEn: row.specialtyEn ?? '',
    originAr: row.originAr,
    originEn: row.originEn ?? '',
    universityAr: row.universityAr,
    universityEn: row.universityEn ?? '',
    status:
      row.availability === 'AVAILABLE_NOW'
        ? 'available_now'
        : row.availability === 'UPCOMING_VISIT'
          ? 'upcoming_visit'
          : 'regular',
    visitScheduleAr: row.visitScheduleAr,
    visitScheduleEn: row.visitScheduleEn ?? '',
    experienceYears: row.experienceYears,
    surgeriesCount: row.surgeriesCount,
    photoSeed: row.photoSeed,
    highlightsAr: [...row.highlightsAr],
    highlightsEn: [...row.highlightsEn],
  }));
}
