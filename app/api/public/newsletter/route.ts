import { apiSuccess, apiError } from '@/lib/api/response'
import { getNewsletterContent } from '@/lib/content/public-content'

export const revalidate = 300

export async function GET() {
  try {
    const content = await getNewsletterContent()
    return apiSuccess(content)
  } catch {
    return apiError(500, 'NEWSLETTER_FAILED', 'تعذر تحميل محتوى النشرة', 'Failed to load newsletter content')
  }
}