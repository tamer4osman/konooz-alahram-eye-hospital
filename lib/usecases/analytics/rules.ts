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


// ---------------------------------------------------------------------------
// Cataract surgical outcomes (WHO grading over clinical records)
// ---------------------------------------------------------------------------

export const WHO_GOOD_SIXTY = 6 / 18; // decimal acuity for 6/18
export const WHO_BORDERLINE_SIXTY = 6 / 60; // decimal acuity for 6/60

/** Minimal surgery facts the cataract report consumes. */
export interface OutcomeSurgeryInput {
  procedureEn: string | null;
  procedureAr: string | null;
  status: string;
}

/** Minimal consultation facts the cataract report consumes. */
export interface OutcomeConsultationInput {
  icdCode: string;
  diagnosisEn: string | null;
  diagnosisAr: string | null;
  visualAcuityOD_BCVA: string;
  visualAcuityOS_BCVA: string;
  surgicalPlan?: string | null;
}

export interface CataractSurgeryVolume {
  total: number;
  completed: number;
  scheduled: number;
  cancelled: number;
}

export interface CataractConsultationVolume {
  total: number;
  surgicalPlanned: number;
}

export interface VisualOutcomeBuckets {
  good: number;
  borderline: number;
  poor: number;
  unknown: number;
}

export interface CataractOutcomeReport {
  surgeries: CataractSurgeryVolume;
  consultations: CataractConsultationVolume;
  visualOutcomes: VisualOutcomeBuckets;
  gradedCount: number;
  /** % of graded eyes-cases reaching good outcome (>= 6/18). Null when none graded. */
  goodOutcomeRate: number | null;
  hasData: boolean;
}

const CATARACT_KEYWORDS = [
  'cataract',
  'phaco',
  'iol',
  'المياه البيضاء',
  'فاكو',
  'العدسة',
];

function isCataractProcedure(procedureEn: string | null, procedureAr: string | null): boolean {
  const hay = `${procedureEn ?? ''} ${procedureAr ?? ''}`.toLowerCase();
  return CATARACT_KEYWORDS.some((kw) => hay.includes(kw));
}

function isCataractConsultation(c: OutcomeConsultationInput): boolean {
  if (c.icdCode.startsWith('H25') || c.icdCode.startsWith('H26')) return true;
  const hay = `${c.diagnosisEn ?? ''} ${c.diagnosisAr ?? ''}`.toLowerCase();
  return CATARACT_KEYWORDS.some((kw) => hay.includes(kw));
}

/**
 * Parse a Snellen visual-acuity string to a decimal acuity.
 * Fractions ("6/6", "20/40"), bare decimals ("0.5"), and common
 * low-vision notation ("CF"/"HM" ≈ 0.005, "PL" ≈ 0.001, "NLP" = 0).
 * Returns null when the value is blank or unrecognizable — never guesses.
 */
export function parseSnellen(raw: string): number | null {
  const value = raw.trim();
  if (!value) return null;

  const upper = value.toUpperCase();
  if (upper === 'CF' || upper === 'HM' || upper.includes('COUNTING')) return 0.005;
  if (upper === 'PL' || upper.includes('PERCEIVES')) return 0.001;
  if (upper === 'NLP' || upper.includes('NO PERCEPTION')) return 0;

  const fraction = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)\s*p?$/i.exec(upper);
  if (fraction) {
    const numerator = Number(fraction[1]);
    const denominator = Number(fraction[2]);
    if (denominator <= 0) return null;
    return numerator / denominator;
  }

  const decimal = /^0?\.\d+$/.exec(upper);
  if (decimal) return Number(upper);

  return null;
}

/** WHO cataract-surgery outcome grading by best-corrected decimal acuity. */
export function gradeVisualOutcome(acuity: number | null): keyof VisualOutcomeBuckets {
  if (acuity === null) return 'unknown';
  if (acuity >= WHO_GOOD_SIXTY) return 'good';
  if (acuity >= WHO_BORDERLINE_SIXTY) return 'borderline';
  return 'poor';
}

/**
 * Cataract surgical outcomes report.
 * Volume from cataract-keyword procedures; visual outcomes graded per eye
 * using the best (higher) of both eyes per consultation. Honest by default:
 * with no data the report renders empty states, never a fabricated success
 * rate. Pre-op/post-op pairing is NOT tracked yet — the UI says so.
 */
export function computeCataractOutcomes(
  surgeries: OutcomeSurgeryInput[],
  consultations: OutcomeConsultationInput[],
  _now: Date,
): CataractOutcomeReport {
  const cataractSurgeries = surgeries.filter((s) => isCataractProcedure(s.procedureEn, s.procedureAr));
  const surgeriesOut: CataractSurgeryVolume = {
    total: cataractSurgeries.length,
    completed: cataractSurgeries.filter((s) => s.status === 'completed').length,
    scheduled: cataractSurgeries.filter((s) => s.status === 'scheduled').length,
    cancelled: cataractSurgeries.filter(
      (s) => s.status === 'cancelled' || s.status === 'no_show',
    ).length,
  };

  const cataractConsultations = consultations.filter(isCataractConsultation);
  const consultationsOut: CataractConsultationVolume = {
    total: cataractConsultations.length,
    surgicalPlanned: cataractConsultations.filter((c) => Boolean(c.surgicalPlan && c.surgicalPlan.trim())).length,
  };

  const visualOutcomes: VisualOutcomeBuckets = { good: 0, borderline: 0, poor: 0, unknown: 0 };
  for (const c of cataractConsultations) {
    const od = parseSnellen(c.visualAcuityOD_BCVA);
    const os = parseSnellen(c.visualAcuityOS_BCVA);
    const candidates = [od, os].filter((a): a is number => a !== null);
    const best = candidates.length > 0 ? Math.max(...candidates) : null;
    visualOutcomes[gradeVisualOutcome(best)] += 1;
  }

  const gradedCount =
    visualOutcomes.good + visualOutcomes.borderline + visualOutcomes.poor;
  const goodOutcomeRate =
    gradedCount === 0
      ? null
      : Math.round((visualOutcomes.good / gradedCount) * 100);

  const hasData = surgeriesOut.total > 0 || consultationsOut.total > 0;

  return {
    surgeries: surgeriesOut,
    consultations: consultationsOut,
    visualOutcomes,
    gradedCount,
    goodOutcomeRate,
    hasData,
  };
}
