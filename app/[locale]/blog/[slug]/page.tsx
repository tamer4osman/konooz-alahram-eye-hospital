import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { blogArticles, getBlogArticleBySlug } from '@/data/blog-articles';
import { tenantConfig } from '@/config/tenant';
import { safeJsonLd } from '@/lib/security/jsonld';
import { getNonce } from '@/lib/security/csp';

export async function generateStaticParams() {
  return blogArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale = raw === 'en' ? 'en' : 'ar';
  const article = getBlogArticleBySlug(slug);
  if (!article) return {};

  const isAr = locale === 'ar';
  const { baseUrl } = tenantConfig.urls;

  return {
    title: isAr ? article.titleAr : article.titleEn,
    description: isAr ? article.excerptAr : article.excerptEn,
    alternates: {
      canonical: `${baseUrl}/${locale}/blog/${slug}`,
      languages: {
        'x-default': `${baseUrl}/ar/blog/${slug}`,
        'ar-LY': `${baseUrl}/ar/blog/${slug}`,
        'en-US': `${baseUrl}/en/blog/${slug}`,
        ar: `${baseUrl}/ar/blog/${slug}`,
        en: `${baseUrl}/en/blog/${slug}`,
      },
    },
    openGraph: {
      title: isAr ? article.titleAr : article.titleEn,
      description: isAr ? article.excerptAr : article.excerptEn,
      url: `${baseUrl}/${locale}/blog/${slug}`,
      type: 'article',
      publishedTime: article.datePublished,
      modifiedTime: article.dateModified,
      authors: [isAr ? article.authorAr : article.authorEn],
    },
  };
}

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  const locale = raw === 'en' ? 'en' : 'ar';
  const article = getBlogArticleBySlug(slug);
  if (!article) notFound();

  const isAr = locale === 'ar';
  const { baseUrl } = tenantConfig.urls;
  const title = isAr ? article.titleAr : article.titleEn;
  const content = isAr ? article.contentAr : article.contentEn;
  const author = isAr ? article.authorAr : article.authorEn;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: isAr ? article.excerptAr : article.excerptEn,
    url: `${baseUrl}/${locale}/blog/${slug}`,
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    author: {
      '@type': 'Person',
      name: author,
      worksFor: {
        '@type': 'Hospital',
        name: tenantConfig.identity.nameAr,
        url: baseUrl,
      },
    },
    publisher: {
      '@type': 'Organization',
      name: tenantConfig.identity.nameAr,
      url: baseUrl,
    },
    inLanguage: locale === 'ar' ? 'ar-LY' : 'en-US',
    about: {
      '@type': 'MedicalCondition',
      name: article.specialty,
    },
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: isAr ? 'الرئيسية' : 'Home',
        item: `${baseUrl}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: isAr ? 'مقالات طب العيون' : 'Eye Care Articles',
        item: `${baseUrl}/${locale}/blog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
      },
    ],
  };

  const paragraphs = content.split('\n\n').filter(Boolean);

  return (
    <div className="min-h-screen bg-bone-50">
      <script
        type="application/ld+json"
        nonce={await getNonce()}
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        nonce={await getNonce()}
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <nav className="mb-8 text-sm text-ink-400" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2">
            <li>
              <Link href={`/${locale}`} className="hover:text-pine-700 transition-colors">
                {isAr ? 'الرئيسية' : 'Home'}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href={`/${locale}/blog`} className="hover:text-pine-700 transition-colors">
                {isAr ? 'مقالات طب العيون' : 'Eye Care Articles'}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-ink-700 font-medium">
              {title}
            </li>
          </ol>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-4 text-sm text-ink-400">
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

          <h1 className="text-3xl sm:text-4xl font-extrabold text-ink-900 mb-4">
            {title}
          </h1>

          <p className="text-lg text-ink-500 leading-relaxed">
            {isAr ? article.excerptAr : article.excerptEn}
          </p>

          <div className="mt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pine-100 flex items-center justify-center">
              <span className="text-sm font-bold text-pine-700">
                {author.split(' ').map((w) => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-700">{author}</p>
              <p className="text-xs text-ink-400">{article.specialty}</p>
            </div>
          </div>
        </header>

        <div className="prose prose-lg max-w-none text-ink-700 leading-relaxed space-y-6">
          {paragraphs.map((para, i) => {
            if (para.startsWith('## ')) {
              return (
                <h2 key={i} className="text-2xl font-bold text-ink-900 mt-8 mb-4">
                  {para.replace('## ', '')}
                </h2>
              );
            }
            if (para.startsWith('### ')) {
              return (
                <h3 key={i} className="text-xl font-bold text-ink-900 mt-6 mb-3">
                  {para.replace('### ', '')}
                </h3>
              );
            }
            return (
              <p key={i} className="text-ink-700 leading-relaxed">
                {para}
              </p>
            );
          })}
        </div>

        <footer className="mt-12 pt-8 border-t border-bone-200">
          <Link
            href={`/${locale}/blog`}
            className="text-pine-700 hover:text-pine-900 font-semibold transition-colors"
          >
            {isAr ? '← العودة إلى المقالات' : '← Back to Articles'}
          </Link>
        </footer>
      </article>
    </div>
  );
}
