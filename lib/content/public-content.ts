import { prisma } from '@/lib/prisma'
import type { Testimonial } from '@/data/hospitalData'

// Shared server-side getters for public marketing content. Used both by the
// ISR homepage (app/page.tsx) and the public API routes — one source of truth
// per query, with honest DTO mapping (nullable DB columns get display defaults).

export async function getPublicTestimonials(): Promise<Testimonial[]> {
  const rows = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return rows.map((r) => ({
    id: r.id,
    patientNameAr: r.patientNameAr,
    patientNameEn: r.patientNameEn ?? '',
    cityAr: r.cityAr,
    cityEn: r.cityEn ?? '',
    procedureAr: r.procedureAr,
    procedureEn: r.procedureEn ?? '',
    doctorAr: r.doctorAr,
    doctorEn: r.doctorEn ?? '',
    commentAr: r.commentAr,
    commentEn: r.commentEn ?? '',
    rating: r.rating,
    dateAr: r.dateAr,
    dateEn: r.dateEn ?? '',
  }))
}

export interface TrustStatDTO {
  id: string
  value: string
  labelAr: string
  labelEn: string
  icon: string
}

export async function getTrustStats(): Promise<TrustStatDTO[]> {
  const rows = await prisma.trustStat.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  return rows.map((r) => ({
    id: r.id,
    value: r.value,
    labelAr: r.labelAr,
    labelEn: r.labelEn ?? '',
    icon: r.icon,
  }))
}

export interface NewsletterContent {
  topics: Array<{
    id: string
    titleAr: string
    titleEn: string | null
    frequencyAr: string
    frequencyEn: string | null
  }>
  issues: Array<{
    id: string
    titleAr: string
    titleEn: string | null
    summaryAr: string
    summaryEn: string | null
    categoryAr: string
    categoryEn: string | null
    readTimeAr: string
    readTimeEn: string | null
    date: string
  }>
}

export async function getNewsletterContent(): Promise<NewsletterContent> {
  const [topics, issues] = await Promise.all([
    prisma.newsletterTopic.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.newsletterIssue.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } }),
  ])
  return {
    topics: topics.map((t) => ({
      id: t.id,
      titleAr: t.titleAr,
      titleEn: t.titleEn,
      frequencyAr: t.frequencyAr,
      frequencyEn: t.frequencyEn,
    })),
    issues: issues.map((i) => ({
      id: i.id,
      titleAr: i.titleAr,
      titleEn: i.titleEn,
      summaryAr: i.summaryAr,
      summaryEn: i.summaryEn,
      categoryAr: i.categoryAr,
      categoryEn: i.categoryEn,
      readTimeAr: i.readTimeAr,
      readTimeEn: i.readTimeEn,
      date: i.date,
    })),
  }
}
