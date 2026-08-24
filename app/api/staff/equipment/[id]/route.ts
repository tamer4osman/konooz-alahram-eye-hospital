import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin, readJson, prismaFailure } from '@/lib/api/admin-route'
import { toEquipmentDTO } from '@/lib/dashboard/equipment'

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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم التحديث غير صالحة', 'Invalid update values')
  if (!body.ok) return body.response

  try {
    const row = await prisma.equipment.update({ where: { id }, data: body.data })
    return apiSuccess(toEquipmentDTO(row))
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'EQUIPMENT_NOT_FOUND', ar: 'الجهاز غير موجود', en: 'Equipment not found' },
      failure: { code: 'EQUIPMENT_UPDATE_FAILED', ar: 'تعذر تحديث الجهاز', en: 'Failed to update equipment' },
    })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    await prisma.equipment.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (err) {
    return prismaFailure(err, {
      notFound: { code: 'EQUIPMENT_NOT_FOUND', ar: 'الجهاز غير موجود', en: 'Equipment not found' },
      failure: { code: 'EQUIPMENT_DELETE_FAILED', ar: 'تعذر حذف الجهاز', en: 'Failed to delete equipment' },
    })
  }
}
