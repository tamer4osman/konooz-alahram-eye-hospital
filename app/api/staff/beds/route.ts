import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { createBed, listBeds, BedConflictError } from '@/lib/usecases/beds'
import { prismaBedReader, prismaBedWriter } from '@/lib/adapters/prisma/bed-adapter'

export const dynamic = 'force-dynamic'

const wardTypeEnum = z.enum(['pacu_recovery', 'daycare_suite', 'vip_inpatient'])

const createSchema = z.object({
  bedNumber: z.string().min(1).max(32),
  wardType: wardTypeEnum,
  wardNameAr: z.string().optional(),
  wardNameEn: z.string().optional(),
  floorAr: z.string().optional(),
  floorEn: z.string().optional(),
  nurseInChargeAr: z.string().optional(),
  nurseInChargeEn: z.string().optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const beds = await listBeds(prismaBedReader)
  return apiSuccess(beds)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات السرير غير مكتملة', 'Bed data is incomplete or invalid')
  if (!body.ok) return body.response

  try {
    const bed = await createBed(prismaBedWriter, body.data)
    return apiSuccess(bed, 201)
  } catch (err) {
    if (err instanceof BedConflictError) {
      return apiError(409, 'BED_NUMBER_TAKEN', 'رقم السرير مستخدم مسبقاً', 'Bed number already exists')
    }
    throw err
  }
}
