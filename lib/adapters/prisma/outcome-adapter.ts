import { prisma } from '@/lib/prisma';
import type { OutcomeConsultationsReader, OutcomeSurgeriesReader } from '@/lib/usecases/analytics';

// Prisma adapters for the cataract-outcome ports. Rows are trimmed to the
// minimal facts the report consumes — Prisma types never cross the boundary.

export const prismaOutcomeSurgeriesReader: OutcomeSurgeriesReader = {
  listForOutcomes() {
    return prisma.scheduledSurgery.findMany({
      select: { procedureAr: true, procedureEn: true, status: true },
    });
  },
};

export const prismaOutcomeConsultationsReader: OutcomeConsultationsReader = {
  listForOutcomes() {
    return prisma.clinicalConsultationRecord.findMany({
      select: {
        icdCode: true,
        diagnosisAr: true,
        diagnosisEn: true,
        visualAcuityOD_BCVA: true,
        visualAcuityOS_BCVA: true,
        surgicalPlan: true,
      },
    });
  },
};
