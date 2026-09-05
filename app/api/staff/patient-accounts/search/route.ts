import { NextRequest } from 'next/server'
import { z } from 'zod'
import { apiSuccess } from '@/lib/api/response'
import { requireAdmin } from '@/lib/api/admin-route'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// Staff account picker search (D5): find portal accounts by phone, email, or
// name fragment so staff-authored records can link to the right patient at
// entry time. Bounded result set — a picker, not a directory.

const querySchema = z.object({
  q: z.string().min(2).max(80),
})

export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const parsed = querySchema.safeParse({ q: req.nextUrl.searchParams.get('q') ?? '' })
  if (!parsed.success) {
    return apiSuccess([])
  }

  const q = parsed.data.q.trim()
  const rows = await prisma.patientProfile.findMany({
    where: {
      OR: [
        { phone: { contains: q } },
        { fullNameAr: { contains: q } },
        { fullNameEn: { contains: q } },
        { account: { email: { contains: q.toLowerCase() } } },
      ],
    },
    include: { account: { select: { email: true } } },
    orderBy: { updatedAt: 'desc' },
    take: 10,
  })

  return apiSuccess(
    rows.map((r) => ({
      accountId: r.accountId,
      profileId: r.id,
      labelAr: r.fullNameAr,
      labelEn: r.fullNameEn ?? r.fullNameAr,
      phone: r.phone,
      email: r.account.email,
    })),
  )
}
