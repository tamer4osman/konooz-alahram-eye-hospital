import { prisma } from '@/lib/prisma'
import type { Specialty } from '@/data/hospitalData'
import {
  computeSatisfactionKpi,
  computeWaitTimeFunnelForRange,
  meanFunnelWait,
  type SatisfactionKpi,
  type WaitTimeFunnel,
} from '@/lib/usecases/analytics/rules'

export type AnalyticsTimeframe = 'day' | 'week' | 'month' | 'year'

const WORKLOAD_COLORS = ['#0C2340', '#0D9488', '#F59E0B', '#6366F1', '#EC4899', '#10B981']

const DAY_NAMES: Array<{ ar: string; en: string }> = [
  { ar: 'السبت', en: 'Sat' },
  { ar: 'الأحد', en: 'Sun' },
  { ar: 'الإثنين', en: 'Mon' },
  { ar: 'الثلاثاء', en: 'Tue' },
  { ar: 'الأربعاء', en: 'Wed' },
  { ar: 'الخميس', en: 'Thu' },
  { ar: 'الجمعة', en: 'Fri' },
]

const MONTH_NAMES: Array<{ ar: string; en: string }> = [
  { ar: 'يناير', en: 'Jan' }, { ar: 'فبراير', en: 'Feb' },
  { ar: 'مارس', en: 'Mar' }, { ar: 'أبريل', en: 'Apr' },
  { ar: 'مايو', en: 'May' }, { ar: 'يونيو', en: 'Jun' },
  { ar: 'يوليو', en: 'Jul' }, { ar: 'أغسطس', en: 'Aug' },
  { ar: 'سبتمبر', en: 'Sep' }, { ar: 'أكتوبر', en: 'Oct' },
  { ar: 'نوفمبر', en: 'Nov' }, { ar: 'ديسمبر', en: 'Dec' },
]

interface Range {
  start: Date
  end: Date
  prevStart: Date
  prevEnd: Date
  labelAr: string
  labelEn: string
}

function startOfDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function computeRange(timeframe: AnalyticsTimeframe, now = new Date()): Range {
  if (timeframe === 'day') {
    const start = startOfDay(now)
    const end = new Date(start)
    end.setDate(end.getDate() + 1)
    const prevStart = new Date(start)
    prevStart.setDate(prevStart.getDate() - 1)
    return { start, end, prevStart, prevEnd: start, labelAr: 'اليوم (بيانات مباشرة)', labelEn: 'Today (Live Data)' }
  }
  if (timeframe === 'week') {
    const end = new Date(startOfDay(now))
    end.setDate(end.getDate() + 1)
    const start = new Date(end)
    start.setDate(start.getDate() - 7)
    const prevEnd = new Date(start)
    const prevStart = new Date(prevEnd)
    prevStart.setDate(prevStart.getDate() - 7)
    return { start, end, prevStart, prevEnd, labelAr: 'آخر 7 أيام', labelEn: 'Last 7 Days' }
  }
  if (timeframe === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1)
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1)
    const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    return { start, end, prevStart, prevEnd: start, labelAr: 'هذا الشهر', labelEn: 'This Month' }
  }
  const start = new Date(now.getFullYear(), 0, 1)
  const end = new Date(now.getFullYear() + 1, 0, 1)
  const prevStart = new Date(now.getFullYear() - 1, 0, 1)
  return { start, end, prevStart, prevEnd: start, labelAr: `هذا العام (${now.getFullYear()})`, labelEn: `This Year (${now.getFullYear()})` }
}

function growthPct(current: number, previous: number): string {
  if (previous === 0) return current > 0 ? '+100.0%' : '+0.0%'
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}%`
}

interface PeriodTotals {
  surgeries: number
  consultations: number
  scans: number
  revenue: number
}

async function totalsForRange(start: Date, end: Date): Promise<PeriodTotals> {
  const [surgeries, consultations, scans, revenueAgg] = await Promise.all([
    prisma.scheduledSurgery.count({ where: { scheduledAt: { gte: start, lt: end } } }),
    prisma.clinicalConsultationRecord.count({ where: { date: { gte: start, lt: end } } }),
    prisma.diagnosticPacsOrder.count({ where: { createdAt: { gte: start, lt: end } } }),
    prisma.hospitalBillingInvoice.aggregate({
      _sum: { amount: true },
      where: { issuedDate: { gte: start, lt: end } },
    }),
  ])
  return {
    surgeries,
    consultations,
    scans,
    revenue: Number(revenueAgg._sum.amount ?? 0),
  }
}

interface Bucket {
  labelAr: string
  labelEn: string
  from: Date
  to: Date
}

function buildBuckets(timeframe: AnalyticsTimeframe, range: Range): Bucket[] {
  if (timeframe === 'day') {
    const buckets: Bucket[] = []
    for (let h = 8; h <= 19; h++) {
      const from = new Date(range.start)
      from.setHours(h, 0, 0, 0)
      const to = new Date(from)
      to.setHours(h + 1)
      buckets.push({ labelAr: `${String(h).padStart(2, '0')}:00`, labelEn: `${String(h).padStart(2, '0')}:00`, from, to })
    }
    return buckets
  }
  if (timeframe === 'week') {
    // Rolling 7 days ending today; ordered oldest -> newest.
    const buckets: Bucket[] = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(range.end)
      dayStart.setDate(dayStart.getDate() - (i + 1))
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)
      // JS getDay(): 0=Sun..6=Sat — map into our Sat-first week names.
      const jsDay = dayStart.getDay()
      const nameIdx = (jsDay + 1) % 7
      buckets.push({ labelAr: DAY_NAMES[nameIdx].ar, labelEn: DAY_NAMES[nameIdx].en, from: dayStart, to: dayEnd })
    }
    return buckets
  }
  if (timeframe === 'month') {
    const buckets: Bucket[] = []
    let cursor = new Date(range.start)
    let idx = 1
    while (cursor < range.end) {
      const next = new Date(cursor)
      next.setDate(next.getDate() + 7)
      const to = next > range.end ? range.end : next
      buckets.push({ labelAr: `الأسبوع ${idx}`, labelEn: `Week ${idx}`, from: new Date(cursor), to })
      cursor = to
      idx++
    }
    return buckets
  }
  const buckets: Bucket[] = []
  for (let m = 0; m < 12; m++) {
    const from = new Date(range.start.getFullYear(), m, 1)
    const to = new Date(range.start.getFullYear(), m + 1, 1)
    buckets.push({ labelAr: MONTH_NAMES[m].ar, labelEn: MONTH_NAMES[m].en, from, to })
  }
  return buckets
}

function countInInterval(date: Date | null, b: Bucket): boolean {
  if (!date) return false
  return date >= b.from && date < b.to
}

export interface AnalyticsDTO {
  periodLabelAr: string
  periodLabelEn: string
  kpis: {
    surgeriesCount: number
    surgeriesGrowth: string
    consultationsCount: number
    consultationsGrowth: string
    diagnosticScans: number
    scansGrowth: string
    orUtilizationRate: number
    orUtilizationGrowth: string
    patientSatisfaction: number | null
    averageWaitTimeMin: number | null
    nps: number | null
    surveyResponses: number
    revenueLYD: number
    revenueGrowth: string
  }
  timeline: Array<{
    labelAr: string
    labelEn: string
    consultations: number
    surgeries: number
    scans: number
    revenue: number
    orOccupancy?: number
  }>
  departmentWorkload: Array<{ nameAr: string; nameEn: string; count: number; color: string }>
  surgeonWorkload: Array<{ nameAr: string; nameEn: string; cases: number; avgDurationMin: number }>
  satisfaction: SatisfactionKpi
  waitTimeFunnel: WaitTimeFunnel
}

export async function computeAnalytics(
  timeframe: AnalyticsTimeframe,
  departments: Specialty[] = [],
): Promise<AnalyticsDTO> {
  const range = computeRange(timeframe)

  const [cur, prev, surgeryRows, consultDates, scanDates, invoices, orRoomCount, surveyRows, flowRows] = await Promise.all([
    totalsForRange(range.start, range.end),
    totalsForRange(range.prevStart, range.prevEnd),
    prisma.scheduledSurgery.findMany({
      where: { scheduledAt: { gte: range.start, lt: range.end } },
      select: { scheduledAt: true, durationMin: true, specialtyId: true, surgeonNameAr: true, surgeonNameEn: true },
    }),
    prisma.clinicalConsultationRecord.findMany({
      where: { date: { gte: range.start, lt: range.end } },
      select: { date: true },
    }),
    prisma.diagnosticPacsOrder.findMany({
      where: { createdAt: { gte: range.start, lt: range.end } },
      select: { createdAt: true },
    }),
    prisma.hospitalBillingInvoice.findMany({
      where: { issuedDate: { gte: range.start, lt: range.end } },
      select: { issuedDate: true, amount: true },
    }),
    prisma.room.count({ where: { type: 'operating_theater' } }),
    prisma.patientSurvey.findMany({
      where: { createdAt: { gte: range.start, lt: range.end } },
      select: { overallRating: true, recommendScore: true },
    }),
    prisma.patientFlowStage.findMany({
      where: { enteredAt: { gte: range.start, lt: range.end } },
      select: { patientRefId: true, patientId: true, stageType: true, enteredAt: true },
    }),
  ])

  const satisfaction = computeSatisfactionKpi(
    surveyRows.map((r) => ({ overallRating: r.overallRating, recommendScore: r.recommendScore })),
  )

  const waitTimeFunnel = computeWaitTimeFunnelForRange(
    flowRows.map((r) => ({
      appointmentId: r.patientRefId ?? r.patientId,
      stageName: r.stageType,
      enteredAt: r.enteredAt,
    })),
    range.start,
    range.end,
    range.labelEn,
  )
  const averageWaitTimeMin = meanFunnelWait(waitTimeFunnel)

  const orUtilizationRate =
    orRoomCount > 0
      ? Math.min(
          Math.round(
            (surgeryRows.reduce((acc, s) => acc + s.durationMin, 0) /
              (orRoomCount * (range.end.getTime() - range.start.getTime()) / 60000)) *
              100,
          ),
          100,
        )
      : 0

  const buckets = buildBuckets(timeframe, range)
  const inBucket = <T extends { d: Date | null }>(rows: T[], b: Bucket) =>
    rows.filter((r) => r.d !== null && r.d >= b.from && r.d < b.to)
  const wrap = (d: Date) => ({ d })

  const consultWrapped = consultDates.map((r) => wrap(r.date))
  const scanWrapped = scanDates.map((r) => wrap(r.createdAt))
  const invoiceWrapped = invoices.map((r) => ({ d: r.issuedDate as Date | null, amount: Number(r.amount) }))

  const timeline = buckets.map((b) => {
    const surgeries = surgeryRows.filter((s) => countInInterval(s.scheduledAt, b)).length
    const occupiedMinutes = surgeryRows
      .filter((s) => countInInterval(s.scheduledAt, b))
      .reduce((acc, s) => acc + s.durationMin, 0)
    const revenue = invoiceWrapped
      .filter((r) => r.d !== null && r.d >= b.from && r.d < b.to)
      .reduce((acc, r) => acc + r.amount, 0)
    const hourCapacityMin = timeframe === 'day' && orRoomCount > 0 ? orRoomCount * 60 : 0
    return {
      labelAr: b.labelAr,
      labelEn: b.labelEn,
      surgeries,
      consultations: inBucket(consultWrapped, b).length,
      scans: inBucket(scanWrapped, b).length,
      revenue,
      ...(timeframe === 'day'
        ? { orOccupancy: Math.min(Math.round((occupiedMinutes / Math.max(hourCapacityMin, 1)) * 100), 100) }
        : {}),
    }
  })

  const workloadGroups = new Map<string, number>()
  for (const s of surgeryRows) {
    const key = s.specialtyId || 'other'
    workloadGroups.set(key, (workloadGroups.get(key) ?? 0) + 1)
  }
  const specialtyById = new Map(departments.map((sp) => [sp.id, sp]))
  const departmentWorkload = [...workloadGroups.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, count], i) => {
      const sp = specialtyById.get(id)
      return {
        nameAr: sp?.titleAr ?? id,
        nameEn: sp?.titleEn ?? id,
        count,
        color: WORKLOAD_COLORS[i % WORKLOAD_COLORS.length],
      }
    })

  const surgeonGroups = new Map<string, { nameAr: string; cases: number; minutes: number }>()
  for (const s of surgeryRows) {
    const key = s.surgeonNameEn || s.surgeonNameAr || 'unknown'
    const g = surgeonGroups.get(key) ?? { nameAr: s.surgeonNameAr || key, cases: 0, minutes: 0 }
    g.cases += 1
    g.minutes += s.durationMin
    surgeonGroups.set(key, g)
  }
  const surgeonWorkload = [...surgeonGroups.entries()]
    .map(([key, g]) => ({
      nameAr: g.nameAr,
      nameEn: key,
      cases: g.cases,
      avgDurationMin: Math.round(g.minutes / Math.max(g.cases, 1)),
    }))
    .sort((a, b) => b.cases - a.cases)

  return {
    periodLabelAr: range.labelAr,
    periodLabelEn: range.labelEn,
    kpis: {
      surgeriesCount: cur.surgeries,
      surgeriesGrowth: growthPct(cur.surgeries, prev.surgeries),
      consultationsCount: cur.consultations,
      consultationsGrowth: growthPct(cur.consultations, prev.consultations),
      diagnosticScans: cur.scans,
      scansGrowth: growthPct(cur.scans, prev.scans),
      orUtilizationRate,
      orUtilizationGrowth: '+0.0%',
      patientSatisfaction: satisfaction.satisfactionPercent,
      averageWaitTimeMin,
      nps: satisfaction.nps,
      surveyResponses: satisfaction.responseCount,
      revenueLYD: cur.revenue,
      revenueGrowth: growthPct(cur.revenue, prev.revenue),
    },
    timeline,
    departmentWorkload,
    surgeonWorkload,
    satisfaction,
    waitTimeFunnel,
  }
}
