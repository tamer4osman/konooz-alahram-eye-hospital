'use client';

import React, { useState } from 'react';
import { Building2, X, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { HospitalRoom, RoomType } from '@/data/dashboardData';
import Modal from '@/components/ui/Modal';

interface AddRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (room: HospitalRoom) => void;
}

const EMPTY_FORM = {
  code: 'OR-103',
  nameAr: 'جناح العمليات 3 (جراحات الشبكية والفاكو المتقدمة)',
  nameEn: 'Operating Theater 3 (Advanced VR & Phaco Suite)',
  type: 'operating_theater',
  floorAr: 'الطابق الثاني - المجمع الجراحي المعقم',
  floorEn: '2nd Floor - Sterile Surgical Complex',
  tempCelsius: 19.5,
  humidityPercent: 45,
  mainDeviceAssignedAr: 'Carl Zeiss OPMI Lumera 700 + Alcon Centurion',
  mainDeviceAssignedEn: 'Carl Zeiss OPMI Lumera 700 + Alcon Centurion'
};

export default function AddRoomModal({ open, onClose, onCreated }: AddRoomModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameAr && !form.nameEn) return;

    const payload = {
      code: form.code || `OR-${Math.floor(100 + Math.random() * 900)}`,
      nameAr: form.nameAr || undefined,
      nameEn: form.nameEn || undefined,
      type: form.type as HospitalRoom['type'],
      floorAr: form.floorAr,
      floorEn: form.floorEn,
      tempCelsius: form.tempCelsius || 20,
      humidityPercent: form.humidityPercent || 45,
      capacity: 1,
      mainDeviceAssignedAr: form.mainDeviceAssignedAr || 'طاقم جراحي متكامل',
      mainDeviceAssignedEn: form.mainDeviceAssignedEn || 'Complete Surgical Setup'
    };

    fetch('/api/staff/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) onCreated(json.data as HospitalRoom);
      })
      .catch(() => {});

    onClose();
    setForm({ ...EMPTY_FORM });
  };

  return (
    <Modal isOpen={open} onClose={onClose} labelledById="add-room-title" panelClassName="max-w-xl w-full p-6">
      <button
        onClick={onClose}
        className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors cursor-pointer"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="mb-5">
        <h3 id="add-room-title" className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-pine-700" />
          <span>{t('إضافة غرفة عمليات / جناح سريري جديد', 'Register New Surgical Suite / Clinic Room')}</span>
        </h3>
        <p className="text-xs text-ink-500 mt-0.5">
          {t('تعريف الجناح الجراحي أو العيادة وتحديد الأجهزة المجهزة ونظام التعقيم', 'Define suite specs, climate controls, and biomedical equipment')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('رمز الجناح / الغرفة *', 'Room Code *')}</label>
            <input
              type="text"
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="OR-104"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold uppercase font-mono"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('نوع الجناح / القسم *', 'Room Category *')}</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as RoomType })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-bold"
            >
              <option value="operating_theater">{t('جناح عمليات جراحية رئيسي', 'Major Operating Theater')}</option>
              <option value="laser_room">{t('جناح عمليات الليزك وتصحيح الإبصار', 'Refractive LASIK Suite')}</option>
              <option value="outpatient_clinic">{t('عيادة فحص واستشارة عيون', 'Outpatient Eye Clinic')}</option>
              <option value="diagnostic_suite">{t('مختبر الفحوصات والأشعة التشخيصية', 'Diagnostic Imaging Suite')}</option>
              <option value="recovery_ward">{t('وحدة الإفاقة ورعاية ما بعد الجراحة', 'PACU Recovery Ward')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('اسم الجناح بالعربية *', 'Room Name (Arabic) *')}</label>
            <input
              type="text"
              required
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              placeholder="جناح العمليات 4 (جراحات الليزر والفاكو)"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('اسم الجناح بالإنجليزية', 'Room Name (English)')}</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              placeholder="Operating Theater 4 (Laser & Phaco Suite)"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الموقع / الطابق بالعربية', 'Floor Location (Arabic)')}</label>
            <input
              type="text"
              value={form.floorAr}
              onChange={(e) => setForm({ ...form, floorAr: e.target.value })}
              placeholder="الطابق الثاني - المجمع الجراحي"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الجهاز الرئيسي المجهز بالجناح', 'Primary Biomedical Device')}</label>
            <input
              type="text"
              value={form.mainDeviceAssignedAr}
              onChange={(e) => setForm({ ...form, mainDeviceAssignedAr: e.target.value })}
              placeholder="Zeiss Lumera 700 + Alcon Centurion"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('درجة الحرارة المعيارية (°C)', 'Target Temp (°C)')}</label>
            <input
              type="number"
              step="0.5"
              value={form.tempCelsius}
              onChange={(e) => setForm({ ...form, tempCelsius: Number(e.target.value) })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-mono font-bold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('نسبة الرطوبة المثالية (%)', 'Target Humidity (%)')}</label>
            <input
              type="number"
              value={form.humidityPercent}
              onChange={(e) => setForm({ ...form, humidityPercent: Number(e.target.value) })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-mono font-bold"
            />
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
            className="px-5 py-2.5 bg-pine-700 hover:bg-pine-800 text-white rounded-xl font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('تسجيل وتدشين الجناح', 'Register Room')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
