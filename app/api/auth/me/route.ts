import { getSessionUser } from '@/lib/auth/session'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api/response'
import { AUTH_MESSAGES } from '@/data/authMessages'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return apiError(401, 'NOT_AUTHENTICATED', AUTH_MESSAGES.notAuthenticated.ar, AUTH_MESSAGES.notAuthenticated.en)

  const profile = await prisma.patientProfile.findUnique({
    where: { userId: user.id },
  })
  return apiSuccess({ user: { id: user.id, email: user.email, role: user.role }, profile })
}
