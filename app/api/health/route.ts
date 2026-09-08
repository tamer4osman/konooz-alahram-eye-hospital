import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { healthResponse } from '@/lib/health/rules';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbOk = false;
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbOk = true;
  } catch (err) {
    console.error('health check: database unreachable', err);
  }
  const { httpStatus, body } = healthResponse(dbOk);
  return NextResponse.json(body, { status: httpStatus });
}
