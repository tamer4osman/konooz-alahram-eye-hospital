import { apiSuccess, apiError } from '@/lib/api/response'
import { getFaqs } from '@/lib/content/faqs'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const faqs = await getFaqs()
    return apiSuccess(faqs)
  } catch {
    return apiError(500, 'FAQS_FAILED', 'تعذر تحميل الأسئلة الشائعة', 'Failed to load FAQs')
  }
}
