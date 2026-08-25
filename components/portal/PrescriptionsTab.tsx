'use client';

import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { usePortalActions } from './usePortalActions';
import { Pill, Bell } from 'lucide-react';

export default function PrescriptionsTab() {
  const { lang, t } = useLanguage();
  const { currentPatient } = usePatientAuth();
  const { triggerTestWhatsAppAlert } = usePortalActions(() => {});

  if (!currentPatient) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-extrabold text-ink-900">
            {t('الوصفات الطبية ومواعيد القطرات والعلاج', 'Ophthalmic Prescriptions & Drop Schedules')}
          </h3>
          <p className="text-xs text-ink-500">
            {t('الخطة العلاجية المعتمدة من الاستشاري مع توقيتات وجرعات القطرات', 'Approved clinical prescriptions and eye drops timetable')}
          </p>
        </div>

        <button
          onClick={() => triggerTestWhatsAppAlert('eyedrops')}
          className="px-3.5 py-2 bg-pine-50 hover:bg-pine-100 border border-pine-200 text-pine-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Bell className="w-4 h-4 text-emerald-600" />
          <span>{t('تنبيه بموعد القطرة الآن', 'Send Drop Reminder Alert')}</span>
        </button>
      </div>

      {currentPatient.prescriptions.length > 0 ? (
        currentPatient.prescriptions.map((rx) => (
          <div key={rx.id} className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bone-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Pill className="w-4 h-4 text-pine-700" />
                  <h4 className="text-sm font-extrabold text-ink-900">{lang === 'ar' ? rx.doctorAr : rx.doctorEn}</h4>
                </div>
                <p className="text-xs text-ink-500 mt-0.5">
                  <strong>{t('التشخيص:', 'Diagnosis:')}</strong> {lang === 'ar' ? rx.diagnosisAr : rx.diagnosisEn}
                </p>
              </div>
              <span className="text-xs font-mono text-ink-500 bg-bone-100 px-2.5 py-1 rounded-lg">
                {rx.date}
              </span>
            </div>

            <div className="space-y-2">
              <span className="block text-xs font-extrabold text-ink-700 uppercase tracking-wider">{t('الأدوية والقطرات الموصوفة:', 'Prescribed Eye Medications:')}</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {rx.medications.map((med, i) => (
                  <div key={i} className="p-3.5 bg-bone-50 rounded-xl border border-pine-200 space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <strong className="text-ink-900 font-extrabold text-xs sm:text-sm">{med.name}</strong>
                      <span className="px-2 py-0.5 rounded-md bg-pine-100 text-pine-900 font-mono font-bold text-[10px]">
                        {med.targetEye}
                      </span>
                    </div>
                    <div className="text-ink-700">
                      <span><strong>{t('الجرعة:', 'Dosage:')}</strong> {lang === 'ar' ? med.dosageAr : med.dosageEn}</span>
                    </div>
                    <div className="text-emerald-700 font-bold">
                      <span><strong>{t('التكرار:', 'Frequency:')}</strong> {lang === 'ar' ? med.frequencyAr : med.frequencyEn}</span>
                    </div>
                    <div className="text-ink-500 text-[11px]">
                      <span><strong>{t('المدة:', 'Duration:')}</strong> {lang === 'ar' ? med.durationAr : med.durationEn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center border border-pine-200 text-ink-500 space-y-2">
          <Pill className="w-10 h-10 text-ink-300 mx-auto" />
          <p className="text-sm font-bold">{t('لا توجد وصفات طبية سابقة مسجلة', 'No prescriptions recorded yet')}</p>
          <p className="text-xs text-ink-400">{t('سيقوم الطبيب بإدراج الخطة العلاجية والقطرات عقب انتهاء الكشف.', 'The consultant will record your prescription following examination.')}</p>
        </div>
      )}
    </div>
  );
}
