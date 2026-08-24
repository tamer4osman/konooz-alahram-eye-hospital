import { PatientFlowStageType } from '@prisma/client';
import { runSeed } from './seed-runner';


// Live flow events for today: open events = patients currently in a stage;
// closed pairs (enteredAt/exitedAt) feed the average-time metric.
const OPEN: Array<[PatientFlowStageType, number]> = [
  ['reception', 3],
  ['triage', 2],
  ['consultation', 4],
  ['procedure', 2],
  ['waiting_discharge', 1],
];

const CLOSED: Array<[PatientFlowStageType, number]> = [
  // [stage, minutesSpent] — completed earlier today
  ['reception', 3], ['reception', 5], ['reception', 4],
  ['triage', 6], ['triage', 4],
  ['diagnostics', 12], ['diagnostics', 18], ['diagnostics', 9],
  ['consultation', 15], ['consultation', 22],
  ['procedure', 35],
  ['waiting_discharge', 8],
  ['discharged', 5],
];

runSeed(async (prisma) => {
  const today = new Date();
  const at = (hoursAgo: number) => new Date(today.getTime() - hoursAgo * 3600_000);

  await prisma.patientFlowStage.deleteMany({
    where: {
      enteredAt: { gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()) },
    },
  });

  let n = 0;
  for (const [stage, count] of OPEN) {
    for (let i = 0; i < count; i++) {
      n++;
      const pid = `PT-FLOW-${String(n).padStart(2, '0')}`;
      await prisma.patientFlowStage.create({
        data: { stageType: stage, patientId: pid, enteredAt: at(0.3 + n * 0.2) },
      });
    }
  }
  for (const [stage, minutes] of CLOSED) {
    n++;
    const entered = at(minutes / 60 + 1);
    await prisma.patientFlowStage.create({
      data: {
        stageType: stage,
        patientId: `PT-FLOW-D${String(n).padStart(2, '0')}`,
        enteredAt: entered,
        exitedAt: new Date(entered.getTime() + minutes * 60_000),
      },
    });
  }
  console.log(`seeded ${OPEN.reduce((a, [, c]) => a + c, 0)} open + ${CLOSED.length} closed flow events`);
});
