'use client';

import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { usePortalActions } from './usePortalActions';
import { Calendar, Clock, Eye, AlertCircle, Smartphone } from 'lucide-react';

export default function AppointmentsTab() {
  const { lang, t } = useLanguage();
  const { currentPatient } = usePatientAuth();
  const { triggerTestWhatsAppAlert } = usePortalActions(() => {});

  if (!currentPatient) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-ink-900">
            {t('سجل المواعيد والعيادات الاستشارية', 'Consultation & Surgery Appointments')}
          </h3>
          <p className="text-xs text-ink-500">
            {t('تابع مواعيد كشف العيون والعمليات الجراحية', 'Track your clinical visits and surgical schedule')}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {currentPatient.appointments.map((apt) => (
          <div key={apt.id} className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bone-100 pb-3">
              <div className="flex items-center gap-3">
                <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg bg-ink-900 text-brass-300">
                  {apt.ticketNumber}
                </span>
                <div>
                  <h4 className="text-sm font-extrabold text-ink-900">{lang === 'ar' ? apt.doctorNameAr : apt.doctorNameEn}</h4>
                  <p className="text-xs text-pine-800 font-bold">{lang === 'ar' ? apt.specialtyAr : apt.specialtyEn}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    apt.status === 'confirmed'
                      ? 'bg-pine-100 text-pine-900 border border-pine-300'
                      : apt.status === 'scheduled'
                      ? 'bg-pine-100 text-pine-900 border border-pine-300'
                      : 'bg-bone-100 text-ink-700'
                  }`}
                >
                  {apt.status === 'confirmed'
                    ? t('مؤكد وجاهز', 'Confirmed')
                    : apt.status === 'scheduled'
                    ? t('مجدول قادماً', 'Scheduled')
                    : t('مكتمل', 'Completed')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink-500">
              <div className="flex items-center gap-2 p-2 bg-bone-50 rounded-xl">
                <Calendar className="w-4 h-4 text-ink-400" />
                <span><strong>{t('التاريخ:', 'Date:')}</strong> {apt.date}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-bone-50 rounded-xl">
                <Clock className="w-4 h-4 text-ink-400" />
                <span><strong>{t('الوقت:', 'Time:')}</strong> {apt.time}</span>
              </div>
              <div className="flex items-center gap-2 p-2 bg-bone-50 rounded-xl">
                <Eye className="w-4 h-4 text-ink-400" />
                <span><strong>{t('المكان:', 'Room:')}</strong> {apt.room}</span>
              </div>
            </div>

            {apt.instructionsAr && (
              <div className="p-3 rounded-xl bg-brass-50/70 ring-1 ring-brass-300 text-brass-600 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-brass-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">{t('تعليمات وتحضيرات الموعد:', 'Patient Instructions:')}</strong>
                  <span>{lang === 'ar' ? apt.instructionsAr : apt.instructionsEn}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => triggerTestWhatsAppAlert('appointment')}
                className="px-3 py-1.5 bg-pine-50 hover:bg-pine-100 text-pine-800 border border-pine-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{t('إرسال تذكير واتساب', 'WhatsApp Reminder')}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
