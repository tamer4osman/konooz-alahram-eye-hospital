'use client';

import React, { useState } from 'react';
import { X, Radio, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Modal from '@/components/ui/Modal';

export type BroadcastLevel = 'info' | 'urgent' | 'alert';

interface BroadcastModalProps {
  open: boolean;
  onClose: () => void;
  onBroadcast: (message: string, level: BroadcastLevel) => void;
}

export default function BroadcastModal({ open, onClose, onBroadcast }: BroadcastModalProps) {
  const { t } = useLanguage();
  const [message, setMessage] = useState('');
  const [level, setLevel] = useState<BroadcastLevel>('info');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onBroadcast(message, level);
    onClose();
    setMessage('');
  };

  return (
    <Modal isOpen={open} onClose={onClose} labelledById="broadcast-title" panelClassName="max-w-lg w-full p-6">
      <button
        onClick={onClose}
        className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="mb-4">
        <h3 id="broadcast-title" className="text-base font-extrabold text-rose-700 flex items-center gap-2">
          <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
          <span>{t('إرسال تعميم وإشعار لحظي لكافة أجنحة المستشفى', 'Complex-Wide Audio & Visual Broadcast')}</span>
        </h3>
        <p className="text-xs text-ink-500 mt-0.5">
          {t('يظهر هذا الإشعار فورا في جميع شاشات غرف العمليات والعيادات والاستقبال', 'Instantly displayed on all live screens in theaters, clinics, and nurse stations')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="font-bold text-ink-700 block mb-1">{t('مستوى الأهمية والإنذار', 'Alert Severity Level')}</label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setLevel('info')}
              className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                level === 'info' ? 'bg-pine-50 border-pine-700 text-pine-800' : 'bg-bone-50 text-ink-500'
              }`}
            >
              {t('إشعار إداري عام', 'General Info')}
            </button>
            <button
              type="button"
              onClick={() => setLevel('urgent')}
              className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                level === 'urgent' ? 'bg-brass-50 ring-1 ring-brass-400 text-brass-600' : 'bg-bone-50 text-ink-500'
              }`}
            >
              {t('تنبيه هام', 'High Priority')}
            </button>
            <button
              type="button"
              onClick={() => setLevel('alert')}
              className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                level === 'alert' ? 'bg-rose-50 border-rose-600 text-rose-800' : 'bg-bone-50 text-ink-500'
              }`}
            >
              {t('طوارئ عاجلة (Code)', 'Urgent Emergency')}
            </button>
          </div>
        </div>

        <div>
          <label className="font-bold text-ink-700 block mb-1">{t('نص الإشعار / التعميم *', 'Broadcast Message *')}</label>
          <textarea
            rows={3}
            required
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t('يرجى من فريق التمريض تجهيز جناح العمليات 2 لجراحة مياه بيضاء طارئة...', 'All teams note: Visiting Professor Dr. Katamish starting refractive laser schedule in OR-3...')}
            className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-semibold"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-ink-500 hover:bg-bone-100 rounded-xl font-bold transition-colors cursor-pointer"
          >
            {t('إلغاء', 'Cancel')}
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>{t('بث الإشعار الآن', 'Broadcast Now')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
