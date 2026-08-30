'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';
import { Eye, AlignLeft, Volume2, RotateCcw } from 'lucide-react';

export default function AccessibilityToolbar() {
  const {
    lang,
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    highContrast,
    toggleHighContrast,
    readingRuler,
    toggleReadingRuler,
    t,
  } = useLanguage();

  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeakOverview = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert(
        lang === 'ar'
          ? 'المتصفح لا يدعم القراءة الصوتية المباشرة.'
          : 'Speech synthesis is not supported on this browser.'
      );
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToSpeak =
      lang === 'ar'
        ? `مرحباً بكم في مستشفى كنوز الأهرام لطب وجراحة العيون في بنغازي. طريق طرابلس بجانب قوس معهد الكهرباء. للحجز والاستفسار يرجى الاتصال على ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay} أو ${HOSPITAL_CONTACTS.phoneNumbers[1].display}.`
        : `Welcome to Konooz Al-Ahram Eye and Ophthalmic Surgery Hospital in Benghazi, Libya on Tripoli Road. For bookings and inquiries call ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}.`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      id="accessibility-toolbar"
      className="flex items-center gap-1.5 sm:gap-2 text-xs"
      aria-label="Vision Accessibility Controls"
    >
      {/* Font Size Adjusters */}
      <div className="flex items-center bg-white/10 rounded-lg p-0.5 ring-1 ring-white/15">
        <button
          id="btn-font-decrease"
          onClick={decreaseFontSize}
          title={t('تصغير حجم الخط', 'Decrease font size')}
          disabled={fontSize === 'sm'}
          className="min-h-[26px] px-1.5 py-1 text-pine-200 hover:text-white disabled:opacity-40 rounded transition-colors text-[11px] font-bold"
          aria-label="Decrease text size"
        >
          A-
        </button>
        <button
          id="btn-font-reset"
          onClick={resetFontSize}
          title={t('إعادة ضبط الخط', 'Reset font size')}
          className={`min-h-[26px] px-1.5 py-1 inline-flex items-center gap-0.5 text-[10px] font-medium rounded transition-colors ${
            fontSize === 'base' ? 'text-brass-300 font-bold' : 'text-pine-300 hover:text-white'
          }`}
          aria-label={t('إعادة ضبط الخط', 'Reset font size')}
        >
          <RotateCcw className="w-2.5 h-2.5 inline mr-0.5" />
          {t('افتراضي', 'Default')}
        </button>
        <button
          id="btn-font-increase"
          onClick={increaseFontSize}
          title={t('تكبير حجم الخط', 'Increase font size')}
          disabled={fontSize === 'xl'}
          className="min-h-[26px] px-1.5 py-1 text-pine-200 hover:text-white disabled:opacity-40 rounded transition-colors text-[11px] font-bold"
          aria-label="Increase text size"
        >
          A+
        </button>
      </div>

      {/* High Contrast Toggle */}
      <button
        id="btn-high-contrast-toggle"
        onClick={toggleHighContrast}
        className={`min-h-[28px] flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all ${
          highContrast
            ? 'bg-brass-400 text-pine-950 border-brass-300 font-bold ring-2 ring-brass-300/40'
            : 'bg-white/10 text-pine-200 ring-1 ring-white/15 hover:text-white'
        }`}
        title={t('نمط التباين العالي لضعاف البصر', 'High contrast mode for low-vision patients')}
        aria-pressed={highContrast}
      >
        <Eye className="w-3.5 h-3.5" />
        <span className="hidden md:inline">{t('تباين عالي', 'Contrast')}</span>
      </button>

      {/* Reading Guide Ruler Toggle */}
      <button
        id="btn-reading-ruler-toggle"
        onClick={toggleReadingRuler}
        className={`hidden sm:min-h-[28px] flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all ${
          readingRuler
            ? 'bg-brass-400 text-pine-950 font-bold ring-2 ring-brass-300/40'
            : 'bg-white/10 text-pine-200 ring-1 ring-white/15 hover:text-white'
        }`}
        title={t('مسطرة القراءة لتتبع الأسطر', 'Reading guide line for easier visual tracking')}
        aria-pressed={readingRuler}
      >
        <AlignLeft className="w-3.5 h-3.5" />
        <span className="hidden lg:inline">{t('مسطرة القراءة', 'Reading Line')}</span>
      </button>

      {/* Audio Reader Assistance */}
      <button
        id="btn-audio-speak"
        onClick={handleSpeakOverview}
        className={`min-h-[28px] flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-medium transition-all ${
          isSpeaking
            ? 'bg-brass-400 text-pine-950 font-bold'
            : 'bg-white/10 text-pine-200 ring-1 ring-white/15 hover:text-white'
        }`}
        title={t('استماع للبيانات الأساسية صوتياً', 'Listen to hospital info')}
      >
        <Volume2 className="w-3.5 h-3.5" />
        <span className="hidden xl:inline">{isSpeaking ? t('إيقاف الصوت', 'Stop') : t('قارئ صوتي', 'Audio')}</span>
      </button>
    </div>
  );
}
