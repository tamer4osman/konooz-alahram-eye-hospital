'use client';

import React, { useState } from 'react';
import { Users, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { HospitalStaff } from '@/data/dashboardData';
import { useApiSubmit } from '@/hooks/useApiSubmit';
import DashboardModalFrame from '@/components/ui/DashboardModalFrame';
import ModalFormFooter from '@/components/ui/ModalFormFooter';

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
  const { submitting, error, submit } = useApiSubmit<HospitalStaff>();

  const handleSubmit = async (e: React.FormEvent) => {
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

    const saved = await submit({
      url: '/api/staff/staff-members',
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
      labelledById="add-staff-title"
      titleAr="إضافة عضو كادر طبي / فني جديد"
      titleEn="Register New Medical Staff Member"
      subtitleAr="تعيين الطبيب أو الممرض أو الأخصائي وتخصيص المناوبة والموقع"
      subtitleEn="Assign role, shift timings, and active clinic/theater"
      icon={Users}
    >
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

        <ModalFormFooter
          onClose={onClose}
          submitLabelAr="تأكيد وحفظ الكادر"
          submitLabelEn="Confirm & Add Staff"
          submitIcon={CheckCircle2}
          submitTone="dark"
          submitting={submitting}
          error={error}
        />
      </form>
    </DashboardModalFrame>
  );
}
