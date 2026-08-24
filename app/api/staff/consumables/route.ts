import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { toConsumableDTO } from '@/lib/dashboard/consumables'

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

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const rows = await prisma.consumableType.findMany({ orderBy: { createdAt: 'asc' } })
  return apiSuccess(rows.map(toConsumableDTO))
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات المستلزم غير مكتملة', 'Consumable data is incomplete or invalid')
  if (!body.ok) return body.response
  const input = body.data

  const row = await prisma.consumableType.create({
    data: {
      nameAr: input.nameAr,
      nameEn: input.nameEn ?? null,
      category: input.category,
      unitAr: input.unitAr,
      unitEn: input.unitEn ?? null,
      stockLevel: input.stockCurrent ?? 0,
      lowStockThreshold: input.stockMinThreshold ?? 10,
      brand: input.brand ?? '',
      reorderStatus: input.reorderStatus ?? 'optimal',
      batchLot: input.batchLot ?? '',
      expiryDate: input.expiryDate ?? null,
      locationAr: input.locationAr ?? '',
      locationEn: input.locationEn ?? null,
      unitCostLYD: input.unitCostLYD ?? 0,
    },
  })
  return apiSuccess(toConsumableDTO(row), 201)
}
