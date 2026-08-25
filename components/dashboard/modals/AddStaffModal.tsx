'use client';

import React, { useState } from 'react';
import { Users, X, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { HospitalStaff } from '@/data/dashboardData';
import Modal from '@/components/ui/Modal';

interface AddStaffModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (member: HospitalStaff) => void;
}

const EMPTY_FORM = {
  nameAr: '',
  nameEn: '',
  roleAr: '',
  roleEn: '',
  category: 'resident',
  departmentAr: 'قسم العيادات الخارجية وطب العيون العام',
  departmentEn: 'Outpatient Ophthalmology Clinic',
  roomAssignedAr: 'عيادة 105',
  roomAssignedEn: 'Clinic 105',
  shift: '08:00 - 16:00',
  phone: '+218 91 000 0000',
  email: ''
};

export default function AddStaffModal({ open, onClose, onCreated }: AddStaffModalProps) {
  const { t } = useLanguage();
  const [form, setForm] = useState({ ...EMPTY_FORM });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nameAr && !form.nameEn) return;

    const payload = {
      nameAr: form.nameAr || form.nameEn,
      nameEn: form.nameEn || form.nameAr,
      roleAr: form.roleAr || 'طبيب عيون ممارس',
      roleEn: form.roleEn || 'Ophthalmology Practitioner',
      category: form.category,
      departmentAr: form.departmentAr,
      departmentEn: form.departmentEn,
      status: 'on_duty',
      roomAssignedAr: form.roomAssignedAr,
      roomAssignedEn: form.roomAssignedEn,
      shift: form.shift,
      phone: form.phone,
      email: form.email || 'staff@konooz-hospital.ly'
    };

    fetch('/api/staff/staff-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) onCreated(json.data as HospitalStaff);
      })
      .catch(() => {});

    onClose();
    setForm({ ...EMPTY_FORM });
  };

  return (
    <Modal isOpen={open} onClose={onClose} labelledById="add-staff-title" panelClassName="max-w-xl w-full p-6">
      <button
        onClick={onClose}
        className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="mb-5">
        <h3 id="add-staff-title" className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-pine-700" />
          <span>{t('إضافة عضو كادر طبي / فني جديد', 'Register New Medical Staff Member')}</span>
        </h3>
        <p className="text-xs text-ink-500 mt-0.5">
          {t('تعيين الطبيب أو الممرض أو الأخصائي وتخصيص المناوبة والموقع', 'Assign role, shift timings, and active clinic/theater')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الاسم بالعربية *', 'Full Name (Arabic) *')}</label>
            <input
              type="text"
              required
              value={form.nameAr}
              onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
              placeholder="د. محمد الساعدي"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الاسم بالإنجليزية', 'Full Name (English)')}</label>
            <input
              type="text"
              value={form.nameEn}
              onChange={(e) => setForm({ ...form, nameEn: e.target.value })}
              placeholder="Dr. Mohammed Al-Saadi"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('المسمى الوظيفي والتخصص *', 'Specialty Title *')}</label>
            <input
              type="text"
              required
              value={form.roleAr}
              onChange={(e) => setForm({ ...form, roleAr: e.target.value })}
              placeholder="أخصائي جراحة عيون ومياه بيضاء"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الفئة الوظيفية', 'Staff Category')}</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            >
              <option value="surgeon">{t('جراح استشاري', 'Surgeon / Consultant')}</option>
              <option value="consultant">{t('استشاري زائر', 'Visiting Professor')}</option>
              <option value="resident">{t('طبيب مقيم', 'Resident Doctor')}</option>
              <option value="nurse">{t('تمريض عمليات ورعاية', 'Surgical Nurse')}</option>
              <option value="technician">{t('أخصائي بصريات وأجهزة', 'Optometrist / Tech')}</option>
              <option value="admin">{t('إدارة واستقبال', 'Admin / Reception')}</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('الموقع المخصص / الغرفة', 'Assigned Room')}</label>
            <input
              type="text"
              value={form.roomAssignedAr}
              onChange={(e) => setForm({ ...form, roomAssignedAr: e.target.value })}
              placeholder="عيادة 105"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('مواعيد المناوبة', 'Shift Timings')}</label>
            <input
              type="text"
              value={form.shift}
              onChange={(e) => setForm({ ...form, shift: e.target.value })}
              placeholder="08:00 - 16:00"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('رقم الهاتف للتواصل المباشر', 'Direct Phone')}</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="+218 91 000 0000"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
            />
          </div>
          <div>
            <label className="font-bold text-ink-700 block mb-1">{t('البريد الإلكتروني المؤسسي', 'Hospital Email')}</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="doctor@konooz-hospital.ly"
              className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
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
            className="px-5 py-2.5 bg-pine-900 hover:bg-pine-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-brass-400" />
            <span>{t('تأكيد وحفظ الكادر', 'Confirm & Add Staff')}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
}
