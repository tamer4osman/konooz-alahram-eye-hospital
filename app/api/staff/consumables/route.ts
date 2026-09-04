import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { createConsumable, listConsumables } from '@/lib/usecases/consumables'
import { prismaConsumableReader, prismaConsumableWriter } from '@/lib/adapters/prisma/consumable-adapter'

export const dynamic = 'force-dynamic'

const categoryEnum = z.enum(['iol_lens', 'viscoelastic', 'laser_pack', 'surgical_gas', 'microsuture', 'phaco_pack'])

const createSchema = z.object({
  nameAr: z.string().min(1),
  nameEn: z.string().optional(),
  category: categoryEnum,
  brand: z.string().optional(),
  stockCurrent: z.number().int().min(0).optional(),
  stockMinThreshold: z.number().int().min(0).optional(),
  unitAr: z.string().min(1),
  unitEn: z.string().optional(),
  reorderStatus: z.enum(['optimal', 'low_stock', 'reorder_placed']).optional(),
  batchLot: z.string().optional(),
  expiryDate: z.string().optional(),
  locationAr: z.string().optional(),
  locationEn: z.string().optional(),
  unitCostLYD: z.number().min(0).optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const consumables = await listConsumables(prismaConsumableReader)
  return apiSuccess(consumables)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات المستلزم غير مكتملة', 'Consumable data is incomplete or invalid')
  if (!body.ok) return body.response

  const consumable = await createConsumable(prismaConsumableWriter, body.data)
  return apiSuccess(consumable, 201)
}
