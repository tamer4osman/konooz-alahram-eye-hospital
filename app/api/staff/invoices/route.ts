import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
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
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const rows = await prisma.hospitalBillingInvoice.findMany({ orderBy: { createdAt: 'desc' } })
  return apiSuccess(rows.map(toInvoiceDTO))
}

export async function POST(req: NextRequest) {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload')
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', 'بيانات الفاتورة غير مكتملة', 'Invoice data is incomplete or invalid')
  }
  const input = parsed.data

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
      createdBy: staff.email,
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
