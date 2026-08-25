import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Alexandria } from 'next/font/google';
import SEOStructuredData from '@/components/SEOStructuredData';
import '../globals.css';

const LOCALES = ['ar', 'en'] as const;
type Locale = (typeof LOCALES)[number];

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const alexandria = Alexandria({
  subsets: ['arabic', 'latin'],
  variable: '--font-alexandria',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const SITE_COPY: Record<
  Locale,
  { title: string; description: string; ogLocale: string }
> = {
  ar: {
    title: 'مستشفى كنوز الأهرام لطب وجراحة العيون | بنغازي - ليبيا',
    description:
      'أكثر من عشرين عاماً من التميز في طب وجراحة العيون في بنغازي. فريق من كبار الاستشاريين، أحدث التقنيات، ورعاية شاملة للشبكية والقرنية والجلوكوما وتصحيح الإبصار.',
    ogLocale: 'ar_LY',
  },
  en: {
    title: 'Konooz Al-Ahram Eye Hospital | Ophthalmology - Benghazi, Libya',
    description:
      'Over twenty years of excellence in eye care and surgery in Benghazi. Senior consultants, advanced technology, and comprehensive care for retina, cornea, glaucoma, and vision correction.',
    ogLocale: 'en_US',
  },
};

const BASE_URL = 'https://konozealahram-eye.ly';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (LOCALES as readonly string[]).includes(raw)
    ? (raw as Locale)
    : 'ar';
  const copy = SITE_COPY[locale];

  return {
    metadataBase: new URL(BASE_URL),
    title: copy.title,
    description: copy.description,
    applicationName:
      locale === 'ar'
        ? 'مستشفى كنوز الأهرام الطبي'
        : 'Konooz Al-Ahram Medical Complex',
    keywords: [
      'مستشفى كنوز الأهرام',
      'مستشفى كنوز العيون',
      'عيون بنغازي',
      'ليزك بنغازي',
      'فمتو ليزك بنغازي',
      'جراحة الشبكية بنغازي',
      'Konooz Al-Ahram Eye Hospital',
      'Benghazi Eye Hospital',
      'Ophthalmology Libya',
      'Femto LASIK Benghazi',
    ],
    authors: [
      {
        name: 'مستشفى كنوز الأهرام لطب وجراحة العيون',
        url: BASE_URL,
      },
    ],
    creator: 'Konooz Al-Ahram Eye Hospital',
    publisher: 'Konooz Al-Ahram Medical Complex',
    formatDetection: {
      email: false,
      address: true,
      telephone: true,
    },
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'ar-LY': `${BASE_URL}/ar`,
        'en-US': `${BASE_URL}/en`,
        ar: `${BASE_URL}/ar`,
        en: `${BASE_URL}/en`,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: `${BASE_URL}/${locale}`,
      siteName: SITE_COPY.ar.title.split(' | ')[0],
      locale: copy.ogLocale,
      alternateLocale: [copy.ogLocale === 'ar_LY' ? 'en_US' : 'ar_LY'],
      type: 'website',
      images: [
        {
          url: '/images/hospital_hero_surgery_1787188107940.webp',
          width: 1200,
          height: 630,
        },
        {
          url: '/images/hospital_exterior_facade_1787188119953.webp',
          width: 1200,
          height: 630,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: ['/images/hospital_hero_surgery_1787188107940.webp'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    other: {
      'geo.region': 'LY-BA',
      'geo.placename': 'Benghazi',
      'geo.position': '32.0367625;20.0567031',
      'ICBM': '32.0367625, 20.0567031',
      'medical-specialty':
        'Ophthalmology, Refractive Surgery, Vitreoretinal, Cataract',
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!(LOCALES as readonly string[]).includes(raw)) notFound();
  const locale = raw as Locale;

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}
      className={alexandria.variable}
      suppressHydrationWarning
    >
      <body
        className="font-sans antialiased bg-bone-50 text-ink-900 selection:bg-pine-900 selection:text-bone-50"
        suppressHydrationWarning
      >
        <SEOStructuredData />
        {children}
      </body>
    </html>
  );
}
