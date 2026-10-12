import type { NextRequest } from 'next/server'
import type { z } from 'zod'
import type { StaffUser } from '@/lib/auth/guards'
import type { AuditModule } from '@/lib/usecases/audit'
import { getStaffUser } from '@/lib/auth/guards'
import { apiError } from '@/lib/api/response'
import { auditStaffMutation } from '@/lib/api/audit'
import { hasModuleAccess, type DashboardModule, type ModuleAccess } from '@/lib/permissions'

// Shared plumbing for /api/staff/* route handlers. Every dashboard endpoint
// must pass through requireAdmin() before touching data: only ADMIN holds
// dashboard permission today (see lib/auth/guards.ts).

export type AdminGate =
  | { ok: true; user: StaffUser }
  | { ok: false; response: Response }

export async function requireAdmin(): Promise<AdminGate> {
  const user = await getStaffUser()
  if (!user) {
    return {
      ok: false,
      response: apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only'),
    }
  }
  return { ok: true, user }
}

/**
 * Like requireAdmin(), but also verifies the user has access to a specific
 * dashboard module. ADMIN role always passes; STAFF role checks permissions.
 */
export async function requireModuleAccess(
  module: DashboardModule,
  level: ModuleAccess = 'read',
): Promise<AdminGate> {
  const gate = await requireAdmin()
  if (!gate.ok) return gate
  const { user } = gate
  if (!hasModuleAccess(user.role, user.permissions, module, level)) {
    return {
      ok: false,
      response: apiError(
        403,
        'MODULE_FORBIDDEN',
        `وصول مرفوض: ${module}`,
        `Access denied: ${module}`,
      ),
    }
  }
  return gate
}

export type JsonBody<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response }

export async function readJson<S extends z.ZodTypeAny>(
  req: NextRequest,
  schema: S,
  validationMessageAr: string,
  validationMessageEn: string,
): Promise<JsonBody<z.infer<S>>> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return {
      ok: false,
      response: apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload'),
    }
  }
  const parsed = schema.safeParse(raw)
  if (!parsed.success) {
    return {
      ok: false,
      response: apiError(422, 'VALIDATION_ERROR', validationMessageAr, validationMessageEn),
    }
  }
  return { ok: true, data: parsed.data }
}

interface FailureMessages {
  code: string
  ar: string
  en: string
}

type AuditedWrite<T> =
  | { ok: true; data: T }
  | { ok: false; response: Response }

/**
 * Shared shape of every staff write handler: run the use case, append a
 * best-effort audit entry, then respond. Not-found errors map onto a 404 so
 * the "gate -> use case -> audit -> respond" boilerplate lives here once
 * instead of being copied across every staff by-id route.
 *
 * `notFound.is` is a type guard supplied by the caller because each module
 * has its own NotFoundError class; it keeps this helper free of domain
 * imports.
 */
export async function auditedAdminWrite<T>(options: {
  user: StaffUser
  action: 'create' | 'update' | 'delete'
  module: AuditModule
  targetId?: string
  run: () => Promise<T>
  notFound?: FailureMessages & { is: (err: unknown) => boolean }
  conflict?: FailureMessages & { is: (err: unknown) => boolean }
}): Promise<AuditedWrite<T>> {
  const { user, action, module, targetId, run, notFound, conflict } = options
  try {
    const data = await run()
    await auditStaffMutation(user, { action, module, targetId })
    return { ok: true, data }
  } catch (err) {
    if (notFound?.is(err)) {
      return {
        ok: false,
        response: apiError(404, notFound.code, notFound.ar, notFound.en),
      }
    }
    if (conflict?.is(err)) {
      return {
        ok: false,
        response: apiError(409, conflict.code, conflict.ar, conflict.en),
      }
    }
    throw err
  }
}

// Maps Prisma errors from create/update/delete handlers onto honest API
// responses: P2025 means the target row vanished mid-request, P2002 means a
// unique-constraint collision; anything else is an unexpected failure.
export function prismaFailure(
  err: unknown,
  options: {
    notFound?: FailureMessages
    conflict?: FailureMessages
    failure: FailureMessages
  },
): Response {
  const code = (err as { code?: string } | null | undefined)?.code
  if (code === 'P2025' && options.notFound) {
    return apiError(404, options.notFound.code, options.notFound.ar, options.notFound.en)
  }
  if (code === 'P2002' && options.conflict) {
    return apiError(409, options.conflict.code, options.conflict.ar, options.conflict.en)
  }
  return apiError(500, options.failure.code, options.failure.ar, options.failure.en)
}
