'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { MessageSquareHeart, Star, Send, TicketCheck } from 'lucide-react';

/**
 * After-visit survey form (identity-linked). The server enforces: patient
 * session, privacy-policy consent (BCK-026), ticket ownership, one survey
 * per visit. Client validation mirrors those rules (lib/validation/survey-form).
 */

interface SurveyTabProps {
  notify?: (message: string, timeoutMs?: number) => void;
  /** Ticket number carried over from the appointments tab. */
  prefillTicket?: string | null;
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success' }
  | { kind: 'error'; status: number; ar: string; en: string };

export default function SurveyTab({ notify, prefillTicket }: SurveyTabProps) {
  const { lang, t } = useLanguage();

  const [ticketNumber, setTicketNumber] = useState(prefillTicket ?? '');
  const [overallRating, setOverallRating] = useState(0);
  const [recommendScore, setRecommendScore] = useState(5);
  const [comment, setComment] = useState('');
  const [state, setState] = useState<SubmitState>({ kind: 'idle' });

  const ratingLabels = [
    { value: 1, ar: 'مخيب تماماً', en: 'Very poor' },
    { value: 2, ar: 'أقل من المتوقع', en: 'Below expectations' },
    { value: 3, ar: 'مقبول', en: 'Acceptable' },
    { value: 4, ar: 'جيد جداً', en: 'Very good' },
    { value: 5, ar: 'ممتاز', en: 'Excellent' },
  ];

  const busy = state.kind === 'submitting';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { buildSurveyPayload } = await import('@/lib/validation/survey-form');
    const result = buildSurveyPayload({
      ticketNumber,
      overallRating,
      recommendScore,
      comment: comment || undefined,
      lang,
    });

    if (!result.ok) {
      const hasTicketError = !!result.errors.ticketNumber;
      const hasRatingError = !!result.errors.overallRating;
      setState({
        kind: 'error',
        status: 0,
        ar: hasTicketError
          ? 'يرجى إدخال رقم الزيارة (BK-XXXXXX)'
          : hasRatingError
            ? 'يرجى اختيار تقييم عام من ١ إلى ٥'
            : 'يرجى مراجعة القيم المدخلة',
        en: hasTicketError
          ? 'Please enter your visit ticket (BK-XXXXXX)'
          : hasRatingError
            ? 'Please pick an overall rating from 1 to 5'
            : 'Please review the entered values',
      });
      return;
    }

    setState({ kind: 'submitting' });
    try {
      const res = await fetch('/api/surveys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(result.payload),
      });

      if (res.status === 201) {
        setState({ kind: 'success' });
        setTicketNumber('');
        setOverallRating(0);
        setRecommendScore(5);
        setComment('');
        notify?.(
          lang === 'ar'
            ? 'شكراً لك! تم تسجيل تقييم زيارتك'
            : 'Thank you! Your visit feedback was recorded',
        );
        return;
      }

      const json = await res.json().catch(() => null);
      const ar = json?.error?.messageAr ?? 'تعذر إرسال التقييم، حاول مرة أخرى';
      const en = json?.error?.messageEn ?? 'Could not submit the survey, please retry';
      setState({ kind: 'error', status: res.status, ar, en });
    } catch {
      setState({
        kind: 'error',
        status: 0,
        ar: 'تعذر الاتصال بالخادم',
        en: 'Could not reach the server',
      });
    }
  };

  if (state.kind === 'success') {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-pine-200 p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-pine-100 flex items-center justify-center mx-auto mb-3">
            <MessageSquareHeart className="w-7 h-7 text-pine-700" />
          </div>
          <h3 className="text-base font-extrabold text-ink-900 mb-1">
            {t('شكراً لتقييمك', 'Thank you for your feedback')}
          </h3>
          <p className="text-xs text-ink-500 max-w-md mx-auto">
            {t(
              'قراءتك تساعدنا على تحسين تجربة كل مريض. تقييم واحد لكل زيارة.',
              'Your feedback helps us improve every patient’s experience. One survey per visit.',
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-ink-900">
            {t('قيّم زيارتك', 'Rate Your Visit')}
          </h3>
          <p className="text-xs text-ink-500">
            {t(
              'تقييم واحد لكل زيارة — مرتبط برقم الحجز',
              'One survey per visit — linked to your booking ticket',
            )}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-pine-200 shadow-xs p-5 space-y-5">
        {/* Ticket number */}
        <div>
          <label htmlFor="survey-ticket" className="block text-xs font-bold text-ink-700 mb-1.5">
            {t('رقم الزيارة', 'Visit ticket')}
          </label>
          <div className="relative">
            <TicketCheck className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-ink-400 pointer-events-none" />
            <input
              id="survey-ticket"
              type="text"
              value={ticketNumber}
              onChange={(e) => setTicketNumber(e.target.value)}
              placeholder="BK-123456"
              maxLength={20}
              className="w-full text-sm font-mono font-bold ps-9 pe-3 py-2.5 rounded-xl border border-pine-200 bg-bone-50 text-ink-900 focus:outline-none focus:ring-2 focus:ring-pine-500"
            />
          </div>
          <p className="text-[10px] text-ink-400 mt-1">
            {t('يظهر في رسالة تأكيد الحجز', 'Shown in your booking confirmation message')}
          </p>
        </div>

        {/* Overall rating */}
        <fieldset>
          <legend className="text-xs font-bold text-ink-700 mb-2">
            {t('التقييم العام للزيارة', 'Overall visit rating')}
          </legend>
          <div className="flex items-center gap-1.5" role="radiogroup" aria-label={t('التقييم العام', 'Overall rating')}>
            {ratingLabels.map(({ value, ar, en }) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={overallRating === value}
                onClick={() => setOverallRating(value)}
                title={t(ar, en)}
                className={`flex flex-col items-center gap-1 px-2.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  overallRating === value
                    ? 'bg-pine-700 text-white border-pine-700 shadow-sm'
                    : 'bg-bone-50 text-ink-600 border-pine-200 hover:bg-pine-50'
                }`}
              >
                <Star className={`w-4 h-4 ${overallRating === value ? 'fill-brass-400 text-brass-400' : 'text-ink-400'}`} />
                <span className="text-[11px] font-extrabold">{value}</span>
              </button>
            ))}
            <span className="text-[11px] text-ink-500 font-bold ms-2">
              {overallRating > 0 ? t(ratingLabels[overallRating - 1].ar, ratingLabels[overallRating - 1].en) : '—'}
            </span>
          </div>
        </fieldset>

        {/* Recommend score */}
        <div>
          <label htmlFor="survey-recommend" className="block text-xs font-bold text-ink-700 mb-2">
            {t(
              'ما مدى احتمالية ترشيحنا لغيرك؟',
              'How likely are you to recommend us?',
            )}
          </label>
          <div className="flex items-center gap-3">
            <input
              id="survey-recommend"
              type="range"
              min={0}
              max={10}
              step={1}
              value={recommendScore}
              onChange={(e) => setRecommendScore(Number(e.target.value))}
              className="flex-1 accent-pine-700 cursor-pointer"
            />
            <span className="font-mono text-sm font-extrabold text-pine-900 w-8 text-center">
              {recommendScore}
            </span>
          </div>
          <div className="flex justify-between text-[10px] text-ink-400 mt-1">
            <span>{t('لن أرشّح', 'Would not recommend')}</span>
            <span>{t('سأرشّح بالتأكيد', 'Would definitely recommend')}</span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="survey-comment" className="block text-xs font-bold text-ink-700 mb-1.5">
            {t('ملاحظاتك (اختياري)', 'Your comments (optional)')}
          </label>
          <textarea
            id="survey-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            rows={4}
            placeholder={t(
              'أخبرنا بما أعجبك أو ما يمكن تحسينه',
              'Tell us what went well or what we could improve',
            )}
            className="w-full text-sm px-3 py-2.5 rounded-xl border border-pine-200 bg-bone-50 text-ink-900 focus:outline-none focus:ring-2 focus:ring-pine-500 resize-none"
          />
          <p className="text-[10px] text-ink-400 mt-1">{comment.length} / 1000</p>
        </div>

        {/* Error banner */}
        {state.kind === 'error' && (
          <p
            role="alert"
            className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5"
          >
            {t(state.ar, state.en)}
          </p>
        )}

        <button
          type="submit"
          disabled={busy || overallRating < 1}
          className="w-full py-3 bg-pine-700 hover:bg-pine-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-extrabold shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {busy ? t('جارٍ الإرسال…', 'Submitting…') : t('إرسال التقييم', 'Submit survey')}
        </button>
      </form>
    </div>
  );
}
