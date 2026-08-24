import type { InsuranceProvider, HospitalBillingInvoice, DiagnosticPacsOrder } from '@prisma/client';
import type { InsuranceProviderInfo, HospitalBillingInvoice as InvoiceDTO, DiagnosticPacsOrder as PacsDTO } from '@/data/dashboardData';

export function toInsurerDTO(row: InsuranceProvider): InsuranceProviderInfo {
  return {
    id: row.id,
    nameAr: row.nameAr,
    nameEn: row.nameEn ?? '',
    coveragePercentage: row.coveragePercentage,
    preAuthRequired: row.preAuthRequired,
    contactDesk: row.contactDesk,
    logo: row.logo,
  };
}

export function toInvoiceDTO(row: HospitalBillingInvoice): InvoiceDTO {
  return {
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    ticketNumber: row.ticketNumber,
    patientNameAr: row.patientNameAr ?? '',
    patientNameEn: row.patientNameEn ?? '',
    procedureAr: row.serviceAr,
    procedureEn: row.serviceEn ?? '',
    insuranceNameAr: row.insuranceNameAr,
    insuranceNameEn: row.insuranceNameEn ?? '',
    dateIssued: row.issuedDate.toISOString().split('T')[0],
    surgeonFeeLYD: row.surgeonFeeLYD,
    orFacilityFeeLYD: row.orFacilityFeeLYD,
    anesthesiaFeeLYD: row.anesthesiaFeeLYD,
    lensOrDeviceFeeLYD: row.lensOrDeviceFeeLYD,
    consumablesFeeLYD: row.consumablesFeeLYD,
    totalGrossLYD: row.totalGrossLYD,
    insuranceCoveredLYD: row.insuranceCoveredLYD,
    patientCoPayLYD: row.patientCoPayLYD,
    status: row.status as InvoiceDTO['status'],
  };
}

export function toPacsDTO(row: DiagnosticPacsOrder): PacsDTO {
  return {
    id: row.id,
    orderNumber: row.orderNumber,
    ticketNumber: row.ticketNumber,
    patientNameAr: row.patientNameAr,
    patientNameEn: row.patientNameEn ?? '',
    scanTypeAr: row.examTypeAr,
    scanTypeEn: row.examTypeEn ?? '',
    deviceUsed: row.deviceUsed,
    orderingDoctorAr: row.orderedByAr,
    orderingDoctorEn: row.orderedByEn ?? '',
    technicianAr: row.technicianAr,
    technicianEn: row.technicianEn ?? '',
    status: (row.status === 'in_progress' ? 'in_scan' : row.status === 'ordered' ? 'pending' : row.status) as PacsDTO['status'],
    findingsSummaryAr: row.findingsSummaryAr ?? '',
    findingsSummaryEn: row.findingsSummaryEn ?? '',
    timeCompleted: row.timeCompleted ?? '',
    imageThumbnail: row.imageThumbnail,
  };
}
