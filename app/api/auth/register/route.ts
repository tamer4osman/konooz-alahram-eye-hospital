import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { registerSchema } from '@/lib/validation/auth'
import { hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import { apiSuccess, apiError } from '@/lib/api/response'
import { AUTH_MESSAGES } from '@/data/authMessages'
import {
  registerRateLimiter,
  getClientIp,
  tooManyRequests,
} from '@/lib/api/rate-limit'

export async function POST(req: NextRequest) {
  const limiter = registerRateLimiter(getClientIp(req))
  if (!limiter.allowed) return tooManyRequests(limiter.retryAfterSeconds)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload')
  }

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    const msg = parsed.error.issues[0]?.message ?? 'Invalid input'
    return apiError(400, 'VALIDATION_ERROR', msg, msg)
  }

  const { fullNameAr, email, password } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return apiError(409, 'EMAIL_TAKEN', AUTH_MESSAGES.emailTaken.ar, AUTH_MESSAGES.emailTaken.en)
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      patientProfile: {
        create: {
          fullNameAr,
          fullNameEn: fullNameAr,
          phone: parsed.data.phone || '',
          gender: parsed.data.gender === 'female' ? 'FEMALE' : 'MALE',
          cityAr: parsed.data.cityAr || 'بنغازي',
          cityEn: 'Benghazi',
          communicationPreferences: JSON.stringify({
            emailNotifications: true,
            whatsappAlerts: true,
            appointmentReminders: true,
            eyeDropScheduleAlerts: true,
            postOpCareGuides: true,
            newsletterSubscribed: false,
            newsletterTopics: [],
          }),
        },
      },
    },
    select: { id: true, email: true },
  })

  await createSession(user.id)

  // Log consent (BCK-026)
  await prisma.consentRecord.create({
    data: {
      userId: user.id,
      consentType: 'privacy_policy',
      consented: true,
    },
  })

  return apiSuccess({ user }, 201)
}
