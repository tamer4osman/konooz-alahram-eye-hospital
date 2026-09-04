import type { PatientFlowStage as FlowStageDTO } from '@/data/dashboardData';

// Driver-agnostic event shape: what the pure computation below consumes.
// Defined here (entities layer) so the use-case port and the Prisma adapter
// both point inward to it — the use-case layer never names Prisma types.

export type FlowStageType =
  | 'reception'
  | 'triage'
  | 'diagnostics'
  | 'consultation'
  | 'pre_op'
  | 'in_or'
  | 'pacu'
  | 'procedure'
  | 'waiting_discharge'
  | 'discharged';

export interface FlowEvent {
  stageType: FlowStageType;
  enteredAt: Date;
  exitedAt: Date | null;
}

// Presentation + clinical-benchmark config stays in code; counts and
// average times are computed live from PatientFlowStage events.
const FLOW_STAGE_META: Array<{
  stageCode: FlowStageDTO['stageCode'];
  stageType: FlowEvent['stageType'];
  titleAr: string;
  titleEn: string;
  benchmarkMin: number;
  color: string;
}> = [
  { stageCode: 'triage', stageType: 'triage', titleAr: 'الاستقبال والفرز المبدئي', titleEn: 'Reception & Triage', benchmarkMin: 5, color: '#0D9488' },
  { stageCode: 'diagnostics', stageType: 'diagnostics', titleAr: 'الفحوصات والأشعة (OCT/Pentacam)', titleEn: 'Diagnostic Imaging', benchmarkMin: 15, color: '#2563EB' },
  { stageCode: 'consultation', stageType: 'consultation', titleAr: 'مناظرة الاستشاري', titleEn: 'Consultant Review', benchmarkMin: 15, color: '#7C3AED' },
  { stageCode: 'pre_op', stageType: 'pre_op', titleAr: 'التحضير قبل الجراحة', titleEn: 'Pre-Op Preparation', benchmarkMin: 20, color: '#DB2777' },
  { stageCode: 'in_or', stageType: 'in_or', titleAr: 'داخل غرفة العمليات', titleEn: 'In Operating Theater', benchmarkMin: 45, color: '#DC2626' },
  { stageCode: 'pacu', stageType: 'pacu', titleAr: 'الإفاقة بعد الجراحة (PACU)', titleEn: 'Post-Anesthesia Recovery', benchmarkMin: 60, color: '#EA580C' },
  { stageCode: 'discharge', stageType: 'waiting_discharge', titleAr: 'التعليمات والخروج', titleEn: 'Discharge & Instructions', benchmarkMin: 10, color: '#65A30D' },
];

export function computeFlowStages(events: FlowEvent[]): FlowStageDTO[] {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  return FLOW_STAGE_META.map((meta) => {
    const stageEvents = events.filter((e) => e.stageType === meta.stageType);
    const open = stageEvents.filter((e) => e.exitedAt === null);
    const closedToday = stageEvents.filter(
      (e) => e.exitedAt !== null && e.exitedAt >= startOfDay,
    );
    const avgTimeMin =
      closedToday.length > 0
        ? Math.round(
            closedToday.reduce(
              (sum, e) => sum + (e.exitedAt!.getTime() - e.enteredAt.getTime()) / 60_000,
              0,
            ) / closedToday.length,
          )
        : 0;
    const count = open.length;
    const status: FlowStageDTO['status'] = count >= 6 ? 'busy' : count >= 2 ? 'normal' : 'smooth';

    return {
      id: `flow-${meta.stageCode}`,
      stageCode: meta.stageCode,
      titleAr: meta.titleAr,
      titleEn: meta.titleEn,
      count,
      avgTimeMin,
      benchmarkMin: meta.benchmarkMin,
      status,
      color: meta.color,
    };
  });
}
