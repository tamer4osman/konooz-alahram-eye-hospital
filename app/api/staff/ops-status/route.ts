import { apiSuccess, apiError } from '@/lib/api/response';
import { requireAdmin } from '@/lib/api/admin-route';
import { loadOpsSnapshot } from '@/lib/usecases/ops-status/use-cases';
import { prismaOpsActivityReader, prismaOpsTelemetryReader } from '@/lib/adapters/prisma/ops-adapter';

export const dynamic = 'force-dynamic';

// Thin handler: auth gate -> use case -> respond.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const snapshot = await loadOpsSnapshot(prismaOpsTelemetryReader, prismaOpsActivityReader);
    return apiSuccess(snapshot);
  } catch {
    return apiError(500, 'OPS_SNAPSHOT_FAILED', 'تعذر جلب حالة التشغيل', 'Failed to load ops snapshot');
  }
}
