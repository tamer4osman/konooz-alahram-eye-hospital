import { runSeed,
  loadSeedJson } from './seed-runner';

interface SeedInsurer {
  id: string; nameAr: string; nameEn: string; coveragePercentage: number;
  preAuthRequired: boolean; contactDesk: string; logo: string;
}
interface SeedInvoice {
  id: string; invoiceNumber: string; ticketNumber: string;
  patientNameAr: string; patientNameEn: string;
  procedureAr: string; procedureEn: string;
  insuranceNameAr: string; insuranceNameEn: string;
  dateIssued: string;
  surgeonFeeLYD: number; orFacilityFeeLYD: number; anesthesiaFeeLYD: number;
  lensOrDeviceFeeLYD: number; consumablesFeeLYD: number;
  totalGrossLYD: number; insuranceCoveredLYD: number; patientCoPayLYD: number;
  status: string;
}
interface SeedPacs {
  id: string; orderNumber: string; ticketNumber: string;
  patientNameAr: string; patientNameEn: string;
  scanTypeAr: string; scanTypeEn: string; deviceUsed: string;
  orderingDoctorAr: string; orderingDoctorEn: string;
  technicianAr: string; technicianEn: string;
  status: string; findingsSummaryAr: string; findingsSummaryEn: string;
  timeCompleted: string; imageThumbnail: string;
}


runSeed(async (prisma) => {
  const data = loadSeedJson<{
    insurances: SeedInsurer[];
    invoices: SeedInvoice[];
    pacsOrders: SeedPacs[];
  }>('billing.seed.json');

  for (const i of data.insurances) {
    const d = { nameAr: i.nameAr, nameEn: i.nameEn, coveragePercentage: i.coveragePercentage, preAuthRequired: i.preAuthRequired, contactDesk: i.contactDesk, logo: i.logo };
    await prisma.insuranceProvider.upsert({ where: { id: i.id }, update: d, create: { id: i.id, ...d } });
  }
  for (const v of data.invoices) {
    const d = {
      invoiceNumber: v.invoiceNumber,
      ticketNumber: v.ticketNumber,
      patientId: `PT-${v.ticketNumber}`,
      patientNameAr: v.patientNameAr,
      patientNameEn: v.patientNameEn,
      serviceAr: v.procedureAr,
      serviceEn: v.procedureEn,
      amount: v.totalGrossLYD,
      status: v.status as never,
      issuedDate: new Date(v.dateIssued),
      insuranceNameAr: v.insuranceNameAr,
      insuranceNameEn: v.insuranceNameEn,
      surgeonFeeLYD: v.surgeonFeeLYD,
      orFacilityFeeLYD: v.orFacilityFeeLYD,
      anesthesiaFeeLYD: v.anesthesiaFeeLYD,
      lensOrDeviceFeeLYD: v.lensOrDeviceFeeLYD,
      consumablesFeeLYD: v.consumablesFeeLYD,
      totalGrossLYD: v.totalGrossLYD,
      insuranceCoveredLYD: v.insuranceCoveredLYD,
      patientCoPayLYD: v.patientCoPayLYD,
    };
    await prisma.hospitalBillingInvoice.upsert({ where: { id: v.id }, update: d, create: { id: v.id, ...d } });
  }
  for (const p of data.pacsOrders) {
    const d = {
      orderNumber: p.orderNumber,
      ticketNumber: p.ticketNumber,
      patientId: `PT-${p.ticketNumber}`,
      patientNameAr: p.patientNameAr,
      patientNameEn: p.patientNameEn,
      examTypeAr: p.scanTypeAr,
      examTypeEn: p.scanTypeEn,
      status: (p.status === 'in_scan' ? 'in_progress' : p.status === 'pending' ? 'ordered' : p.status) as never,
      orderedByAr: p.orderingDoctorAr,
      orderedByEn: p.orderingDoctorEn,
      deviceUsed: p.deviceUsed,
      technicianAr: p.technicianAr,
      technicianEn: p.technicianEn,
      findingsSummaryAr: p.findingsSummaryAr,
      findingsSummaryEn: p.findingsSummaryEn,
      timeCompleted: p.timeCompleted,
      imageThumbnail: p.imageThumbnail,
      completedAt: p.status === 'completed' ? new Date() : null,
    };
    await prisma.diagnosticPacsOrder.upsert({ where: { id: p.id }, update: d, create: { id: p.id, ...d } });
  }
  console.log(`seeded ${data.insurances.length} insurers, ${data.invoices.length} invoices, ${data.pacsOrders.length} pacs orders`);
});
