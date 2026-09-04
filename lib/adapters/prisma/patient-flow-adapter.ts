import { prisma } from '@/lib/prisma';
import type { PatientFlowReader } from '@/lib/usecases/patient-flow';
import type { FlowEvent } from '@/lib/dashboard/patientFlow';

// Prisma adapter implementing the patient-flow port. Driver rows are mapped
// to the entities-layer FlowEvent shape here — the use-case layer never
// names Prisma types.

export const prismaPatientFlowReader: PatientFlowReader = {
  async listTodayEvents(startOfDay: Date): Promise<FlowEvent[]> {
    const rows = await prisma.patientFlowStage.findMany({
      where: { enteredAt: { gte: startOfDay } },
      orderBy: { enteredAt: 'asc' },
    });
    return rows.map((row) => ({
      stageType: row.stageType as FlowEvent['stageType'],
      enteredAt: row.enteredAt,
      exitedAt: row.exitedAt,
    }));
  },
};
