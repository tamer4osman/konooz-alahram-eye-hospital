import { apiSuccess, apiError } from '@/lib/api/response'
import { getPublicTestimonials } from '@/lib/content/public-content'

export const revalidate = 300

export async function GET() {
  try {
    const testimonials = await getPublicTestimonials()
    return apiSuccess(testimonials)
  } catch {
    return apiError(500, 'TESTIMONIALS_FAILED', 'تعذر تحميل الشهادات', 'Failed to load testimonials')
  }
}