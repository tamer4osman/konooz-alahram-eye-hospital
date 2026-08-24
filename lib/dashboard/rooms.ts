import type { Room } from '@prisma/client';
import type { HospitalRoom } from '@/data/dashboardData';

export function toRoomDTO(row: Room): HospitalRoom {
  return {
    id: row.id,
    nameAr: row.nameAr,
    nameEn: row.nameEn ?? '',
    code: row.code,
    type: row.type as HospitalRoom['type'],
    floorAr: row.floorAr,
    floorEn: row.floorEn ?? '',
    status: row.status as HospitalRoom['status'],
    currentDoctorAr: row.currentDoctorAr ?? undefined,
    currentDoctorEn: row.currentDoctorEn ?? undefined,
    currentPatientId: row.currentPatientId ?? undefined,
    currentProcedureAr: row.currentProcedureAr ?? undefined,
    currentProcedureEn: row.currentProcedureEn ?? undefined,
    sterilizationStatus: (row.sterilizationStatus || 'required') as HospitalRoom['sterilizationStatus'],
    airPressureHepa: (row.airPressureHepa || 'standard') as HospitalRoom['airPressureHepa'],
    tempCelsius: row.tempCelsius ?? 0,
    humidityPercent: row.humidityPercent ?? 0,
    capacity: row.capacity,
    occupiedCount: row.occupiedCount,
    mainDeviceAssignedAr: row.mainDeviceAssignedAr,
    mainDeviceAssignedEn: row.mainDeviceAssignedEn ?? '',
  };
}
