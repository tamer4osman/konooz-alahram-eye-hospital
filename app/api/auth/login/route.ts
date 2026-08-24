import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { loginSchema } from '@/lib/validation/auth'
import { verifyPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { apiSuccess, apiError } from '@/lib/api/response'
import { AUTH_MESSAGES } from '@/data/authMessages'

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload')
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return apiError(400, 'VALIDATION_ERROR', 'بيانات غير صالحة', 'Invalid input')
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !user.passwordHash) {
    return apiError(401, 'INVALID_CREDENTIALS', AUTH_MESSAGES.invalidCredentials.ar, AUTH_MESSAGES.invalidCredentials.en)
  }

  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) {
    return apiError(401, 'INVALID_CREDENTIALS', AUTH_MESSAGES.invalidCredentials.ar, AUTH_MESSAGES.invalidCredentials.en)
  }

  await createSession(user.id)
  return apiSuccess({ user: { id: user.id, email: user.email } })
}
