import type { ScheduledSurgery } from '@prisma/client';
import type { ScheduledSurgery as SurgeryDTO } from '@/data/dashboardData';

export function toSurgeryDTO(row: ScheduledSurgery): SurgeryDTO {
  return {
    id: row.id,
    patientNameAr: row.patientNameAr,
    patientNameEn: row.patientNameEn ?? '',
    patientPhone: row.patientPhone,
    patientAge: row.patientAge ?? 0,
    gender: row.gender === 'FEMALE' ? 'female' : 'male',
    surgeonAr: row.surgeonNameAr,
    surgeonEn: row.surgeonNameEn ?? '',
    procedureAr: row.procedureAr,
    procedureEn: row.procedureEn ?? '',
    specialtyId: row.specialtyId,
    roomCode: row.roomCode,
    time: row.time,
    estimatedDurationMin: row.durationMin,
    priority: (row.priority || 'elective') as SurgeryDTO['priority'],
    status: row.status as SurgeryDTO['status'],
    anesthesiaTypeAr: row.anesthesiaTypeAr,
    anesthesiaTypeEn: row.anesthesiaTypeEn ?? '',
  };
}
