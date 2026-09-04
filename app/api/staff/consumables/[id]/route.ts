import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { updateConsumable, ConsumableNotFoundError } from '@/lib/usecases/consumables'
import { prismaConsumableWriter } from '@/lib/adapters/prisma/consumable-adapter'

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

// Thin handler: auth gate -> validate -> use case -> respond.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const consumable = await updateConsumable(prismaConsumableWriter, id, body.data)
    return apiSuccess(consumable)
  } catch (err) {
    if (err instanceof ConsumableNotFoundError) {
      return apiError(404, 'CONSUMABLE_NOT_FOUND', 'المستلزم غير موجود', 'Consumable not found')
    }
    throw err
  }
}
