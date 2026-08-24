import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
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
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const rows = await prisma.bed.findMany({ orderBy: { createdAt: 'asc' } })
  return apiSuccess(rows.map(toBedDTO))
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
    return apiError(422, 'VALIDATION_ERROR', 'بيانات السرير غير مكتملة', 'Bed data is incomplete or invalid')
  }
  const input = parsed.data

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
    const code = (err as { code?: string }).code
    if (code === 'P2002') {
      return apiError(409, 'BED_NUMBER_TAKEN', 'رقم السرير مستخدم مسبقاً', 'Bed number already exists')
    }
    return apiError(500, 'BED_CREATE_FAILED', 'تعذر إنشاء السرير', 'Failed to create bed')
  }
}
