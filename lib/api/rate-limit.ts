import { NextResponse } from 'next/server'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

export interface RateLimiterOptions {
  limit: number
  windowMs: number
}

type RateBucket = { count: number; windowStart: number }

export type RateLimiter = (key: string) => RateLimitResult

export function createRateLimiter(
  options: RateLimiterOptions,
  now: () => number = Date.now
): RateLimiter {
  const { limit, windowMs } = options
  const buckets = new Map<string, RateBucket>()

  return (key: string): RateLimitResult => {
    const current = now()
    const existing = buckets.get(key)

    if (!existing || current - existing.windowStart >= windowMs) {
      buckets.set(key, { count: 1, windowStart: current })
      return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
    }

    if (existing.count >= limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((existing.windowStart + windowMs - current) / 1000)
      )
      return { allowed: false, remaining: 0, retryAfterSeconds }
    }

    existing.count += 1
    return {
      allowed: true,
      remaining: limit - existing.count,
      retryAfterSeconds: 0,
    }
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip') ?? 'unknown'
}

export function tooManyRequests(retryAfterSeconds: number): NextResponse {
  return NextResponse.json(
    { error: 'TOO_MANY_REQUESTS' },
    {
      status: 429,
      headers: { 'Retry-After': String(retryAfterSeconds) },
    }
  )
}

export const loginRateLimiter = createRateLimiter({
  limit: 5,
  windowMs: 15 * 60 * 1000,
})

export const registerRateLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
})

export const bookingRateLimiter = createRateLimiter({
  limit: 10,
  windowMs: 60 * 60 * 1000,
})

export const surveyRateLimiter = createRateLimiter({
  limit: 5,
  windowMs: 60 * 60 * 1000,
})
