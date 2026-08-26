import type { NextRequest } from 'next/server'
import type { z } from 'zod'
import type { User } from '@prisma/client'
import { getStaffUser } from '@/lib/auth/guards'
import { apiError } from '@/lib/api/response'
import { hasModuleAccess, type DashboardModule, type ModuleAccess } from '@/lib/permissions'

// Shared plumbing for /api/staff/* route handlers. Every dashboard endpoint
// must pass through requireAdmin() before touching data: only ADMIN holds
// dashboard permission today (see lib/auth/guards.ts).

export type AdminGate =
  | { ok: true; user: User }
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
// fallow-ignore-next-line
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
