'use client';

import React, { useState } from 'react';
import { Building2, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { HospitalRoom, RoomType } from '@/data/dashboardData';
import { useApiSubmit } from '@/hooks/useApiSubmit';
import DashboardModalFrame from '@/components/ui/DashboardModalFrame';
import ModalFormFooter from '@/components/ui/ModalFormFooter';

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
  const { submitting, error, submit } = useApiSubmit<HospitalRoom>();

  const handleSubmit = async (e: React.FormEvent) => {
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

    const saved = await submit({
      url: '/api/staff/rooms',
      payload,
      onSuccess: (created) => onCreated(created),
    });

    if (!saved) return;

    onClose();
    setForm({ ...EMPTY_FORM });
  };

  return (
    <DashboardModalFrame
      isOpen={open}
      onClose={onClose}
      labelledById="add-room-title"
      titleAr="إضافة غرفة عمليات / جناح سريري جديد"
      titleEn="Register New Surgical Suite / Clinic Room"
      subtitleAr="تعريف الجناح الجراحي أو العيادة وتحديد الأجهزة المجهزة ونظام التعقيم"
      subtitleEn="Define suite specs, climate controls, and biomedical equipment"
      icon={Building2}
    >
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

        <ModalFormFooter
          onClose={onClose}
          submitLabelAr="تسجيل وتدشين الجناح"
          submitLabelEn="Register Room"
          submitIcon={Plus}
          submitTone="mid"
          submitting={submitting}
          error={error}
        />
      </form>
    </DashboardModalFrame>
  );
}
