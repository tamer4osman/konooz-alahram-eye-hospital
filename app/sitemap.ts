import { MetadataRoute } from 'next';
import { tenantConfig } from '@/config/tenant';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = tenantConfig.urls.baseUrl;
  const currentDate = new Date().toISOString();

  // Section anchors are intentionally omitted: '#' fragments are not valid sitemap URLs.
  return (['ar', 'en'] as const).map((locale) => ({
    url: `${baseUrl}/${locale}`,
    lastModified: currentDate,
    changeFrequency: 'daily' as const,
    priority: 1.0,
    alternates: {
      languages: {
        ar: `${baseUrl}/ar`,
        en: `${baseUrl}/en`,
        'ar-LY': `${baseUrl}/ar`,
        'en-US': `${baseUrl}/en`,
      },
    },
  }));
}
