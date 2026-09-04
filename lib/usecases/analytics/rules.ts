// Pure reporting rules (entities layer). No Prisma, no Next.js — fully
// unit-testable. Feed them real DB rows through the adapter layer.

// ---------------------------------------------------------------------------
// Patient satisfaction KPI (from PatientSurvey)
// ---------------------------------------------------------------------------

export interface SurveyRatingRow {
  overallRating: number | null;
  recommendScore: number | null;
}

export interface SatisfactionKpi {
  /** Mean of overallRating on the 1..5 scale, 1 decimal. Null when no data. */
  avgRating: number | null;
  /** avgRating mapped to a 0..100 percentage. Null when no data. */
  satisfactionPercent: number | null;
  /** Net Promoter Score: %promoters(9-10) - %detractors(0-6). Null when no data. */
  nps: number | null;
  responseCount: number;
}

/**
 * Honest-by-default: an empty or malformed set yields nulls (rendered as
 * '—'), never a fabricated zero that would imply terrible service.
 */
export function computeSatisfactionKpi(rows: SurveyRatingRow[]): SatisfactionKpi {
  const valid = rows.filter(
    (r) =>
      typeof r.overallRating === 'number' &&
      typeof r.recommendScore === 'number' &&
      r.overallRating >= 1 &&
      r.overallRating <= 5 &&
      r.recommendScore >= 0 &&
      r.recommendScore <= 10,
  );

  const responseCount = valid.length;
  if (responseCount === 0) {
    return { avgRating: null, satisfactionPercent: null, nps: null, responseCount: 0 };
  }

  const avgRating =
    Math.round(
      (valid.reduce((acc, r) => acc + (r.overallRating as number), 0) / responseCount) * 10,
    ) / 10;

  const promoters = valid.filter((r) => (r.recommendScore as number) >= 9).length;
  const detractors = valid.filter((r) => (r.recommendScore as number) <= 6).length;
  const nps = Math.round(((promoters - detractors) / responseCount) * 1000) / 10;

  return {
    avgRating,
    satisfactionPercent: Math.round((avgRating / 5) * 100),
    nps,
    responseCount,
  };
}

// ---------------------------------------------------------------------------
// Wait-time funnel (from PatientFlowStage)
// ---------------------------------------------------------------------------

/** Canonical clinical order of the PatientFlowStageType enum. */
export const FLOW_STAGE_SEQUENCE = [
  'reception',
  'triage',
  'diagnostics',
  'consultation',
  'pre_op',
  'in_or',
  'procedure',
  'pacu',
  'waiting_discharge',
  'discharged',
] as const;

export interface FlowStageRow {
  /** Groups stages into one journey (appointment id or patient id). */
  appointmentId: string;
  stageName: string;
  enteredAt: Date;
}

export interface FunnelStageWait {
  fromStage: string;
  toStage: string;
  avgWaitMin: number;
  transitions: number;
}

export interface WaitTimeFunnel {
  day: string;
  stages: FunnelStageWait[];
  /** Mean minutes from first to target stage across all journeys. */
}

function stageRank(name: string): number {
  const idx = (FLOW_STAGE_SEQUENCE as readonly string[]).indexOf(name);
  return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
}

function localDayStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Shared journey/accumulate core: rows are already pre-filtered. */
function buildFunnel(inDay: FlowStageRow[]): FunnelStageWait[] {
  const journeys = new Map<string, FlowStageRow[]>();
  for (const row of inDay) {
    const list = journeys.get(row.appointmentId) ?? [];
    list.push(row);
    journeys.set(row.appointmentId, list);
  }

  // Accumulate waits keyed by "from->to"; fromStage is the journey start.
  const waits = new Map<string, { from: string; to: string; totalMin: number; count: number }>();

  for (const stages of journeys.values()) {
    const ordered = [...stages].sort(
      (a, b) =>
        stageRank(a.stageName) - stageRank(b.stageName) ||
        a.enteredAt.getTime() - b.enteredAt.getTime(),
    );
    if (ordered.length === 0) continue;
    const start = ordered[0];

    for (const stage of ordered.slice(1)) {
      if (stage.enteredAt <= start.enteredAt) continue; // impossible -> skip
      const waitMin = Math.round(
        (stage.enteredAt.getTime() - start.enteredAt.getTime()) / 60000,
      );
      const key = `${start.stageName}->${stage.stageName}`;
      const bucket = waits.get(key) ?? {
        from: start.stageName,
        to: stage.stageName,
        totalMin: 0,
        count: 0,
      };
      bucket.totalMin += waitMin;
      bucket.count += 1;
      waits.set(key, bucket);
    }
  }

  return [...waits.values()]
    .map(({ from, to, totalMin, count }) => ({
      fromStage: from,
      toStage: to,
      avgWaitMin: Math.round(totalMin / count),
      transitions: count,
    }))
    .sort((a, b) => stageRank(a.toStage) - stageRank(b.toStage));
}

/** Per-day funnel over a 'YYYY-MM-DD' local day. */
export function computeWaitTimeFunnel(rows: FlowStageRow[], day: string): WaitTimeFunnel {
  const dayStart = localDayStart(new Date(`${day}T00:00:00`));
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const inDay = rows.filter((r) => r.enteredAt >= dayStart && r.enteredAt < dayEnd);
  return { day, stages: buildFunnel(inDay) };
}

/** Funnel over an arbitrary [start, end) window (a dashboard timeframe). */
export function computeWaitTimeFunnelForRange(
  rows: FlowStageRow[],
  start: Date,
  end: Date,
  label: string,
): WaitTimeFunnel {
  const inRange = rows.filter((r) => r.enteredAt >= start && r.enteredAt < end);
  return { day: label, stages: buildFunnel(inRange) };
}

/** Mean wait minutes across every recorded transition; null when none. */
export function meanFunnelWait(funnel: WaitTimeFunnel): number | null {
  const total = funnel.stages.reduce((acc, s) => acc + s.avgWaitMin * s.transitions, 0);
  const count = funnel.stages.reduce((acc, s) => acc + s.transitions, 0);
  if (count === 0) return null;
  return Math.round(total / count);
}
