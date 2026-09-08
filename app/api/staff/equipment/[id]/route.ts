import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { auditStaffMutation } from '@/lib/api/audit'
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

// Thin handler: auth gate -> validate -> use case -> respond.

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const device = await updateEquipment(prismaEquipmentWriter, id, body.data)
    await auditStaffMutation(auth.user, {
      action: 'update',
      module: 'equipment',
      targetId: id,
    })
    return apiSuccess(device)
  } catch (err) {
    if (err instanceof EquipmentNotFoundError) {
      return apiError(404, 'EQUIPMENT_NOT_FOUND', 'الجهاز غير موجود', 'Equipment not found')
    }
    throw err
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    await deleteEquipment(prismaEquipmentWriter, id)
    await auditStaffMutation(auth.user, {
      action: 'delete',
      module: 'equipment',
      targetId: id,
    })
    return apiSuccess({ ok: true })
  } catch (err) {
    if (err instanceof EquipmentNotFoundError) {
      return apiError(404, 'EQUIPMENT_NOT_FOUND', 'الجهاز غير موجود', 'Equipment not found')
    }
    throw err
  }
}
