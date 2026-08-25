import { apiSuccess, apiError } from '@/lib/api/response'
import { getPublicDoctors } from '@/lib/doctors'

// ISR: content is read-mostly; revalidate at most every 5 minutes.
export const revalidate = 300

export async function GET() {
  try {
    const doctors = await getPublicDoctors()
    return apiSuccess(doctors)
  } catch {
    return apiError(500, 'DOCTORS_FETCH_FAILED', 'تعذر تحميل قائمة الأطباء', 'Failed to load doctors list')
  }
}