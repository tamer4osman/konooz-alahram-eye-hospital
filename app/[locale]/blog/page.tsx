import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { blogArticles } from '@/data/blog-articles';
import { tenantConfig } from '@/config/tenant';
import { safeJsonLd } from '@/lib/security/jsonld';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = raw === 'en' ? 'en' : 'ar';
  const { baseUrl } = tenantConfig.urls;

  return {
    title: locale === 'ar' ? 'مقالات طب العيون | كنوز الأهرام' : 'Eye Care Articles | Konooz Al-Ahram',
    description: locale === 'ar'
      ? 'مقالات متخصصة في طب وجراحة العيون من أطباء مستشفى كنوز الأهرام بنغازي'
      : 'Specialized articles on eye surgery and ophthalmology from Konooz Al-Ahram Hospital doctors in Benghazi',
    alternates: {
      canonical: `${baseUrl}/${locale}/blog`,
      languages: {
        'x-default': `${baseUrl}/ar/blog`,
        'ar-LY': `${baseUrl}/ar/blog`,
        'en-US': `${baseUrl}/en/blog`,
        ar: `${baseUrl}/ar/blog`,
        en: `${baseUrl}/en/blog`,
      },
    },
    openGraph: {
      title: locale === 'ar' ? 'مقالات طب العيون' : 'Eye Care Articles',
      description: locale === 'ar'
        ? 'مقالات متخصصة في طب وجراحة العيون'
        : 'Specialized articles on eye surgery and ophthalmology',
      url: `${baseUrl}/${locale}/blog`,
      type: 'website',
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = raw === 'en' ? 'en' : 'ar';
  const isAr = locale === 'ar';
  const { baseUrl } = tenantConfig.urls;

  const blogListSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: isAr ? 'مقالات طب العيون' : 'Eye Care Articles',
    description: isAr
      ? 'مقالات متخصصة في طب وجراحة العيون من مستشفى كنوز الأهرام'
      : 'Specialized articles on eye surgery from Konooz Al-Ahram Hospital',
    url: `${baseUrl}/${locale}/blog`,
    hasPart: blogArticles.map((article) => ({
      '@type': 'Article',
      headline: isAr ? article.titleAr : article.titleEn,
      url: `${baseUrl}/${locale}/blog/${article.slug}`,
      datePublished: article.datePublished,
      author: {
        '@type': 'Person',
        name: isAr ? article.authorAr : article.authorEn,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-bone-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(blogListSchema) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 mb-4">
            {isAr ? 'مقالات طب العيون' : 'Eye Care Articles'}
          </h1>
          <p className="text-lg text-ink-500">
            {isAr
              ? 'مقالات متخصصة من أطباء مستشفى كنوز الأهرام لطب وجراحة العيون في بنغازي'
              : 'Specialized articles from doctors at Konooz Al-Ahram Eye Hospital in Benghazi'}
          </p>
        </header>

        <div className="space-y-8">
          {blogArticles.map((article) => (
            <article
              key={article.slug}
              className="bg-white rounded-2xl border border-bone-200 p-6 sm:p-8 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3 text-sm text-ink-400">
                <time dateTime={article.datePublished}>
                  {new Date(article.datePublished).toLocaleDateString(isAr ? 'ar-LY' : 'en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
                <span aria-hidden="true">·</span>
                <span>{article.readTimeMinutes} {isAr ? 'دقائق قراءة' : 'min read'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-3">
                <Link
                  href={`/${locale}/blog/${article.slug}`}
                  className="hover:text-pine-700 transition-colors"
                >
                  {isAr ? article.titleAr : article.titleEn}
                </Link>
              </h2>

              <p className="text-ink-500 leading-relaxed mb-4">
                {isAr ? article.excerptAr : article.excerptEn}
              </p>

              <div className="flex items-center justify-between">
                <span className="text-sm text-ink-400">
                  {isAr ? article.authorAr : article.authorEn}
                </span>
                <Link
                  href={`/${locale}/blog/${article.slug}`}
                  className="text-sm font-semibold text-pine-700 hover:text-pine-900 transition-colors"
                >
                  {isAr ? 'اقرأ المزيد ←' : 'Read more →'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
