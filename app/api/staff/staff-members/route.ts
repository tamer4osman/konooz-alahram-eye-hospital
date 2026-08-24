import { prisma } from '@/lib/prisma'
import type { StaffMember } from '@prisma/client'
import { apiSuccess, apiError } from '@/lib/api/response'
import { getStaffUser } from '@/lib/auth/guards'

export const dynamic = 'force-dynamic'

type StaffCategory = 'surgeon' | 'consultant' | 'resident' | 'nurse' | 'technician' | 'admin'

const CATEGORIES: StaffCategory[] = ['surgeon', 'consultant', 'resident', 'nurse', 'technician', 'admin']

function toDTO(row: StaffMember) {
  return {
    id: row.id,
    nameAr: row.nameAr,
    nameEn: row.nameEn ?? '',
    roleAr: row.roleAr,
    roleEn: row.roleEn ?? '',
    category: row.category as StaffCategory,
    departmentAr: row.departmentAr,
    departmentEn: row.departmentEn ?? '',
    status: row.status,
    roomAssignedAr: row.roomAssignedAr,
    roomAssignedEn: row.roomAssignedEn ?? '',
    shift: row.shift,
    patientCountToday: row.patientCountToday,
    surgeriesCountToday: row.surgeriesCountToday,
    phone: row.phone ?? '',
    email: row.email ?? '',
    avatar: row.avatar ?? '',
    rating: row.rating,
  }
}

function parseCategory(value: unknown): StaffCategory {
  return CATEGORIES.includes(value as StaffCategory) ? (value as StaffCategory) : 'nurse'
}

export async function GET() {
  const staffUser = await getStaffUser()
  if (!staffUser) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')
  try {
    const rows = await prisma.staffMember.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return apiSuccess(rows.map(toDTO))
  } catch {
    return apiError(500, 'STAFF_FAILED', 'تعذر تحميل بيانات الطاقم', 'Failed to load staff members')
  }
}

export async function POST(request: Request) {
  const staffUser = await getStaffUser()
  if (!staffUser) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')
  try {
    const body = await request.json()
    if (!body?.nameAr || typeof body.nameAr !== 'string') {
      return apiError(400, 'INVALID_NAME', 'اسم الطاقم مطلوب', 'Staff name is required')
    }
    const maxOrder = await prisma.staffMember.aggregate({ _max: { sortOrder: true } })
    const row = await prisma.staffMember.create({
      data: {
        nameAr: body.nameAr,
        nameEn: typeof body.nameEn === 'string' ? body.nameEn : null,
        roleAr: typeof body.roleAr === 'string' ? body.roleAr : '',
        roleEn: typeof body.roleEn === 'string' ? body.roleEn : null,
        category: parseCategory(body.category),
        departmentAr: typeof body.departmentAr === 'string' ? body.departmentAr : '',
        departmentEn: typeof body.departmentEn === 'string' ? body.departmentEn : null,
        status: typeof body.status === 'string' ? body.status : 'on_duty',
        shift: typeof body.shift === 'string' ? body.shift : 'morning',
        phone: typeof body.phone === 'string' ? body.phone : null,
        email: typeof body.email === 'string' ? body.email : null,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
      },
    })
    return apiSuccess(toDTO(row))
  } catch {
    return apiError(500, 'CREATE_FAILED', 'تعذر إضافة عضو الطاقم', 'Failed to create staff member')
  }
}

export async function PATCH(request: Request) {
  const staffUser = await getStaffUser()
  if (!staffUser) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')
  try {
    const body = await request.json()
    if (!body?.id || typeof body.id !== 'string') {
      return apiError(400, 'INVALID_ID', 'معرف غير صالح', 'Invalid id')
    }
    const data: Record<string, string> = {}
    if (typeof body.status === 'string') data.status = body.status
    if (Object.keys(data).length === 0) {
      return apiError(400, 'NOTHING_TO_UPDATE', 'لا توجد حقول للتحديث', 'Nothing to update')
    }
    const row = await prisma.staffMember.update({ where: { id: body.id }, data })
    return apiSuccess(toDTO(row))
  } catch {
    return apiError(500, 'UPDATE_FAILED', 'تعذر تحديث عضو الطاقم', 'Failed to update staff member')
  }
}

export async function DELETE(request: Request) {
  const staffUser = await getStaffUser()
  if (!staffUser) return apiError(403, 'FORBIDDEN', 'هذه البيانات للطاقم المصرح لهم فقط', 'Staff access only')
  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) {
      return apiError(400, 'INVALID_ID', 'معرف غير صالح', 'Invalid id')
    }
    await prisma.staffMember.update({ where: { id }, data: { isActive: false, status: 'off_duty' } })
    return apiSuccess({ id })
  } catch {
    return apiError(500, 'DELETE_FAILED', 'تعذر حذف عضو الطاقم', 'Failed to remove staff member')
  }
}
