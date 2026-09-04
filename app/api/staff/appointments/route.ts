import { NextRequest } from 'next/server'
import { apiError, apiSuccess } from '@/lib/api/response'
import { requireModuleAccess } from '@/lib/api/admin-route'
import { listAppointments, InvalidAppointmentQueryError } from '@/lib/usecases/appointments'
import { prismaAppointmentListReader } from '@/lib/adapters/prisma/appointment-adapter'

export const dynamic = 'force-dynamic'

// Thin handler: auth gate -> validate -> use case -> respond.
// Reception board rows. Filters: ?date=YYYY-MM-DD, ?status=, ?take= (1..200).

export async function GET(req: NextRequest) {
  const auth = await requireModuleAccess('appointments')
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(req.url)
  const date = searchParams.get('date') ?? undefined
  const status = searchParams.get('status') ?? undefined
  const takeRaw = searchParams.get('take') ?? undefined
  const take = takeRaw !== undefined ? Number(takeRaw) : undefined

  try {
    const items = await listAppointments(prismaAppointmentListReader, {
      date,
      status,
      take: take !== undefined && Number.isFinite(take) ? take : undefined,
    })
    return apiSuccess(items)
  } catch (err) {
    if (err instanceof InvalidAppointmentQueryError) {
      return apiError(422, 'INVALID_QUERY', err.message, err.message)
    }
    return apiError(500, 'LIST_FAILED', 'تعذر تحميل المواعيد', 'Could not load appointments')
  }
}
