import { MetadataRoute } from 'next';
import { tenantConfig } from '@/config/tenant';
import { blogArticles } from '@/data/blog-articles';

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
        'x-default': `${baseUrl}/ar`,
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

  const blogIndexEntries: MetadataRoute.Sitemap = locales.map((locale) => ({
    url: `${baseUrl}/${locale}/blog`,
    lastModified: currentDate,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
    alternates: {
      languages: {
        ar: `${baseUrl}/ar/blog`,
        en: `${baseUrl}/en/blog`,
        'ar-LY': `${baseUrl}/ar/blog`,
        'en-US': `${baseUrl}/en/blog`,
      },
    },
  }));

  const blogArticleEntries: MetadataRoute.Sitemap = blogArticles.flatMap((article) =>
    locales.map((locale) => ({
      url: `${baseUrl}/${locale}/blog/${article.slug}`,
      lastModified: article.dateModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
      alternates: {
        languages: {
          ar: `${baseUrl}/ar/blog/${article.slug}`,
          en: `${baseUrl}/en/blog/${article.slug}`,
          'ar-LY': `${baseUrl}/ar/blog/${article.slug}`,
          'en-US': `${baseUrl}/en/blog/${article.slug}`,
        },
      },
    }))
  );

  return [...homepageEntries, ...privacyEntries, ...blogIndexEntries, ...blogArticleEntries];
}
