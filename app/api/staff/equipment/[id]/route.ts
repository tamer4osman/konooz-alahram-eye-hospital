import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, auditedAdminWrite } from '@/lib/api/admin-route'
import { deleteEquipment, updateEquipment, EquipmentNotFoundError } from '@/lib/usecases/equipment'
import { prismaEquipmentWriter } from '@/lib/adapters/prisma/equipment-adapter'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['operational', 'in_use', 'under_calibration', 'maintenance_scheduled', 'offline_alert']).optional(),
  healthScore: z.number().int().min(0).max(100).optional(),
  uptimePercentage: z.number().min(0).max(100).optional(),
  totalProceduresRun: z.number().int().min(0).optional(),
  lastMaintenanceDate: z.string().nullable().optional(),
  nextServiceDue: z.string().nullable().optional(),
  technicianInChargeAr: z.string().optional(),
  technicianInChargeEn: z.string().nullable().optional(),
  roomCode: z.string().optional(),
  notesAr: z.string().optional(),
  notesEn: z.string().nullable().optional(),
})

const EQUIPMENT_NOT_FOUND = {
  code: 'EQUIPMENT_NOT_FOUND',
  ar: 'الجهاز غير موجود',
  en: 'Equipment not found',
  is: (err: unknown) => err instanceof EquipmentNotFoundError,
}

// Thin handler: auth gate -> validate -> use case -> respond.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  const result = await auditedAdminWrite({
    user: auth.user,
    action: 'update',
    module: 'equipment',
    targetId: id,
    run: () => updateEquipment(prismaEquipmentWriter, id, body.data),
    notFound: EQUIPMENT_NOT_FOUND,
  })
  if (!result.ok) return result.response
  return apiSuccess(result.data)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const result = await auditedAdminWrite({
    user: auth.user,
    action: 'delete',
    module: 'equipment',
    targetId: id,
    run: () => deleteEquipment(prismaEquipmentWriter, id),
    notFound: EQUIPMENT_NOT_FOUND,
  })
  if (!result.ok) return result.response
  return apiSuccess({ ok: true })
}
