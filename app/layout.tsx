import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Cairo, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import SEOStructuredData from '@/components/SEOStructuredData';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const viewport: Viewport = {
  themeColor: '#0a192f',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL('https://konozealahram-eye.ly'),
  title: {
    default: 'مستشفى كنوز الأهرام لطب وجراحة العيون | بنغازي - ليبيا',
    template: '%s | مستشفى كنوز الأهرام لطب وجراحة العيون',
  },
  description: 'المستشفى التخصصي الرائد لطب وجراحة العيون في بنغازي، ليبيا. أحدث تقنيات الفيمتو ليزك، الفاكو والمياه البيضاء، جراحة الشبكية والجسم الزجاجي، وزراعة القرنية بأيدي نخبة استشاريين دوليين.',
  applicationName: 'مستشفى كنوز الأهرام للعيون',
  keywords: [
    'مستشفى كنوز الأهرام',
    'مستشفى عيون بنغازي',
    'طب وجراحة العيون ليبيا',
    'فيمتو ليزك بنغازي',
    'فيمتو سمايل ليبيا',
    'عمليات تصحيح النظر بنغازي',
    'المياه البيضاء بالفاكو بنغازي',
    'جراحة الشبكية والجسم الزجاجي',
    'طبيب عيون بنغازي',
    'تثبيت القرنية المخروطية بنغازي',
    'تجميل العيون والجفون بنغازي',
    'طوارئ العيون بنغازي 24 ساعة',
    'Konooz Al-Ahram Eye Hospital',
    'Benghazi Eye Hospital',
    'Ophthalmology Libya',
    'Femto LASIK Benghazi',
  ],
  authors: [{ name: 'مستشفى كنوز الأهرام لطب وجراحة العيون', url: 'https://konozealahram-eye.ly' }],
  creator: 'Konooz Al-Ahram Eye Hospital',
  publisher: 'Konooz Al-Ahram Medical Complex',
  formatDetection: {
    email: false,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: 'https://konozealahram-eye.ly',
    languages: {
      'ar-LY': 'https://konozealahram-eye.ly?lang=ar',
      'en-US': 'https://konozealahram-eye.ly?lang=en',
      'ar': 'https://konozealahram-eye.ly?lang=ar',
      'en': 'https://konozealahram-eye.ly?lang=en',
    },
  },
  openGraph: {
    title: 'مستشفى كنوز الأهرام لطب وجراحة العيون | بنغازي - ليبيا',
    description: 'رؤية أوضح لحياة أفضل.. المستشفى التخصصي الرائد لجراحات العيون المتقدمة وتصحيح الإبصار في بنغازي، ليبيا.',
    url: 'https://konozealahram-eye.ly',
    siteName: 'مستشفى كنوز الأهرام لطب وجراحة العيون',
    locale: 'ar_LY',
    alternateLocale: ['en_US', 'ar_EG', 'ar_SA'],
    type: 'website',
    images: [
      {
        url: '/images/hospital_hero_surgery_1787188107940.webp',
        width: 1200,
        height: 630,
        alt: 'غرفة العمليات المتقدمة بمستشفى كنوز الأهرام لطب وجراحة العيون - بنغازي',
      },
      {
        url: '/images/hospital_exterior_facade_1787188119953.webp',
        width: 1200,
        height: 630,
        alt: 'المبنى الرئيسي لمستشفى كنوز الأهرام - طريق طرابلس، بنغازي',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'مستشفى كنوز الأهرام لطب وجراحة العيون | بنغازي',
    description: 'أحدث جراحات العيون، الفيمتو ليزك، والفاكو في بنغازي، ليبيا بأيدي نخبة استشاريين دوليين.',
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
    'medical-specialty': 'Ophthalmology, Refractive Surgery, Vitreoretinal, Cataract',
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${plusJakartaSans.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var p=new URLSearchParams(window.location.search).get('lang');var s=p||localStorage.getItem('konooz_lang');if(s==='en'){document.documentElement.lang='en';document.documentElement.dir='ltr';}}catch(e){}})();",
          }}
        />
        <SEOStructuredData />
      </head>
      <body className="font-sans antialiased bg-slate-50 text-slate-900 selection:bg-teal-500 selection:text-white" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}


