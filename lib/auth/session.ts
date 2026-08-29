import { randomBytes, createHash } from 'crypto'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

const COOKIE_NAME = 'konooz_session'
const INDICATOR_COOKIE = 'konooz_auth'
const MAX_AGE = 60 * 60 * 24 * 30 // 30 days

function sha256(input: string): string {
  return createHash('sha256').update(input).digest('hex')
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('base64url')
  const tokenHash = sha256(token)
  const expiresAt = new Date(Date.now() + MAX_AGE * 1000)

  await prisma.session.create({ data: { tokenHash, userId, expiresAt } })

  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })

  cookieStore.set(INDICATOR_COOKIE, '1', {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  })

  return token
}

export async function getSessionUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (!token) return null

  const tokenHash = sha256(token)
  const session = await prisma.session.findUnique({
    where: { tokenHash },
    include: { user: true },
  })

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } })
    return null
  }

  // Sliding expiry
  await prisma.session.update({
    where: { id: session.id },
    data: { expiresAt: new Date(Date.now() + MAX_AGE * 1000) },
  })

  return session.user
}

export async function destroySession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value
  if (token) {
    await prisma.session.deleteMany({ where: { tokenHash: sha256(token) } })
  }
  cookieStore.delete(COOKIE_NAME)
  cookieStore.delete(INDICATOR_COOKIE)
}
