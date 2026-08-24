import { getSessionUser } from '@/lib/auth/session'
import type { User } from '@prisma/client'

// Dashboard APIs must call this before any data leaves the server.
// Only ADMIN holds full dashboard permission today. STAFF accounts exist as
// members without access; granular authorization is future work (admin will
// assign permissions and manage passwords).
export async function getStaffUser(): Promise<User | null> {
  const user = await getSessionUser()
  if (!user || user.role !== 'ADMIN') return null
  return user
}
