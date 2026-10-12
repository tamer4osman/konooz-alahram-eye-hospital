'use client';

import React, { useState } from 'react';
import { Cpu, Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { HospitalEquipment, HospitalRoom } from '@/data/dashboardData';
import { useApiSubmit } from '@/hooks/useApiSubmit';
import DashboardModalFrame from '@/components/ui/DashboardModalFrame';
import ModalFormFooter from '@/components/ui/ModalFormFooter';

interface AddEquipmentModalProps {
  open: boolean;
  rooms: HospitalRoom[];
  onClose: () => void;
  onCreated: (equipment: HospitalEquipment) => void;
}

const EMPTY_FORM = {
  nameAr: 'جهاز تصوير مقطعي عالي الدقة للقرنية والشبكية',
  nameEn: 'Ultra-High-Resolution HD Corneal & Retinal Diagnostic System',
  brand: 'Carl Zeiss Meditec (Germany)',
  model: 'CIRRUS HD-OCT 6000 Premium',
  serialNumber: '',
  roomCode: 'DIAG-OCT-1',
  departmentAr: 'مركز التشخيص والأشعة العينية',
  departmentEn: 'Diagnostic & Retinal Imaging Unit',
  technicianInChargeAr: 'م. سالم المجبري',
  nextServiceDue: '2026-12-01',
  notesAr: 'جهاز جديد تم تدشينه وفحصه عند الاستلام'
};

export default function AddEquipmentModal({ open, rooms, onClose, onCreated }: AddEquipmentModalProps) {
  const { lang, t } = useLanguage();
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const { submitting, error, submit } = useApiSubmit<HospitalEquipment>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameAr && !form.nameEn) return;

    const payload = {
      nameAr: form.nameAr || undefined,
      nameEn: form.nameEn || undefined,
      brand: form.brand || 'Carl Zeiss (Germany)',
      model: form.model || 'Advanced Medical Suite',
      serialNumber: form.serialNumber || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
      departmentAr: form.departmentAr,
      departmentEn: form.departmentEn,
      roomCode: form.roomCode,
      nextServiceDue: form.nextServiceDue || '2026-12-01',
      notesAr: form.notesAr,
      notesEn: undefined
    };

    const saved = await submit({
      url: '/api/staff/equipment',
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
      labelledById="add-equipment-title"
      titleAr="إضافة جهاز طبي ونظام ليزر جديد"
      titleEn="Add Biomedical Equipment / Laser"
      subtitleAr="تسجيل بيانات الجهاز الطبي، الرقم التسلسلي، موقع التشغيل، وتعيين مهندس الصيانة"
      subtitleEn="Register serial number, operating suite, calibration interval, and lead bio-engineer"
      icon={Cpu}
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('اسم الجهاز بالعربية *', 'Device Name (Arabic) *')}</label>
            <input
              type="text"
              required
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              placeholder="جهاز ليزر الفيمتو ثانية المتطور"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('اسم الجهاز بالإنجليزية', 'Device Name (English)')}</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              placeholder="Femtosecond Laser Surgical System"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الشركة المصنعة *', 'Manufacturer Brand *')}</label>
            <input
              type="text"
              required
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              placeholder="Carl Zeiss Meditec"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الموديل / الطراز *', 'Model *')}</label>
            <input
              type="text"
              required
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              placeholder="VisuMax 800"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الرقم التسلسلي (SN) *', 'Serial Number *')}</label>
            <input
              type="text"
              required
              value={form.serialNumber}
              onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              placeholder="CZ-VM-800-4491"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-mono font-bold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الغرفة أو الجناح المخصص له *', 'Assigned Room *')}</label>
            <select
              value={form.roomCode}
              onChange={(e) => setForm({ ...form, roomCode: e.target.value })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-bold"
            >
              {rooms.map((room) => (
                <option key={room.id} value={room.code}>
                  {room.code} - {lang === 'ar' ? room.nameAr : room.nameEn}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('المهندس الحيوي المسؤول', 'Lead Bio-Engineer')}</label>
            <input
              type="text"
              value={form.technicianInChargeAr}
              onChange={(e) => setForm({ ...form, technicianInChargeAr: e.target.value })}
              placeholder="م. سالم المجبري"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-ink-700 block mb-1">{t('ملاحظات التشغيل والمعايرة الأولية', 'Initial Calibration Notes')}</label>
          <textarea
            rows={2}
            value={form.notesAr}
            onChange={(e) => setForm({ ...form, notesAr: e.target.value })}
            placeholder="تم فحص ومطابقة الليزر واختبار الأمان البصري بنجاح..."
            className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
          />
        </div>

        <ModalFormFooter
          onClose={onClose}
          submitLabelAr="إضافة الجهاز للأسطول"
          submitLabelEn="Register Equipment"
          submitIcon={Plus}
          submitTone="mid"
          submitting={submitting}
          error={error}
        />
      </form>
    </DashboardModalFrame>
  );
}
