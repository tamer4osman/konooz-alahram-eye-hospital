import { describe, expect, it } from 'vitest'
import {
  createRateLimiter,
  getClientIp,
  RATE_LIMIT_MAX_TRACKED_KEYS,
  type RateLimiterOptions,
} from '@/lib/api/rate-limit'

function makeClock() {
  let time = 1_000_000
  return {
    now: () => time,
    advance: (ms: number) => {
      time += ms
    },
  }
}

const OPTIONS: RateLimiterOptions = { limit: 3, windowMs: 60_000 }

describe('createRateLimiter', () => {
  it('allows requests up to the limit and reports remaining count', () => {
    const clock = makeClock()
    const limiter = createRateLimiter(OPTIONS, clock.now)

    expect(limiter('ip-a')).toEqual({
      allowed: true,
      remaining: 2,
      retryAfterSeconds: 0,
    })
    expect(limiter('ip-a')).toEqual({
      allowed: true,
      remaining: 1,
      retryAfterSeconds: 0,
    })
    expect(limiter('ip-a')).toEqual({
      allowed: true,
      remaining: 0,
      retryAfterSeconds: 0,
    })
  })

  it('blocks after the limit with a retry-after hint', () => {
    const clock = makeClock()
    const limiter = createRateLimiter(OPTIONS, clock.now)

    limiter('ip-a')
    limiter('ip-a')
    limiter('ip-a')

    const blocked = limiter('ip-a')
    expect(blocked.allowed).toBe(false)
    expect(blocked.remaining).toBe(0)
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0)
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60)
  })

  it('tracks keys independently', () => {
    const clock = makeClock()
    const limiter = createRateLimiter({ limit: 1, windowMs: 60_000 }, clock.now)

    expect(limiter('ip-a').allowed).toBe(true)
    expect(limiter('ip-b').allowed).toBe(true)
    expect(limiter('ip-a').allowed).toBe(false)
    expect(limiter('ip-b').allowed).toBe(false)
  })

  it('resets the count once the window has fully elapsed', () => {
    const clock = makeClock()
    const limiter = createRateLimiter(OPTIONS, clock.now)

    for (let i = 0; i < OPTIONS.limit; i += 1) limiter('ip-a')
    expect(limiter('ip-a').allowed).toBe(false)

    clock.advance(OPTIONS.windowMs + 1)
    const fresh = limiter('ip-a')
    expect(fresh.allowed).toBe(true)
    expect(fresh.remaining).toBe(OPTIONS.limit - 1)
  })

  it('does not reset early when still inside the window', () => {
    const clock = makeClock()
    const limiter = createRateLimiter(OPTIONS, clock.now)

    for (let i = 0; i < OPTIONS.limit; i += 1) limiter('ip-a')
    clock.advance(OPTIONS.windowMs - 1)
    expect(limiter('ip-a').allowed).toBe(false)
  })

  it('bounds memory: bucket count never exceeds the cap', () => {
    const clock = makeClock()
    const limiter = createRateLimiter(OPTIONS, clock.now)

    for (let i = 0; i < RATE_LIMIT_MAX_TRACKED_KEYS + 50; i += 1) {
      limiter(`flood-${i}`)
    }
    expect(limiter.bucketCount()).toBeLessThanOrEqual(RATE_LIMIT_MAX_TRACKED_KEYS)
  })

  it('still enforces per-key limits after eviction pressure', () => {
    const clock = makeClock()
    const limiter = createRateLimiter(OPTIONS, clock.now)

    for (let i = 0; i < RATE_LIMIT_MAX_TRACKED_KEYS + 50; i += 1) {
      limiter(`flood-${i}`)
    }
    // A fresh key after the flood gets a normal window, then hits the cap.
    expect(limiter('after-flood').allowed).toBe(true)
    expect(limiter('after-flood').allowed).toBe(true)
    expect(limiter('after-flood').allowed).toBe(true)
    expect(limiter('after-flood').allowed).toBe(false)
  })

  it('eviction keeps normal traffic honest: small usage is untouched', () => {
    const clock = makeClock()
    const limiter = createRateLimiter(OPTIONS, clock.now)

    limiter('ip-a')
    limiter('ip-a')
    expect(limiter('ip-a').allowed).toBe(true)
    expect(limiter('ip-a').allowed).toBe(false)
    expect(limiter.bucketCount()).toBe(1)
  })
})

describe('getClientIp', () => {
  function reqWithHeaders(headers: Record<string, string>): Request {
    return new Request('https://example.com/api', { headers })
  }

  it('trusts only the LAST x-forwarded-for entry (proxy-appended, not spoofable)', () => {
    // Client-supplied earlier entries must be ignored: behind Caddy the last
    // entry is the only one our own proxy appended.
    expect(
      getClientIp(
        reqWithHeaders({ 'x-forwarded-for': '203.0.113.7, 10.0.0.1' })
      )
    ).toBe('10.0.0.1')
  })

  it('returns a sole spoofed-looking entry as-is (single-hop cannot be behind proxy)', () => {
    expect(
      getClientIp(reqWithHeaders({ 'x-forwarded-for': '10.9.9.9' }))
    ).toBe('10.9.9.9')
  })

  it('falls back to x-real-ip then unknown', () => {
    expect(getClientIp(reqWithHeaders({ 'x-real-ip': '198.51.100.9' }))).toBe(
      '198.51.100.9'
    )
    expect(getClientIp(reqWithHeaders({}))).toBe('unknown')
  })
})
