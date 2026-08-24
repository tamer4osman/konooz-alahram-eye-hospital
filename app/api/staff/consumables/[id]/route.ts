import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
import { toConsumableDTO } from '@/lib/dashboard/consumables'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  stockLevel: z.number().int().min(0).optional(),
  lowStockThreshold: z.number().int().min(0).optional(),
  reorderStatus: z.enum(['optimal', 'low_stock', 'reorder_placed']).optional(),
  expiryDate: z.string().nullable().optional(),
  batchLot: z.string().optional(),
  unitCostLYD: z.number().min(0).optional(),
  locationAr: z.string().optional(),
  locationEn: z.string().nullable().optional(),
})

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const { id } = await params

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload')
  }

  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', 'قيم التحديث غير صالحة', 'Invalid update values')
  }

  try {
    const row = await prisma.consumableType.update({ where: { id }, data: parsed.data })
    return apiSuccess(toConsumableDTO(row))
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'CONSUMABLE_NOT_FOUND', 'المستلزم غير موجود', 'Consumable not found')
    }
    return apiError(500, 'CONSUMABLE_UPDATE_FAILED', 'تعذر تحديث المستلزم', 'Failed to update consumable')
  }
}
