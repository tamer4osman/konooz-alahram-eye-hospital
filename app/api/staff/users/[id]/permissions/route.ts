import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/api/admin-route';
import { apiSuccess, apiError } from '@/lib/api/response';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const permissionsSchema = z.object({
  permissions: z.record(z.string(), z.enum(['read', 'write'])),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return apiError(400, 'INVALID_JSON', 'صيغة الطلب غير صالحة', 'Invalid request payload');
  }

  const parsed = permissionsSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(422, 'VALIDATION_ERROR', 'الصلاحيات غير صالحة', 'Invalid permissions');
  }

  try {
    await prisma.user.update({
      where: { id },
      data: { permissions: parsed.data.permissions },
    });
    return apiSuccess({ ok: true });
  } catch {
    return apiError(500, 'UPDATE_FAILED', 'تعذر حفظ الصلاحيات', 'Failed to save permissions');
  }
}
