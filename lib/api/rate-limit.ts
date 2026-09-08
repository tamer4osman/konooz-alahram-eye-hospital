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

// Memory bound for the per-process bucket maps. Keys are client-influenced
// (rotated IPv6 / spoofed direct connections in dev), so the map must not
// grow without limit. When a call pushes the map over the cap, the
// oldest-inserted buckets are dropped (Map preserves insertion order).
// Flood consequence is acceptable: an attacker spending MAX_TRACKED_KEYS
// distinct IPs already gets a fresh window per IP anyway, so evicting aged
// buckets never weakens per-IP honesty for normal traffic.
export const RATE_LIMIT_MAX_TRACKED_KEYS = 10_000

type RateBucket = { count: number; windowStart: number }

// Extra method rides along for tests/ops introspection; call sites that only
// invoke the function are unaffected by the wider type.
export type RateLimiter = ((key: string) => RateLimitResult) & {
  bucketCount(): number
}

export function createRateLimiter(
  options: RateLimiterOptions,
  now: () => number = Date.now
): RateLimiter {
  const { limit, windowMs } = options
  const buckets = new Map<string, RateBucket>()

  function evictOldest(count: number): void {
    let removed = 0
    for (const key of buckets.keys()) {
      buckets.delete(key)
      removed += 1
      if (removed >= count) break
    }
  }

  function bucketCount(): number {
    return buckets.size
  }

  const limiter = (key: string): RateLimitResult => {
    const current = now()

    if (buckets.size >= RATE_LIMIT_MAX_TRACKED_KEYS) {
      evictOldest(Math.ceil(RATE_LIMIT_MAX_TRACKED_KEYS / 10))
    }

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

  limiter.bucketCount = bucketCount
  return limiter
}

// Trust boundary: with a single trusted reverse-proxy hop (Caddy), only the
// LAST x-forwarded-for entry is appended by our own infrastructure — every
// earlier entry is client-supplied and spoofable. Reading the first entry let
// attackers rotate fake IPs to bypass every rate limiter (confirmed by audit
// 2026-09-08); reading the last entry closes that bypass.
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const entries = forwarded.split(',').map((s) => s.trim()).filter(Boolean)
    const last = entries[entries.length - 1]
    if (last) return last
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
