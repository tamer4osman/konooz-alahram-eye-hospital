import { apiSuccess, apiError } from '@/lib/api/response';
import { getPublicDoctors } from '@/lib/doctors';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const doctors = await getPublicDoctors();
    return apiSuccess(doctors);
  } catch {
    return apiError(500, 'DOCTORS_FETCH_FAILED', 'تعذر تحميل قائمة الأطباء', 'Failed to load doctors list');
  }
}
