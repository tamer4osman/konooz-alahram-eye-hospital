import type { Equipment } from '@prisma/client';
import type { HospitalEquipment } from '@/data/dashboardData';

export function toEquipmentDTO(row: Equipment): HospitalEquipment {
  return {
    id: row.id,
    nameAr: row.nameAr,
    nameEn: row.nameEn ?? '',
    brand: row.brand,
    model: row.modelNumber ?? '',
    serialNumber: row.serialNumber,
    departmentAr: row.departmentAr,
    departmentEn: row.departmentEn ?? '',
    roomCode: row.roomCode,
    status: row.status as HospitalEquipment['status'],
    uptimePercentage: row.uptimePercentage,
    totalProceduresRun: row.totalProceduresRun,
    lastMaintenanceDate: row.lastMaintenanceDate ?? '',
    nextServiceDue: row.nextServiceDue ?? '',
    firmwareVersion: row.firmwareVersion,
    technicianInChargeAr: row.technicianInChargeAr,
    technicianInChargeEn: row.technicianInChargeEn ?? '',
    healthScore: row.healthScore,
    notesAr: row.notesAr,
    notesEn: row.notesEn ?? '',
  };
}
