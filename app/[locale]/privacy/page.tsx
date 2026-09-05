import React from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { tenantConfig } from '@/config/tenant';

const LOCALES = ['ar', 'en'] as const;

const privacyContent = {
  ar: {
    title: 'سياسة الخصوصية وحماية البيانات',
    lastUpdated: 'آخر تحديث: سبتمبر 2026',
    sections: [
      {
        heading: '1. مقدمة',
        text: 'نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية. تصف هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام موقع مستشفى كنوز الأهرام لطب وجراحة العيون.',
      },
      {
        heading: '2. البيانات التي نجمعها',
        text: 'نجمع فقط المعلومات التي تقدمها طواعية عند إنشاء حسابك: الاسم الكامل، البريد الإلكتروني، رقم الهاتف، المدينة، الجنس، ومعلوماتك الطبية التي يسجلها طاقمنا أثناء زياراتك (الاستشارات، الوصفات، الفواتير المرتبطة بحسابك). لا نجمع بيانات الدفع أو بطاقات الائتمان.',
      },
      {
        heading: '3. كيف نستخدم بياناتك',
        text: 'نستخدم بياناتك فقط لـ: عرض ملفك الطبي ومواعيدك داخل بوابة المريض، تأكيد مواعيدك عبر الواتساب، تحسين خدماتنا. لا نبيع أو نشارك بياناتك مع أطراف ثالثة لأغراض تسويقية.',
      },
      {
        heading: '4. حماية البيانات',
        text: 'كلمات المرور مشفرة بخوارزمية argon2id ولا يمكن لأي شخص — بما في ذلك فريقنا — قراءتها. جلسات الدخول محفوظة كرموز مشفرة في كوكيز آمنة (HttpOnly) لا يستطيع أي سكربت في المتصفح الوصول إليها. بياناتك الطبية مخزنة على خوادمنا ولا تُحفظ على جهازك.',
      },
      {
        heading: '5. حقوقك',
        text: 'لك الحق في: الوصول لبياناتك، تعديلها، حذفها، سحب موافقتك في أي وقت. للطلب، تواصل معنا عبر الواتساب أو البريد الإلكتروني.',
      },
      {
        heading: '6. تواصل معنا',
        text: 'لأي استفسار حول هذه السياسة، تواصل معنا عبر الواتساب على 091 529 9170 أو عبر البريد الإلكتروني.',
      },
    ],
  },
  en: {
    title: 'Privacy Policy & Data Protection',
    lastUpdated: 'Last updated: September 2026',
    sections: [
      {
        heading: '1. Introduction',
        text: 'We respect your privacy and are committed to protecting your personal data. This policy describes how we collect, use, and protect your information when you use the Konooz Al-Ahram Eye Hospital website.',
      },
      {
        heading: '2. Data We Collect',
        text: 'We only collect information you voluntarily provide when creating your account: full name, email, phone number, city, gender, and the medical information our staff record during your visits (consultations, prescriptions, and invoices linked to your account). We do not collect payment data or credit card information.',
      },
      {
        heading: '3. How We Use Your Data',
        text: 'We use your data only to: present your medical profile and appointments inside the patient portal, confirm your appointments via WhatsApp, and improve our services. We do not sell or share your data with third parties for marketing purposes.',
      },
      {
        heading: '4. Data Protection',
        text: 'Passwords are hashed with argon2id and cannot be read by anyone — including our team. Login sessions are stored as hashed tokens in secure HttpOnly cookies that no browser script can access. Your medical data lives on our servers and is never stored on your device.',
      },
      {
        heading: '5. Your Rights',
        text: 'You have the right to: access your data, modify it, delete it, and withdraw your consent at any time. To make a request, contact us via WhatsApp or email.',
      },
      {
        heading: '6. Contact Us',
        text: 'For any questions about this policy, contact us via WhatsApp at 091 529 9170 or by email.',
      },
    ],
  },
} as const;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (LOCALES as readonly string[]).includes(raw) ? raw : 'ar';
  const { baseUrl } = tenantConfig.urls;
  const title = locale === 'ar' ? 'سياسة الخصوصية | كنوز الأهرام' : 'Privacy Policy | Konooz Al-Ahram';
  const description = locale === 'ar'
    ? 'سياسة الخصوصية وحماية البيانات لمستشفى كنوز الأهرام لطب وجراحة العيون في بنغازي.'
    : 'Privacy policy and data protection for Konooz Al-Ahram Eye Hospital in Benghazi.';

  return {
    title,
    description,
    robots: { index: false, follow: true },
    alternates: {
      canonical: `${baseUrl}/${locale}/privacy`,
      languages: {
        'ar-LY': `${baseUrl}/ar/privacy`,
        'en-US': `${baseUrl}/en/privacy`,
      },
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = (LOCALES as readonly string[]).includes(raw) ? raw : 'ar';
  const copy = privacyContent[locale as keyof typeof privacyContent];
  const isRTL = locale === 'ar';

  return (
    <main className={`min-h-screen bg-bone-50 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1 text-sm text-pine-700 hover:text-pine-900 mb-8"
        >
          {isRTL ? 'العودة للموقع' : 'Back to site'}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-pine-900 mb-2">
          {copy.title}
        </h1>
        <p className="text-xs text-ink-400 mb-8">{copy.lastUpdated}</p>

        <div className="space-y-6">
          {copy.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-sm font-bold text-pine-800 mb-2">
                {section.heading}
              </h2>
              <p className="text-sm text-ink-700 leading-relaxed">
                {section.text}
              </p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
