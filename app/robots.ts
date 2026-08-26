import { MetadataRoute } from 'next';
import { tenantConfig } from '@/config/tenant';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = tenantConfig.urls.baseUrl;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/'],
      },
      {
        userAgent: [
          'Googlebot',
          'Bingbot',
          'Applebot',
          'GPTBot',
          'OAI-SearchBot',
          'ClaudeBot',
          'PerplexityBot',
          'Google-Extended',
          'Meta-ExternalAgent',
        ],
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
