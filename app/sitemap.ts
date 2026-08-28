import { MetadataRoute } from 'next';
import { tenantConfig } from '@/config/tenant';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = tenantConfig.urls.baseUrl;
  const currentDate = new Date().toISOString();

  const locales = ['ar', 'en'] as const;

  const homepageEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
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

  const privacyEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/privacy`,
    lastModified: currentDate,
    changeFrequency: 'monthly' as const,
    priority: 0.3,
    alternates: {
      languages: {
        ar: `${baseUrl}/ar/privacy`,
        en: `${baseUrl}/en/privacy`,
        'ar-LY': `${baseUrl}/ar/privacy`,
        'en-US': `${baseUrl}/en/privacy`,
      },
    },
  }));

  return [...homepageEntries, ...privacyEntries];
}
