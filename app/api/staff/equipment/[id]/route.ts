import { NextRequest } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getStaffUser } from '@/lib/auth/guards'
import { apiSuccess, apiError } from '@/lib/api/response'
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
    const row = await prisma.equipment.update({ where: { id }, data: parsed.data })
    return apiSuccess(toEquipmentDTO(row))
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'EQUIPMENT_NOT_FOUND', 'الجهاز غير موجود', 'Equipment not found')
    }
    return apiError(500, 'EQUIPMENT_UPDATE_FAILED', 'تعذر تحديث الجهاز', 'Failed to update equipment')
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const staff = await getStaffUser()
  if (!staff) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')

  const { id } = await params
  try {
    await prisma.equipment.delete({ where: { id } })
    return apiSuccess({ ok: true })
  } catch (err) {
    const code = (err as { code?: string }).code
    if (code === 'P2025') {
      return apiError(404, 'EQUIPMENT_NOT_FOUND', 'الجهاز غير موجود', 'Equipment not found')
    }
    return apiError(500, 'EQUIPMENT_DELETE_FAILED', 'تعذر حذف الجهاز', 'Failed to delete equipment')
  }
}
