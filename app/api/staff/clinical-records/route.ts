import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
import { toClinicalDTO } from '@/lib/dashboard/clinical'

export const dynamic = 'force-dynamic'

const rxSchema = z.object({
  drugNameAr: z.string().optional(),
  drugNameEn: z.string().optional(),
  category: z.enum(['antibiotic', 'steroid', 'nsaid', 'glaucoma', 'lubricant', 'mydriatic']).optional(),
  eye: z.enum(['OD', 'OS', 'OU']).optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  durationDays: z.number().int().min(0).optional(),
  instructionsAr: z.string().optional(),
  instructionsEn: z.string().optional(),
  taperingSchedule: z.array(z.string()).optional(),
})

const createSchema = z.object({
  ticketNumber: z.string().optional(),
  patientId: z.string().optional(),
  patientNameAr: z.string().min(1),
  patientNameEn: z.string().optional(),
  patientAge: z.number().int().min(0).max(130).optional(),
  patientGender: z.enum(['male', 'female']).optional(),
  patientPhone: z.string().optional(),
  doctorAr: z.string().optional(),
  doctorEn: z.string().optional(),
  clinicRoom: z.string().optional(),
  visitDate: z.string().optional(),
  visitTime: z.string().optional(),
  status: z.enum(['completed', 'in_progress', 'waiting', 'referred_to_surgery']).optional(),
  chiefComplaintAr: z.string().optional(),
  chiefComplaintEn: z.string().optional(),
  visualAcuityOD_Unaided: z.string().optional(),
  visualAcuityOD_BCVA: z.string().optional(),
  visualAcuityOS_Unaided: z.string().optional(),
  visualAcuityOS_BCVA: z.string().optional(),
  iopOD_mmHg: z.number().int().min(0).max(80).optional(),
  iopOS_mmHg: z.number().int().min(0).max(80).optional(),
  corneaAr: z.string().optional(),
  corneaEn: z.string().optional(),
  anteriorChamberAr: z.string().optional(),
  anteriorChamberEn: z.string().optional(),
  lensStatusAr: z.string().optional(),
  lensStatusEn: z.string().optional(),
  fundusMaculaAr: z.string().optional(),
  fundusMaculaEn: z.string().optional(),
  icdCode: z.string().optional(),
  diagnosisAr: z.string().optional(),
  diagnosisEn: z.string().optional(),
  surgicalPlan: z.string().optional(),
  nextFollowUpDate: z.string().optional(),
  prescriptions: z.array(rxSchema).optional(),
})

export async function GET() {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const rows = await prisma.clinicalConsultationRecord.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })
  return apiSuccess(rows.map(toClinicalDTO))
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
    return apiError(422, 'VALIDATION_ERROR', 'بيانات الاستشارة غير مكتملة', 'Consultation data is incomplete or invalid')
  }
  const input = parsed.data

  const row = await prisma.clinicalConsultationRecord.create({
    data: {
      ticketNumber: input.ticketNumber ?? '',
      patientId: input.patientId ?? `PT-${Date.now()}`,
      patientNameAr: input.patientNameAr,
      patientNameEn: input.patientNameEn ?? null,
      patientAge: input.patientAge ?? null,
      patientGender: input.patientGender === 'female' ? 'FEMALE' : 'MALE',
      patientPhone: input.patientPhone ?? '',
      doctorNameAr: input.doctorAr ?? '',
      doctorNameEn: input.doctorEn ?? null,
      clinicRoom: input.clinicRoom ?? '',
      visitDate: input.visitDate ?? null,
      visitTime: input.visitTime ?? '',
      status: input.status ?? 'completed',
      chiefComplaintAr: input.chiefComplaintAr ?? null,
      chiefComplaintEn: input.chiefComplaintEn ?? null,
      date: input.visitDate ? new Date(input.visitDate) : new Date(),
      visualAcuityOD_Unaided: input.visualAcuityOD_Unaided ?? '',
      visualAcuityOD_BCVA: input.visualAcuityOD_BCVA ?? '',
      visualAcuityOS_Unaided: input.visualAcuityOS_Unaided ?? '',
      visualAcuityOS_BCVA: input.visualAcuityOS_BCVA ?? '',
      iopOD_mmHg: input.iopOD_mmHg ?? null,
      iopOS_mmHg: input.iopOS_mmHg ?? null,
      corneaAr: input.corneaAr ?? null,
      corneaEn: input.corneaEn ?? null,
      anteriorChamberAr: input.anteriorChamberAr ?? null,
      anteriorChamberEn: input.anteriorChamberEn ?? null,
      lensStatusAr: input.lensStatusAr ?? null,
      lensStatusEn: input.lensStatusEn ?? null,
      fundusMaculaAr: input.fundusMaculaAr ?? null,
      fundusMaculaEn: input.fundusMaculaEn ?? null,
      icdCode: input.icdCode ?? '',
      diagnosisAr: input.diagnosisAr ?? null,
      diagnosisEn: input.diagnosisEn ?? null,
      surgicalPlan: input.surgicalPlan ?? null,
      nextFollowUpDate: input.nextFollowUpDate ?? null,
      createdBy: staff.email,
      items: input.prescriptions
        ? {
            create: input.prescriptions.map((rx) => ({
              drugNameAr: rx.drugNameAr ?? '',
              drugNameEn: rx.drugNameEn ?? null,
              category: rx.category ?? 'lubricant',
              eye: rx.eye ?? 'OU',
              dosage: rx.dosage ?? '',
              frequency: rx.frequency ?? '',
              durationDays: rx.durationDays ?? 0,
              instructionsAr: rx.instructionsAr ?? null,
              instructionsEn: rx.instructionsEn ?? null,
              taperingSchedule: rx.taperingSchedule ?? [],
            })),
          }
        : undefined,
    },
    include: { items: true },
  })
  return apiSuccess(toClinicalDTO(row), 201)
}
