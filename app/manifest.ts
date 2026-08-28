import { MetadataRoute } from 'next';
import { tenantConfig } from '@/config/tenant';

export default function manifest(): MetadataRoute.Manifest {
  const { manifest } = tenantConfig;
  return {
    name: manifest.nameAr,
    short_name: manifest.shortNameAr,
    description: manifest.descriptionAr,
    start_url: '/',
    display: 'standalone',
    background_color: manifest.backgroundColor,
    theme_color: manifest.themeColor,
    icons: [
      {
        src: manifest.iconPath,
        sizes: '192x192',
        type: 'image/webp',
      },
      {
        src: manifest.iconPath,
        sizes: '512x512',
        type: 'image/webp',
      },
    ],
    lang: 'ar',
    dir: 'rtl',
  };
}
