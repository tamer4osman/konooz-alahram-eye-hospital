import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, prismaFailure } from '@/lib/api/admin-route'
import { toBedDTO } from '@/lib/dashboard/beds'

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

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const rows = await prisma.bed.findMany({ orderBy: { createdAt: 'asc' } })
  return apiSuccess(rows.map(toBedDTO))
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات السرير غير مكتملة', 'Bed data is incomplete or invalid')
  if (!body.ok) return body.response
  const input = body.data

  try {
    const row = await prisma.bed.create({
      data: {
        bedNumber: input.bedNumber,
        wardType: input.wardType,
        wardNameAr: input.wardNameAr ?? '',
        wardNameEn: input.wardNameEn ?? null,
        floorAr: input.floorAr ?? '',
        floorEn: input.floorEn ?? null,
        nurseInChargeAr: input.nurseInChargeAr ?? null,
        nurseInChargeEn: input.nurseInChargeEn ?? null,
      },
    })
    return apiSuccess(toBedDTO(row), 201)
  } catch (err) {
    return prismaFailure(err, {
      conflict: { code: 'BED_NUMBER_TAKEN', ar: 'رقم السرير مستخدم مسبقاً', en: 'Bed number already exists' },
      failure: { code: 'BED_CREATE_FAILED', ar: 'تعذر إنشاء السرير', en: 'Failed to create bed' },
    })
  }
}
