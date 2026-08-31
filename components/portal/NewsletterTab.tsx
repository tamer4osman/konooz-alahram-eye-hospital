'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { usePortalActions } from './usePortalActions';
import { NewsletterTopic, NewsletterIssue } from '@/data/patientPortalData';
import { Sparkles, Check, ChevronRight, Bookmark } from 'lucide-react';

export default function NewsletterTab() {
  const { lang, t } = useLanguage();
  const { currentPatient, toggleNotificationPref, toggleNewsletterTopic } = usePatientAuth();
  const { triggerTestWhatsAppAlert } = usePortalActions(() => {});

  // Latest issues and topics are served from the database via the public API.
  const [newsletterTopics, setNewsletterTopics] = useState<NewsletterTopic[]>([]);
  const [newsletterIssues, setNewsletterIssues] = useState<NewsletterIssue[]>([]);
  const [activeNewsletterIssue, setActiveNewsletterIssue] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/public/newsletter')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.data) {
          setNewsletterTopics((json.data.topics ?? []) as NewsletterTopic[]);
          const issues = (json.data.issues ?? []) as NewsletterIssue[];
          setNewsletterIssues(issues);
          if (issues.length > 0) setActiveNewsletterIssue(issues[0].id);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-pine-900 text-white p-5 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brass-400" />
            <h3 className="text-base sm:text-lg font-extrabold">
              {t('نشرة كنوز الأهرام لطب وجراحة العيون', 'Konooz Al-Ahram Eye Health Digest')}
            </h3>
          </div>
          <p className="text-xs text-ink-300 mt-1 max-w-xl">
            {t(
              'أحدث التطورات العلمية، نصائح جفاف العين في المناخ الليبي، وإرشادات تصحيح النظر والمياه البيضاء تصلك دورياً عبر البريد والواتساب.',
              'Latest ophthalmic surgical advances, dry eye prevention tips, and refractive insights delivered directly to your inbox & WhatsApp.'
            )}
          </p>
        </div>

        {currentPatient && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brass-300">
              {currentPatient.communicationPreferences.newsletterSubscribed
                ? t('أنت مشترك حالياً', 'Subscribed')
                : t('غير مشترك', 'Not Subscribed')}
            </span>
            <button
              onClick={() => toggleNotificationPref('newsletterSubscribed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                currentPatient.communicationPreferences.newsletterSubscribed
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-pine-500 hover:bg-brass-400 text-pine-950'
              }`}
            >
              {currentPatient.communicationPreferences.newsletterSubscribed
                ? t('إلغاء الاشتراك', 'Unsubscribe')
                : t('اشترك مجاناً', 'Subscribe Free')}
            </button>
          </div>
        )}
      </div>

      {/* Topics of Interest Picker */}
      <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
        <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider">
          {t('المواضيع والاهتمامات الطبية المختارة:', 'Select Preferred Topics of Interest:')}
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {newsletterTopics.map((topic) => {
            const isSelected =
              currentPatient?.communicationPreferences?.newsletterTopics?.includes(topic.id) ?? true;

            return (
              <button
                type="button"
                key={topic.id}
                onClick={() => currentPatient && toggleNewsletterTopic(topic.id)}
                aria-pressed={isSelected}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-start ${
                  isSelected
                    ? 'bg-pine-50/70 border-brass-300 text-ink-900 shadow-xs'
                    : 'bg-bone-50 border-pine-200 text-ink-500 hover:border-ink-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                    isSelected ? 'bg-pine-700 border-pine-700 text-white' : 'border-ink-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="space-y-1 text-xs">
                  <strong className="block font-bold">{lang === 'ar' ? topic.titleAr : topic.titleEn}</strong>
                  <span className="inline-block text-[10px] font-semibold text-pine-800 bg-pine-100/70 px-2 py-0.5 rounded-md">
                    {lang === 'ar' ? topic.frequencyAr : topic.frequencyEn}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Latest Newsletter Issues Archive */}
      <div className="space-y-3">
        <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-2">
          <Bookmark className="w-4 h-4 text-pine-800" />
          <span>{t('أحدث الأعداد والمقالات المنشورة', 'Latest Published Issues & Clinical Articles')}</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {newsletterIssues.map((issue) => (
            <div
              key={issue.id}
              className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                activeNewsletterIssue === issue.id ? 'border-brass-400 ring-2 ring-pine-100' : 'border-pine-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] text-ink-400">
                  <span className="font-semibold text-pine-700 bg-pine-50 px-2 py-0.5 rounded-md">
                    {lang === 'ar' ? issue.categoryAr : issue.categoryEn}
                  </span>
                  <span>{lang === 'ar' ? issue.readTimeAr : issue.readTimeEn}</span>
                </div>

                <h5 className="text-sm font-extrabold text-ink-900 leading-snug">
                  {lang === 'ar' ? issue.titleAr : issue.titleEn}
                </h5>

                <p className="text-xs text-ink-500 leading-relaxed">
                  {lang === 'ar' ? issue.summaryAr : issue.summaryEn}
                </p>
              </div>

              <div className="pt-2 border-t border-bone-100 flex items-center justify-between">
                <span className="text-[10px] text-ink-500 font-mono">{issue.date}</span>
                <button
                  onClick={() => {
                    setActiveNewsletterIssue(issue.id);
                    triggerTestWhatsAppAlert('newsletter');
                  }}
                  className="text-xs font-bold text-pine-800 hover:text-pine-900 flex items-center gap-1"
                >
                  <span>{t('إرسال عبر الواتساب', 'Send to WhatsApp')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
