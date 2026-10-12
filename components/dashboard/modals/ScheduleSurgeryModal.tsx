'use client';

import React, { useState } from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ScheduledSurgery } from '@/data/dashboardData';
import { useApiSubmit } from '@/hooks/useApiSubmit';
import DashboardModalFrame from '@/components/ui/DashboardModalFrame';
import ModalFormFooter from '@/components/ui/ModalFormFooter';

/**
 * Surgical procedure catalogue. `ar` is the value persisted in
 * procedureAr (unchanged from the original stored data); `labelAr`/`labelEn`
 * are what the operator reads; `en` is the value persisted in procedureEn so
 * both languages stay in sync instead of the English name staying frozen on
 * whichever procedure was the default.
 */
const PROCEDURE_OPTIONS: { ar: string; labelAr: string; labelEn: string; en: string }[] = [
  {
    ar: 'عملية إزالة المياه البيضاء بالموجات فوق الصوتية (الفاكو) وزراعة عدسة مطوية',
    labelAr: 'إزالة المياه البيضاء (الفاكو) + عدسة مطوية',
    labelEn: 'Phacoemulsification + Foldable IOL',
    en: 'Phacoemulsification with Foldable Monofocal IOL Implantation',
  },
  {
    ar: 'استئصال جسم زجاجي وإصلاح انفصال شبكية مع حقن غاز / زيت سيليكون',
    labelAr: 'استئصال الجسم الزجاجي وإصلاح انفصال الشبكية (Vitrectomy)',
    labelEn: 'Pars Plana Vitrectomy & Retinal Repair',
    en: 'Pars Plana Vitrectomy & Retinal Repair',
  },
  {
    ar: 'تصحيح قصر النظر والاستجماتيزم بالفيمتو ليزك المخصص Custom-Q',
    labelAr: 'تصحيح الإبصار بالفيمتو ليزك (Femto-LASIK)',
    labelEn: 'Wavefront Femto-LASIK',
    en: 'Wavefront Femto-LASIK',
  },
  {
    ar: 'تثبيت القرنية المخروطية بالأشعة فوق البنفسجية والريبوفلافين (Cross-Linking)',
    labelAr: 'تثبيت القرنية المخروطية (Corneal Cross-Linking)',
    labelEn: 'Corneal Cross-Linking (CXL)',
    en: 'Corneal Cross-Linking (CXL)',
  },
  {
    ar: 'جراحة تصحيح الحول الدقيقة للأطفال',
    labelAr: 'جراحة تصحيح الحول للأطفال (Strabismus Surgery)',
    labelEn: 'Pediatric Strabismus Surgery',
    en: 'Pediatric Strabismus Surgery',
  },
  {
    ar: 'عملية تعديل ارتخاء الجفون وشد عضلات الجفن (Blepharoplasty)',
    labelAr: 'تجميل وشد الجفون (Blepharoplasty)',
    labelEn: 'Blepharoplasty & Oculoplastics',
    en: 'Blepharoplasty & Oculoplastics',
  },
];

interface ScheduleSurgeryModalProps {
  open: boolean;
  onClose: () => void;
  onScheduled: (surgery: ScheduledSurgery) => void;
}

const EMPTY_FORM = {
  patientNameAr: '',
  patientNameEn: '',
  patientPhone: '091-000-0000',
  patientAge: 45,
  gender: 'male',
  procedureAr: 'عملية إزالة المياه البيضاء بالموجات فوق الصوتية (الفاكو) وزراعة عدسة مطوية',
  procedureEn: 'Phacoemulsification with Foldable Monofocal IOL Implantation',
  specialtyId: 'cataract',
  surgeonAr: 'أ.د. محمود الحسيني',
  surgeonEn: 'Prof. Dr. Mahmoud Al-Husseini',
  roomCode: 'OR-101',
  time: '14:30',
  estimatedDurationMin: 35,
  priority: 'elective',
  anesthesiaTypeAr: 'تخدير موضعي قطرات (Topical)',
  anesthesiaTypeEn: 'Topical Anesthesia Drops'
};

export default function ScheduleSurgeryModal({ open, onClose, onScheduled }: ScheduleSurgeryModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const { submitting, error, submit } = useApiSubmit<ScheduledSurgery>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.patientNameAr && !form.patientNameEn) return;

    const payload = {
      patientNameAr: form.patientNameAr || undefined,
      patientNameEn: form.patientNameEn || undefined,
      patientPhone: form.patientPhone || '091-000-0000',
      patientAge: form.patientAge,
      gender: form.gender,
      procedureAr: form.procedureAr,
      procedureEn: form.procedureEn,
      specialtyId: form.specialtyId || 'cataract',
      surgeonAr: form.surgeonAr,
      surgeonEn: form.surgeonEn,
      roomCode: form.roomCode,
      time: form.time,
      estimatedDurationMin: form.estimatedDurationMin,
      priority: form.priority,
      anesthesiaTypeAr: form.anesthesiaTypeAr,
      anesthesiaTypeEn: form.anesthesiaTypeEn
    };

    const saved = await submit({
      url: '/api/staff/surgeries',
      payload,
      onSuccess: (created) => onScheduled(created),
    });

    if (!saved) return;

    onClose();
    setForm({ ...EMPTY_FORM });
  };

  return (
    <DashboardModalFrame
      isOpen={open}
      onClose={onClose}
      labelledById="schedule-surgery-title"
      titleAr="حجز وتنسيق موعد جراحة عيون عاجلة / مجدولة"
      titleEn="Schedule New Ophthalmic Surgery Case"
      subtitleAr="ربط المريض بالجراح، الجناح المعقم، ونوع التخدير المطلوب"
      subtitleEn="Connect patient to surgeon, theater suite, and anesthesia team"
      icon={Calendar}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('اسم المريض بالعربية *', 'Patient Name (Arabic) *')}</label>
            <input
              type="text"
              required
              value={form.patientNameAr}
              onChange={(e) => setForm({ ...form, patientNameAr: e.target.value })}
              placeholder="سليمان عبد القادر"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-bold text-ink-700 block mb-1">{t('العمر', 'Age')}</label>
              <input
                type="number"
                value={form.patientAge}
                onChange={(e) => setForm({ ...form, patientAge: Number(e.target.value) })}
                className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
              />
            </div>
            <div>
              <label className="font-bold text-ink-700 block mb-1">{t('الجنس', 'Gender')}</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value as ScheduledSurgery['gender'] })}
                className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
              >
                <option value="male">{t('ذكر', 'Male')}</option>
                <option value="female">{t('أنثى', 'Female')}</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="font-bold text-ink-700 block mb-1">{t('نوع الإجراء الجراحي *', 'Surgical Procedure *')}</label>
          <select
            value={form.procedureAr}
            onChange={(e) => {
              const chosen = PROCEDURE_OPTIONS.find((opt) => opt.ar === e.target.value);
              setForm({
                ...form,
                procedureAr: e.target.value,
                procedureEn: chosen?.en ?? form.procedureEn,
              });
            }}
            className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
          >
            {PROCEDURE_OPTIONS.map((opt) => (
              <option key={opt.ar} value={opt.ar}>
                {t(opt.labelAr, opt.labelEn)}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الجراح المسؤول *', 'Surgeon In Charge *')}</label>
            <select
              value={form.surgeonAr}
              onChange={(e) => setForm({ ...form, surgeonAr: e.target.value })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            >
              <option value="أ.د. محمود الحسيني">أ.د. محمود الحسيني (الشبكية قصر العيني)</option>
              <option value="أ.د. طارق قطامش">أ.د. طارق قطامش (القرنية والليزك قصر العيني)</option>
              <option value="أ.د. حسام زيادة">أ.د. حسام زيادة (عيون الأطفال والحول قصر العيني)</option>
              <option value="أ.د. طارق عبد الرازق">أ.د. طارق عبد الرازق (تجميل العيون عين شمس)</option>
              <option value="د. يوسف العقوري">د. يوسف العقوري (مقيم جراحة العيون)</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الجناح الجراحي المخصص', 'Surgical Theater')}</label>
            <select
              value={form.roomCode}
              onChange={(e) => setForm({ ...form, roomCode: e.target.value })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            >
              <option value="OR-101">OR-101 (جناح الشبكية - Lumera & Constellation)</option>
              <option value="OR-102">OR-102 (جناح الفاكو والعدسات - Centurion)</option>
              <option value="LASIK-OR-3">LASIK-OR-3 (جناح الفيمتوليزك - Schwind & VisuMax)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('وقت الدخول', 'Time Slot')}</label>
            <input
              type="time"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('المدة المتوقعة (دقيقة)', 'Est. Duration')}</label>
            <input
              type="number"
              value={form.estimatedDurationMin}
              onChange={(e) => setForm({ ...form, estimatedDurationMin: Number(e.target.value) })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('مستوى الأولوية', 'Priority Level')}</label>
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value as ScheduledSurgery['priority'] })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            >
              <option value="elective">{t('عادية مجدولة', 'Elective / Standard')}</option>
              <option value="high_priority">{t('أولوية متقدمة', 'High Priority')}</option>
              <option value="urgent">{t('عاجلة وطارئة', 'Urgent / Emergency')}</option>
            </select>
          </div>
        </div>

        <ModalFormFooter
          onClose={onClose}
          submitLabelAr="تثبيت وإدراج الحالة في الجدول"
          submitLabelEn="Schedule Surgery Case"
          submitIcon={CheckCircle2}
          submitTone="dark"
          submitting={submitting}
          error={error}
        />
      </form>
    </DashboardModalFrame>
  );
}
