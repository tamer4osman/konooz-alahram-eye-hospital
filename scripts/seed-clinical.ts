import { runSeed,
  loadSeedJson } from './seed-runner';

interface SeedRxItem {
  id: string;
  drugNameAr: string;
  drugNameEn: string;
  category: string;
  eye: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructionsAr: string;
  instructionsEn: string;
  taperingSchedule?: string[];
}

interface SeedClinical {
  id: string;
  ticketNumber: string;
  patientId: string;
  patientNameAr: string;
  patientNameEn: string;
  patientAge: number;
  patientGender: 'male' | 'female';
  patientPhone: string;
  doctorAr: string;
  doctorEn: string;
  clinicRoom: string;
  visitDate: string;
  visitTime: string;
  status: string;
  chiefComplaintAr: string;
  chiefComplaintEn: string;
  visualAcuityOD_Unaided: string;
  visualAcuityOD_BCVA: string;
  visualAcuityOS_Unaided: string;
  visualAcuityOS_BCVA: string;
  iopOD_mmHg: number;
  iopOS_mmHg: number;
  corneaAr: string;
  corneaEn: string;
  anteriorChamberAr: string;
  anteriorChamberEn: string;
  lensStatusAr: string;
  lensStatusEn: string;
  fundusMaculaAr: string;
  fundusMaculaEn: string;
  icdCode: string;
  diagnosisAr: string;
  diagnosisEn: string;
  surgicalPlan?: string;
  prescriptions: SeedRxItem[];
  nextFollowUpDate: string;
}


runSeed(async (prisma) => {
  const records = loadSeedJson<SeedClinical[]>('clinical.seed.json');

  for (const r of records) {
    const data = {
      ticketNumber: r.ticketNumber,
      patientId: r.patientId,
      patientNameAr: r.patientNameAr,
      patientNameEn: r.patientNameEn,
      patientAge: r.patientAge,
      patientGender: (r.patientGender === 'female' ? 'FEMALE' : 'MALE') as never,
      patientPhone: r.patientPhone,
      doctorNameAr: r.doctorAr,
      doctorNameEn: r.doctorEn,
      clinicRoom: r.clinicRoom,
      visitDate: r.visitDate,
      visitTime: r.visitTime,
      status: r.status,
      chiefComplaintAr: r.chiefComplaintAr,
      chiefComplaintEn: r.chiefComplaintEn,
      diagnosisAr: r.diagnosisAr,
      diagnosisEn: r.diagnosisEn,
      date: new Date(r.visitDate),
      visualAcuityOD_Unaided: r.visualAcuityOD_Unaided,
      visualAcuityOD_BCVA: r.visualAcuityOD_BCVA,
      visualAcuityOS_Unaided: r.visualAcuityOS_Unaided,
      visualAcuityOS_BCVA: r.visualAcuityOS_BCVA,
      iopOD_mmHg: r.iopOD_mmHg,
      iopOS_mmHg: r.iopOS_mmHg,
      corneaAr: r.corneaAr,
      corneaEn: r.corneaEn,
      anteriorChamberAr: r.anteriorChamberAr,
      anteriorChamberEn: r.anteriorChamberEn,
      lensStatusAr: r.lensStatusAr,
      lensStatusEn: r.lensStatusEn,
      fundusMaculaAr: r.fundusMaculaAr,
      fundusMaculaEn: r.fundusMaculaEn,
      icdCode: r.icdCode,
      surgicalPlan: r.surgicalPlan ?? null,
      nextFollowUpDate: r.nextFollowUpDate,
      items: {
        create: r.prescriptions.map((rx) => ({
          drugNameAr: rx.drugNameAr,
          drugNameEn: rx.drugNameEn,
          category: rx.category,
          eye: rx.eye,
          dosage: rx.dosage,
          frequency: rx.frequency,
          durationDays: rx.durationDays,
          instructionsAr: rx.instructionsAr,
          instructionsEn: rx.instructionsEn,
          taperingSchedule: rx.taperingSchedule ?? [],
        })),
      },
    };
    await prisma.clinicalConsultationRecord.upsert({
      where: { id: r.id },
      update: { ...data, items: { deleteMany: {} } },
      create: { id: r.id, ...data },
    });
  }
  console.log(`seeded ${records.length} clinical records (with prescriptions)`);
});
