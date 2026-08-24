import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, prismaFailure } from '@/lib/api/admin-route'
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
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const row = await prisma.consumableType.update({ where: { id }, data: body.data })
    return apiSuccess(toConsumableDTO(row))
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'CONSUMABLE_NOT_FOUND', ar: 'المستلزم غير موجود', en: 'Consumable not found' },
      failure: { code: 'CONSUMABLE_UPDATE_FAILED', ar: 'تعذر تحديث المستلزم', en: 'Failed to update consumable' },
    })
  }
}
