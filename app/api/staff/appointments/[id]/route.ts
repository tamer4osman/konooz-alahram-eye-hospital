import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { requireModuleAccess, readJson, prismaFailure } from '@/lib/api/admin-route'
import {
  markAppointmentStatus,
  AppointmentNotFoundError,
  InvalidStatusTransitionError,
} from '@/lib/usecases/appointments'
import {
  prismaAppointmentStatusReader,
  prismaAppointmentStatusWriter,
} from '@/lib/adapters/prisma/appointment-adapter'

export const dynamic = 'force-dynamic'

const patchSchema = z.object({
  status: z.enum(['cancelled', 'no_show']),
  reason: z.enum(['patient_request', 'clinic_decision', 'duplicate', 'rescheduled', 'other']),
  note: z.string().max(500).optional(),
})

// Thin handler: auth gate -> validate -> use case -> respond.
// Reception marks lifecycle facts (cancelled / no-show) on the appointments
// module (write level).

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireModuleAccess('appointments', 'write')
  if (!auth.ok) return auth.response

  const { id } = await params

  const body = await readJson(req, patchSchema, 'قيم تحديث الحالة غير صالحة', 'Invalid status update values')
  if (!body.ok) return body.response

  try {
    await markAppointmentStatus(
      prismaAppointmentStatusReader,
      prismaAppointmentStatusWriter,
      id,
      body.data,
    )
    return apiSuccess({ ok: true })
  } catch (err) {
    if (err instanceof AppointmentNotFoundError) {
      return apiError(404, 'APPOINTMENT_NOT_FOUND', 'الموعد غير موجود', 'Appointment not found')
    }
    if (err instanceof InvalidStatusTransitionError) {
      return apiError(409, 'INVALID_STATUS_TRANSITION', err.message, err.message)
    }
    return prismaFailure(err, {
      notFound: {
        code: 'APPOINTMENT_NOT_FOUND',
        ar: 'الموعد غير موجود',
        en: 'Appointment not found',
      },
      failure: {
        code: 'UPDATE_FAILED',
        ar: 'تعذر تحديث حالة الموعد',
        en: 'Could not update appointment status',
      },
    })
  }
}
