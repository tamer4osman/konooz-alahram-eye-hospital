import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { createClinicalRecord, listClinicalRecords, PatientLinkNotFoundError } from '@/lib/usecases/clinical'
import { prismaClinicalReader, prismaClinicalWriter, prismaLinkedProfileReader } from '@/lib/adapters/prisma/clinical-adapter'

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
  patientRefId: z.string().min(1).optional(),
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

// Thin handler: auth gate -> validate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const records = await listClinicalRecords(prismaClinicalReader)
  return apiSuccess(records)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات الاستشارة غير مكتملة', 'Consultation data is incomplete or invalid')
  if (!body.ok) return body.response

  try {
    const record = await createClinicalRecord(prismaClinicalWriter, prismaLinkedProfileReader, body.data, auth.user.email)
    return apiSuccess(record, 201)
  } catch (err) {
    if (err instanceof PatientLinkNotFoundError) {
      return apiError(422, 'PATIENT_LINK_NOT_FOUND', 'الحساب المريض المختار غير موجود — أعد البحث واختر الحساب من جديد', 'The selected patient account was not found — search and pick the account again')
    }
    throw err
  }
}
