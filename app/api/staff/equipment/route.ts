import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin, readJson } from '@/lib/api/admin-route'
import { auditStaffMutation } from '@/lib/api/audit'
import { createEquipment, listEquipment, EquipmentNameRequiredError } from '@/lib/usecases/equipment'
import { prismaEquipmentReader, prismaEquipmentWriter } from '@/lib/adapters/prisma/equipment-adapter'

export const dynamic = 'force-dynamic'

const createSchema = z.object({
  nameAr: z.string().min(1).optional(),
  nameEn: z.string().min(1).optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  departmentAr: z.string().optional(),
  departmentEn: z.string().optional(),
  roomCode: z.string().optional(),
  status: z.enum(['operational', 'in_use', 'under_calibration', 'maintenance_scheduled', 'offline_alert']).optional(),
  notesAr: z.string().optional(),
  notesEn: z.string().optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const equipment = await listEquipment(prismaEquipmentReader)
  return apiSuccess(equipment)
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const body = await readJson(req, createSchema, 'بيانات الجهاز غير مكتملة', 'Equipment data is incomplete or invalid')
  if (!body.ok) return body.response

  try {
    const device = await createEquipment(prismaEquipmentWriter, body.data)
    await auditStaffMutation(auth.user, {
      action: 'create',
      module: 'equipment',
      targetId: device.id,
    })
    return apiSuccess(device, 201)
  } catch (err) {
    if (err instanceof EquipmentNameRequiredError) {
      return apiError(422, 'VALIDATION_ERROR', 'بيانات الجهاز غير مكتملة', 'Equipment data is incomplete or invalid')
    }
    throw err
  }
}
