'use client';

import React, { useState } from 'react';
import { Calendar, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { ScheduledSurgery } from '@/data/dashboardData';
import Modal from '@/components/ui/Modal';

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

  const handleSubmit = (e: React.FormEvent) => {
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

    fetch('/api/staff/surgeries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) onScheduled(json.data as ScheduledSurgery);
      })
      .catch(() => {});

    onClose();
    setForm({ ...EMPTY_FORM });
  };

  return (
    <Modal isOpen={open} onClose={onClose} labelledById="schedule-surgery-title" panelClassName="max-w-xl w-full p-6">
      <button
        onClick={onClose}
        className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="mb-5">
        <h3 id="schedule-surgery-title" className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-pine-700" />
          <span>{t('حجز وتنسيق موعد جراحة عيون عاجلة / مجدولة', 'Schedule New Ophthalmic Surgery Case')}</span>
        </h3>
        <p className="text-xs text-ink-500 mt-0.5">
          {t('ربط المريض بالجراح، الجناح المعقم، ونوع التخدير المطلوب', 'Connect patient to surgeon, theater suite, and anesthesia team')}
        </p>
      </div>

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
                onChange={(e) => setForm({ ...form, gender: e.target.value as any })}
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
            onChange={(e) => setForm({ ...form, procedureAr: e.target.value })}
            className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
          >
            <option value="عملية إزالة المياه البيضاء بالموجات فوق الصوتية (الفاكو) وزراعة عدسة مطوية">
              {t('إزالة المياه البيضاء (الفاكو) + عدسة مطوية', 'Phacoemulsification + Foldable IOL')}
            </option>
            <option value="استئصال جسم زجاجي وإصلاح انفصال شبكية مع حقن غاز / زيت سيليكون">
              {t('استئصال الجسم الزجاجي وإصلاح انفصال الشبكية (Vitrectomy)', 'Pars Plana Vitrectomy & Retinal Repair')}
            </option>
            <option value="تصحيح قصر النظر والاستجماتيزم بالفيمتو ليزك المخصص Custom-Q">
              {t('تصحيح الإبصار بالفيمتو ليزك (Femto-LASIK)', 'Wavefront Femto-LASIK')}
            </option>
            <option value="تثبيت القرنية المخروطية بالأشعة فوق البنفسجية والريبوفلافين (Cross-Linking)">
              {t('تثبيت القرنية المخروطية (Corneal Cross-Linking)', 'Corneal Cross-Linking (CXL)')}
            </option>
            <option value="جراحة تصحيح الحول الدقيقة للأطفال">
              {t('جراحة تصحيح الحول للأطفال (Strabismus Surgery)', 'Pediatric Strabismus Surgery')}
            </option>
            <option value="عملية تعديل ارتخاء الجفون وشد عضلات الجفن (Blepharoplasty)">
              {t('تجميل وشد الجفون (Blepharoplasty)', 'Blepharoplasty & Oculoplastics')}
            </option>
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
              onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            >
              <option value="elective">{t('عادية مجدولة', 'Elective / Standard')}</option>
              <option value="high_priority">{t('أولوية متقدمة', 'High Priority')}</option>
              <option value="urgent">{t('عاجلة وطارئة', 'Urgent / Emergency')}</option>
            </select>
          </div>
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
            className="px-5 py-2.5 bg-pine-900 hover:bg-pine-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-brass-400" />
            <span>{t('تثبيت وإدراج الحالة في الجدول', 'Schedule Surgery Case')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
