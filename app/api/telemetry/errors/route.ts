import { z } from 'zod';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createRateLimiter,
  getClientIp,
  tooManyRequests,
} from '@/lib/api/rate-limit';

const errorReportSchema = z.object({
  message: z.string().min(1).max(1000),
  digest: z.string().max(100).optional(),
  stack: z.string().max(5000).optional(),
  locale: z.enum(['ar', 'en']).optional(),
  path: z.string().max(500).optional(),
  userAgent: z.string().max(500).optional(),
});

const limiter = createRateLimiter({ limit: 10, windowMs: 60_000 });

export async function POST(request: Request) {
  const rl = limiter(getClientIp(request));
  if (!rl.allowed) return tooManyRequests(rl.retryAfterSeconds);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_JSON' },
      { status: 400 }
    );
  }

  const parsed = errorReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'VALIDATION_ERROR' },
      { status: 422 }
    );
  }

  try {
    await prisma.clientErrorReport.create({ data: parsed.data });
  } catch {
    // telemetry write must never break the client
  }

  return NextResponse.json({ ok: true }, { status: 202 });
}
