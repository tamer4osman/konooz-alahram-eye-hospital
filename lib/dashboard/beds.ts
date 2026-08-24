import type { Bed } from '@prisma/client';
import type { HospitalBed } from '@/data/dashboardData';

export function toBedDTO(row: Bed): HospitalBed {
  return {
    id: row.id,
    bedNumber: row.bedNumber,
    wardType: row.wardType as HospitalBed['wardType'],
    wardNameAr: row.wardNameAr,
    wardNameEn: row.wardNameEn ?? '',
    floorAr: row.floorAr,
    floorEn: row.floorEn ?? '',
    status: row.status as HospitalBed['status'],
    patientId: row.patientId ?? undefined,
    patientNameAr: row.patientNameAr ?? undefined,
    patientNameEn: row.patientNameEn ?? undefined,
    patientAge: row.patientAge ?? undefined,
    assignedDoctorAr: row.assignedDoctorAr ?? undefined,
    assignedDoctorEn: row.assignedDoctorEn ?? undefined,
    surgeryPerformedAr: row.surgeryPerformedAr ?? undefined,
    surgeryPerformedEn: row.surgeryPerformedEn ?? undefined,
    admissionTime: row.admissionTime ?? undefined,
    estimatedDischargeTime: row.estimatedDischargeTime ?? undefined,
    bloodPressure: row.bloodPressure ?? undefined,
    heartRateBpm: row.heartRateBpm ?? undefined,
    spO2Percent: row.spO2Percent ?? undefined,
    tempCelsius: row.tempCelsius ?? undefined,
    painScore: row.painScore ?? undefined,
    nurseInChargeAr: row.nurseInChargeAr ?? undefined,
    nurseInChargeEn: row.nurseInChargeEn ?? undefined,
  };
}
