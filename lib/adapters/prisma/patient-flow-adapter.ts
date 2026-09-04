import { prisma } from '@/lib/prisma';
import type {
  PatientFlowReader,
  OpenStageLister,
  PatientFlowStageQuery,
  PatientFlowStageStore,
} from '@/lib/usecases/patient-flow';
import type { FlowEvent, FlowStageType } from '@/lib/dashboard/patientFlow';

const toRef = (row: {
  id: string;
  patientId: string;
  stageType: string;
  enteredAt: Date;
  exitedAt: Date | null;
}) => ({
  id: row.id,
  patientId: row.patientId,
  stageType: row.stageType as FlowStageType,
  enteredAt: row.enteredAt,
  exitedAt: row.exitedAt,
});

// Prisma adapters implementing the patient-flow ports. Driver rows are mapped
// to the entities-layer shapes here — the use-case layer never names Prisma
// types.

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

export const prismaOpenStageLister: OpenStageLister = {
  async listOpenStages(startOfDay: Date) {
    const rows = await prisma.patientFlowStage.findMany({
      where: { enteredAt: { gte: startOfDay }, exitedAt: null },
      orderBy: { enteredAt: 'asc' },
    });
    return rows.map(toRef);
  },
};

export const prismaPatientFlowStageQuery: PatientFlowStageQuery = {
  async findOpenByPatientId(patientId: string) {
    const row = await prisma.patientFlowStage.findFirst({
      where: { patientId, exitedAt: null },
      orderBy: { enteredAt: 'desc' },
    });
    return row ? toRef(row) : null;
  },
  async findStage(id: string) {
    const row = await prisma.patientFlowStage.findUnique({ where: { id } });
    return row ? toRef(row) : null;
  },
};

export const prismaPatientFlowStageStore: PatientFlowStageStore = {
  async create(input) {
    const row = await prisma.patientFlowStage.create({
      data: { patientId: input.patientId, stageType: input.stageType, enteredAt: input.enteredAt },
      select: { id: true },
    });
    return { id: row.id };
  },
  async closeById(id, exitedAt, notes) {
    await prisma.patientFlowStage.update({
      where: { id },
      data: { exitedAt, ...(notes ? notes : {}) },
    });
  },
};
