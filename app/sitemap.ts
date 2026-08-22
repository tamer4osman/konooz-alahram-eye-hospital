import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://konozealahram-eye.ly';
  const currentDate = new Date().toISOString();

  // Root entry with language alternates (?lang= is honored at runtime).
  // Section anchors are intentionally omitted: '#' fragments are not valid sitemap URLs.
  return [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'daily',
      priority: 1.0,
      alternates: {
        languages: {
          ar: `${baseUrl}?lang=ar`,
          en: `${baseUrl}?lang=en`,
          'ar-LY': `${baseUrl}?lang=ar`,
          'en-US': `${baseUrl}?lang=en`,
        },
      },
    },
  ];
}

