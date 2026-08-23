'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';
import Modal from '@/components/ui/Modal';
import { Clock, X, Phone } from 'lucide-react';

interface LiveQueueTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveQueueTrackerModal({ isOpen, onClose }: LiveQueueTrackerModalProps) {
  const { t, lang } = useLanguage();

  const stages = [
    { step: 1, labelAr: 'تسجيل الدخول والاستقبال', labelEn: 'Check-in & Registry' },
    { step: 2, labelAr: 'قياس حدة الإبصار وضغط العين', labelEn: 'Optometry & Tonometry' },
    { step: 3, labelAr: 'معاينة الاستشاري الزائر', labelEn: 'Consultant Examination' },
    { step: 4, labelAr: 'التصوير المقطعي أو الجراحة', labelEn: 'Diagnostic / Procedure' },
    { step: 5, labelAr: 'الصيدلية واستلام الوصفة', labelEn: 'Pharmacy & Follow-up' }
  ];

  const primaryPhoneDisplay = HOSPITAL_CONTACTS.primaryWhatsAppDisplay;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      labelledById="live-queue-tracker-title"
      panelClassName="rounded-3xl max-w-xl w-full p-6 animate-scaleUp"
    >
      {/* Modal Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-bone-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-pine-50 flex items-center justify-center text-pine-700 border border-pine-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 id="live-queue-tracker-title" className="text-base font-extrabold text-[#0B3D33]">
              {t('تتبع دورك في العيادة والعمليات', 'Clinic & Surgery Queue Tracking')}
            </h3>
            <span className="text-[11px] text-ink-500 block">
              {t('دليل رحلتك داخل المستشفى', 'Your journey guide inside the hospital')}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label={t('إغلاق', 'Close')}
          className="p-1.5 rounded-full hover:bg-bone-100 text-ink-400 hover:text-ink-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Honest availability notice */}
      <div className="mb-5 p-4 rounded-2xl bg-brass-50 ring-1 ring-brass-300 text-brass-600 space-y-1.5">
        <p className="text-xs font-extrabold flex items-start gap-1.5">
          <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
          {t('التتبع المباشر عبر الموقع لم يُفعّل بعد', 'Live tracking on this website is not active yet')}
        </p>
        <p className="text-[11px] leading-relaxed">
          {t(
            'نحن لا نستطيع عرض حالة دورك لحظياً حتى اكتمال ربط النظام الطبي. للاستعلام عن رقم تذكرتك، يرجى مراجعة موظف الاستقبال أو الاتصال بنا مباشرة.',
            'We cannot show your live queue position until hospital system integration is complete. To check your ticket status, please ask reception or call us directly.'
          )}
        </p>
        <a
          href={`tel:${primaryPhoneDisplay.replace(/[^0-9+]/g, '')}`}
          dir="ltr"
          className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg bg-white border border-brass-300 text-brass-600 text-[11px] font-bold hover:bg-brass-100 transition-colors"
        >
          <Phone className="w-3.5 h-3.5" />
          {primaryPhoneDisplay}
        </a>
      </div>

      {/* Clinical Visit Journey — informational only (no live data claimed) */}
      <div className="space-y-2 pt-1">
        <span className="text-[10px] font-extrabold text-[#0B3D33] uppercase tracking-wider block">
          {t('مراحل الزيارة السريرية النموذجية', 'Typical Clinical Visit Journey')}
        </span>

        <div className="space-y-2">
          {stages.map((st) => (
            <div
              key={st.step}
              className="flex items-center gap-3 p-2.5 rounded-xl border bg-bone-50/60 border-pine-200 text-xs text-ink-700"
            >
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] font-mono flex-shrink-0 bg-pine-200 text-ink-500">
                {st.step}
              </div>
              <span className="flex-1 font-bold">{lang === 'ar' ? st.labelAr : st.labelEn}</span>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-ink-400 italic pt-1">
          {t('معلومة إرشادية عامة — قد يختلف الترتيب الفعلي حسب حالتك الطبية.', 'General guidance only — actual order may differ based on your case.')}
        </p>
      </div>
    </Modal>
  );
}
