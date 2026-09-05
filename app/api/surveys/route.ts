import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess, apiError } from '@/lib/api/response'
import { getPatientAccount } from '@/lib/api/patient-route'
import { surveyRateLimiter, getClientIp, tooManyRequests } from '@/lib/api/rate-limit'
import { submitSurvey } from '@/lib/usecases/surveys'
import {
  ConsentRequiredError,
  InvalidSurveyError,
  SurveyAlreadySubmittedError,
  SurveyTicketNotFoundError,
} from '@/lib/usecases/surveys'
import {
  prismaConsentReader,
  prismaSurveyTicketReader,
  prismaSurveyWriter,
} from '@/lib/adapters/prisma/survey-adapter'

export const dynamic = 'force-dynamic'

const surveySchema = z.object({
  ticketNumber: z.string().min(1).max(20),
  overallRating: z.number().int().min(1).max(5),
  recommendScore: z.number().int().min(0).max(10),
  commentAr: z.string().max(1000).optional(),
  commentEn: z.string().max(1000).optional(),
})

// Thin handler: auth -> rate limit -> validate -> use case -> respond.
// Identity-linked survey (2026-09-04 grilling): the caller must hold a
// patient session AND an active consent record (BCK-026) before any write.

export async function POST(req: NextRequest) {
  const account = await getPatientAccount()
  if (!account) {
    return apiError(
      401,
      'PATIENT_AUTH_REQUIRED',
      'سجّل الدخول بحساب المريض لتقييم زيارتك',
      'Sign in with your patient account to rate your visit',
    )
  }

  const limiter = surveyRateLimiter(getClientIp(req))
  if (!limiter.allowed) return tooManyRequests(limiter.retryAfterSeconds)

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload')
  }

  const parsed = surveySchema.safeParse(body)
  if (!parsed.success) {
    return apiError(
      422,
      'VALIDATION_ERROR',
      'تقييم الزيارة غير مكتمل أو غير صحيح',
      'Survey data is incomplete or invalid',
    )
  }

  try {
    await submitSurvey(
      prismaConsentReader,
      prismaSurveyTicketReader,
      prismaSurveyWriter,
      parsed.data,
      account.accountId,
    )
    return apiSuccess({ ok: true }, 201)
  } catch (err) {
    if (err instanceof ConsentRequiredError) {
      return apiError(
        403,
        'CONSENT_REQUIRED',
        'يلزم الموافقة على سياسة الخصوصية قبل إرسال التقييم',
        'Privacy-policy consent is required before submitting feedback',
      )
    }
    if (err instanceof SurveyTicketNotFoundError) {
      return apiError(
        404,
        'TICKET_NOT_FOUND',
        'لم نجد زيارة بهذا الرمز مرتبطة بحسابك',
        'No visit with this ticket is linked to your account',
      )
    }
    if (err instanceof SurveyAlreadySubmittedError) {
      return apiError(
        409,
        'SURVEY_ALREADY_SUBMITTED',
        'تم إرسال تقييم لهذه الزيارة مسبقاً',
        'A survey was already submitted for this visit',
      )
    }
    if (err instanceof InvalidSurveyError) {
      return apiError(
        422,
        'VALIDATION_ERROR',
        'قيم التقييم غير صالحة',
        'Survey values are invalid',
      )
    }
    throw err
  }
}
