import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { toInvoiceDTO } from '@/lib/dashboard/billing'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  invoiceNumber: z.string().optional(),
  ticketNumber: z.string().optional(),
  patientNameAr: z.string().optional(),
  patientNameEn: z.string().optional(),
  procedureAr: z.string().optional(),
  procedureEn: z.string().optional(),
  insuranceNameAr: z.string().optional(),
  insuranceNameEn: z.string().optional(),
  surgeonFeeLYD: z.number().min(0).optional(),
  orFacilityFeeLYD: z.number().min(0).optional(),
  anesthesiaFeeLYD: z.number().min(0).optional(),
  lensOrDeviceFeeLYD: z.number().min(0).optional(),
  consumablesFeeLYD: z.number().min(0).optional(),
  totalGrossLYD: z.number().min(0).optional(),
  insuranceCoveredLYD: z.number().min(0).optional(),
  patientCoPayLYD: z.number().min(0).optional(),
  status: z.enum(['paid', 'pending_insurance', 'pre_auth_approved', 'draft', 'pending', 'partially_paid', 'cancelled']).optional(),
})

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const rows = await prisma.hospitalBillingInvoice.findMany({ orderBy: { createdAt: 'desc' } })
  return apiSuccess(rows.map(toInvoiceDTO))
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات الفاتورة غير مكتملة', 'Invoice data is incomplete or invalid')
  if (!body.ok) return body.response
  const input = body.data

  const row = await prisma.hospitalBillingInvoice.create({
    data: {
      invoiceNumber: input.invoiceNumber ?? `INV-${Date.now()}`,
      ticketNumber: input.ticketNumber ?? '',
      patientId: `PT-${input.ticketNumber ?? Date.now()}`,
      patientNameAr: input.patientNameAr ?? null,
      patientNameEn: input.patientNameEn ?? null,
      serviceAr: input.procedureAr ?? 'خدمة طبية',
      serviceEn: input.procedureEn ?? null,
      amount: input.totalGrossLYD ?? 0,
      status: input.status ?? 'pending_insurance',
      issuedDate: new Date(),
      createdBy: auth.user.email,
      insuranceNameAr: input.insuranceNameAr ?? '',
      insuranceNameEn: input.insuranceNameEn ?? null,
      surgeonFeeLYD: input.surgeonFeeLYD ?? 0,
      orFacilityFeeLYD: input.orFacilityFeeLYD ?? 0,
      anesthesiaFeeLYD: input.anesthesiaFeeLYD ?? 0,
      lensOrDeviceFeeLYD: input.lensOrDeviceFeeLYD ?? 0,
      consumablesFeeLYD: input.consumablesFeeLYD ?? 0,
      totalGrossLYD: input.totalGrossLYD ?? 0,
      insuranceCoveredLYD: input.insuranceCoveredLYD ?? 0,
      patientCoPayLYD: input.patientCoPayLYD ?? 0,
    },
  })
  return apiSuccess(toInvoiceDTO(row), 201)
}
