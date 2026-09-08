import { apiSuccess, apiError } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/admin-route'
import { auditStaffMutation } from '@/lib/api/audit'
import {
  addStaffMember,
  listStaffDirectory,
  removeStaffMember,
  updateStaffMemberStatus,
  StaffMemberNameRequiredError,
} from '@/lib/usecases/staff-members'
import {
  prismaStaffDirectoryReader,
  prismaStaffDirectoryWriter,
} from '@/lib/adapters/prisma/staff-members-adapter'

export const dynamic = 'force-dynamic'

// Thin handler: auth gate -> use case -> respond. The legacy body-shape
// validation (string-coercion rules, category fallback, soft-delete rule)
// lives in lib/usecases/staff-members.

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const members = await listStaffDirectory(prismaStaffDirectoryReader)
    return apiSuccess(members)
  } catch {
    return apiError(500, 'STAFF_FAILED', 'تعذر تحميل بيانات الطاقم', 'Failed to load staff members')
  }
}

export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    const member = await addStaffMember(prismaStaffDirectoryWriter, body)
    await auditStaffMutation(auth.user, {
      action: 'create',
      module: 'staff_members',
      targetId: typeof member.id === 'string' ? member.id : null,
    })
    return apiSuccess(member)
  } catch (err) {
    if (err instanceof StaffMemberNameRequiredError) {
      return apiError(400, 'INVALID_NAME', 'اسم الطاقم مطلوب', 'Staff name is required')
    }
    return apiError(500, 'CREATE_FAILED', 'تعذر إضافة عضو الطاقم', 'Failed to create staff member')
  }
}

export async function PATCH(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const body = await request.json()
    if (!body?.id || typeof body.id !== 'string' || typeof body.status !== 'string') {
      return apiError(400, 'NOTHING_TO_UPDATE', 'لا توجد حقول للتحديث', 'Nothing to update')
    }
    const member = await updateStaffMemberStatus(prismaStaffDirectoryWriter, body.id, body.status)
    await auditStaffMutation(auth.user, {
      action: 'update',
      module: 'staff_members',
      targetId: body.id,
    })
    return apiSuccess(member)
  } catch {
    return apiError(500, 'UPDATE_FAILED', 'تعذر تحديث عضو الطاقم', 'Failed to update staff member')
  }
}

export async function DELETE(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return apiError(400, 'INVALID_ID', 'معرف غير صالح', 'Invalid id')
    }
    await removeStaffMember(prismaStaffDirectoryWriter, id)
    await auditStaffMutation(auth.user, {
      action: 'delete',
      module: 'staff_members',
      targetId: id,
    })
    return apiSuccess({ id })
  } catch {
    return apiError(500, 'DELETE_FAILED', 'تعذر حذف عضو الطاقم', 'Failed to remove staff member')
  }
}
