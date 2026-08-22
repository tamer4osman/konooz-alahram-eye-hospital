import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'مستشفى كنوز الأهرام لطب وجراحة العيون',
    short_name: 'كنوز الأهرام',
    description: 'المستشفى التخصصي الرائد لجراحة وطب العيون في بنغازي، ليبيا - تقنيات الفيمتو ليزك، الفاكو، وجراحات الشبكية',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a192f',
    theme_color: '#0d9488',
    icons: [
      {
        src: '/images/hospital_hero_surgery_1787188107940.webp',
        sizes: '192x192',
        type: 'image/jpeg',
      },
      {
        src: '/images/hospital_hero_surgery_1787188107940.webp',
        sizes: '512x512',
        type: 'image/jpeg',
      },
    ],
    lang: 'ar',
    dir: 'rtl',
  };
}
