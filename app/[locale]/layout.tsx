import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Alexandria } from 'next/font/google';
import SEOStructuredData from '@/components/SEOStructuredData';
import { tenantConfig } from '@/config/tenant';
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

function siteCopy(locale: Locale) {
  const { seo, geo } = tenantConfig;
  return {
    title: locale === 'ar' ? seo.titleAr : seo.titleEn,
    description: locale === 'ar' ? seo.descriptionAr : seo.descriptionEn,
    ogLocale: locale === 'ar' ? 'ar_LY' : 'en_US',
    applicationName:
      locale === 'ar' ? seo.applicationNameAr : seo.applicationNameEn,
    keywords: seo.keywords,
    geoPosition: `${geo.lat};${geo.lng}`,
    icbm: `${geo.lat},${geo.lng}`,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (LOCALES as readonly string[]).includes(raw)
    ? (raw as Locale)
    : 'ar';
  const copy = siteCopy(locale);
  const { baseUrl } = tenantConfig.urls;

  return {
    metadataBase: new URL(baseUrl),
    title: copy.title,
    description: copy.description,
    applicationName: copy.applicationName,
    keywords: copy.keywords,
    authors: [
      {
        name: tenantConfig.identity.nameAr,
        url: baseUrl,
      },
    ],
    creator: tenantConfig.identity.nameEn,
    publisher: tenantConfig.seo.applicationNameEn,
    formatDetection: {
      email: false,
      address: true,
      telephone: true,
    },
    alternates: {
      canonical: `${baseUrl}/${locale}`,
      languages: {
        'ar-LY': `${baseUrl}/ar`,
        'en-US': `${baseUrl}/en`,
        ar: `${baseUrl}/ar`,
        en: `${baseUrl}/en`,
      },
    },
    openGraph: {
      title: copy.title,
      description: copy.description,
      url: `${baseUrl}/${locale}`,
      siteName: tenantConfig.identity.nameAr,
      locale: copy.ogLocale,
      alternateLocale: [copy.ogLocale === 'ar_LY' ? 'en_US' : 'ar_LY'],
      type: 'website',
      images: tenantConfig.seo.ogImages.map((img) => ({
        url: img.path,
        width: img.width,
        height: img.height,
      })),
    },
    twitter: {
      card: 'summary_large_image',
      title: copy.title,
      description: copy.description,
      images: [tenantConfig.seo.ogImages[0].path],
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
      'geo.region': tenantConfig.geo.regionCode,
      'geo.placename': tenantConfig.geo.placename,
      'geo.position': copy.geoPosition,
      'ICBM': copy.icbm,
      'medical-specialty': tenantConfig.geo.medicalSpecialty,
    },
  };
}

function buildTenantThemeCss(): string {
  const { primary, surface, text, accent, fontFamily } = tenantConfig.theme;
  const groups: Array<[string, Record<string, string>]> = [
    ['primary', primary],
    ['surface', surface],
    ['text', text],
    ['accent', accent],
  ];
  const decls: string[] = [];
  for (const [name, steps] of groups) {
    for (const [step, hex] of Object.entries(steps)) {
      decls.push(`--tc-${name}-${step}:${hex}`);
    }
  }
  if (fontFamily) {
    decls.push(`--tc-font-family:${fontFamily}`);
  }
  return `:root{${decls.join(';')}}`;
}

const TENANT_THEME_CSS = buildTenantThemeCss();

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
      <head>
        <link
          rel="preload"
          as="image"
          href="/images/hospital_hero_surgery_1787188107940.webp"
          fetchPriority="high"
        />
      </head>
      <body
        className="font-sans antialiased bg-bone-50 text-ink-900 selection:bg-pine-900 selection:text-bone-50"
        suppressHydrationWarning
      >
        <style
          href="tenant-theme"
          precedence="high"
          dangerouslySetInnerHTML={{ __html: TENANT_THEME_CSS }}
        />
        <Suspense fallback={null}>
          <SEOStructuredData />
        </Suspense>
        {children}
      </body>
    </html>
  );
}
