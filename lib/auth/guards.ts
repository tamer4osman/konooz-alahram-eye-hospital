import { getSessionUser } from '@/lib/auth/session'
import type { User } from '@prisma/client'

// Dashboard APIs must call this before any data leaves the server.
// Returns the session user only when their role is STAFF; otherwise null.
export async function getStaffUser(): Promise<User | null> {
  const user = await getSessionUser()
  if (!user || user.role !== 'STAFF') return null
  return user
}
