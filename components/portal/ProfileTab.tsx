'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { Bell, Mail, Phone, ShieldCheck, AlertCircle, Smartphone, Eye, Printer, FileText } from 'lucide-react';

interface ProfileTabProps {
  notify: (message: string, timeoutMs?: number) => void;
}

export default function ProfileTab({ notify }: ProfileTabProps) {
  const { lang, t } = useLanguage();
  const { currentPatient, updateProfile } = usePatientAuth();

  // Local form state for editing profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullNameAr: '', phone: '', email: '', cityAr: '', insuranceProviderName: '', insurancePolicyNo: '', emergencyContactName: '', emergencyContactPhone: '', allergies: '' });

  if (!currentPatient) return null;

  const startEdit = () => {
    setEditForm({
      fullNameAr: currentPatient.fullNameAr, phone: currentPatient.phone, email: currentPatient.email, cityAr: currentPatient.cityAr, insuranceProviderName: currentPatient.insuranceProviderName, insurancePolicyNo: currentPatient.insurancePolicyNo, emergencyContactName: currentPatient.emergencyContact.name, emergencyContactPhone: currentPatient.emergencyContact.phone, allergies: currentPatient.allergiesAr.join(', ')
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      alert(t('البريد الإلكتروني إلزامي لتأمين حسابك واستلام التقارير الطبية.', 'Email address is mandatory to secure your account and receive medical reports.'));
      return; }

    updateProfile({
      fullNameAr: editForm.fullNameAr, fullNameEn: editForm.fullNameAr, phone: editForm.phone, whatsappNumber: editForm.phone, email: editForm.email.trim(), cityAr: editForm.cityAr, insuranceProviderName: editForm.insuranceProviderName, insurancePolicyNo: editForm.insurancePolicyNo, emergencyContact: {
        ...currentPatient.emergencyContact, name: editForm.emergencyContactName, phone: editForm.emergencyContactPhone
      }, allergiesAr: editForm.allergies ? editForm.allergies.split(', ').map((s) => s.trim()) : []
    });
    setIsEditingProfile(false);
    notify(t('تم تحديث بيانات الملف الطبي بنجاح.', 'Medical profile records updated successfully.'), 3500);
  };

  return (
    <div className="space-y-6">

      {/* Profile Card & Quick Actions */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-pine-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pine-500 to-ink-700 text-white flex items-center justify-center text-xl font-extrabold shadow-md">
            {currentPatient.fullNameAr.slice(0, 2)}
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-ink-900">
              {lang === 'ar' ? currentPatient.fullNameAr : currentPatient.fullNameEn}
            </h3>
            <p className="text-xs text-ink-500 flex items-center gap-2 mt-0.5 flex-wrap">
                {currentPatient.nationalId && (
                  <>
                    <span>{t('الرقم الوطني:', 'National ID:')} <strong className="font-mono text-ink-700">{currentPatient.nationalId}</strong></span>
                    <span>•</span>
                  </>
                )}
                {currentPatient.bloodGroup && (
                  <>
                    <span>{t('فصيلة الدم:', 'Blood:')} <strong className="text-rose-600">{currentPatient.bloodGroup}</strong></span>
                    <span>•</span>
                  </>
                )}
                <span>{currentPatient.gender === 'female' ? t('أنثى', 'Female') : t('ذكر', 'Male')}</span>
              </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pine-50 text-pine-800 border border-pine-200">
                {currentPatient.cityAr}
              </span>
              {currentPatient.insuranceProviderName && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brass-50 text-brass-600 ring-1 ring-brass-300 border-amber-200">
                  {currentPatient.insuranceProviderName}
                </span>
              )}
              {!currentPatient.insuranceProviderName && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-bone-50 text-ink-500 border border-pine-200">
                  {t('بدون تأمين مسجل', 'No insurance on file')}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={startEdit}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-ink-700 bg-bone-100 hover:bg-pine-200 border border-pine-200 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-ink-500" />
            <span>{t('تعديل البيانات', 'Edit Profile')}</span>
          </button>

          <button
            onClick={() => {
              if (typeof window !== 'undefined') window.print();
            }}
            className="px-3.5 py-2 rounded-xl text-xs font-bold text-pine-800 bg-pine-50 hover:bg-pine-100 border border-pine-200 transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5 text-pine-700" />
            <span>{t('طباعة بطاقة المريض', 'Print Health Card')}</span>
          </button>
        </div>
      </div>

      {/* Edit Profile Form if opened */}
      {isEditingProfile && (
        <form onSubmit={handleSaveProfile} className="bg-pine-50/70 border border-pine-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-pine-200 pb-2">
            <h4 className="text-sm font-extrabold text-pine-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-pine-800" />
              <span>{t('تحديث البيانات الشخصية والطبية للمريض', 'Update Patient Personal & Medical Records')}</span>
            </h4>
            <button type="button" onClick={() => setIsEditingProfile(false)} className="text-pine-800 hover:text-pine-950 text-xs font-bold">
              {t('إلغاء', 'Cancel')}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-ink-700 font-bold mb-1">{t('الاسم بالكامل:', 'Full Name:')}</label>
              <input
                type="text"
                required
                value={editForm.fullNameAr}
                onChange={(e) => setEditForm({ ...editForm, fullNameAr: e.target.value })}
                className="w-full p-2.5 bg-white border border-pine-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-bold mb-1">{t('رقم الهاتف / الواتساب:', 'Phone / WhatsApp:')}</label>
              <input
                type="text"
                required
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full p-2.5 bg-white border border-pine-200 rounded-xl font-bold"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-bold mb-1">{t('البريد الإلكتروني:', 'Email Address:')}</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-bold mb-1">{t('المدينة / الحي في ليبيا:', 'Libyan City / District:')}</label>
              <input
                type="text"
                value={editForm.cityAr}
                onChange={(e) => setEditForm({ ...editForm, cityAr: e.target.value })}
                className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-bold mb-1">{t('جهة التأمين الطبي:', 'Insurance Company:')}</label>
              <input
                type="text"
                value={editForm.insuranceProviderName}
                onChange={(e) => setEditForm({ ...editForm, insuranceProviderName: e.target.value })}
                className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-bold mb-1">{t('رقم بطاقة التأمين:', 'Insurance Policy No:')}</label>
              <input
                type="text"
                value={editForm.insurancePolicyNo}
                onChange={(e) => setEditForm({ ...editForm, insurancePolicyNo: e.target.value })}
                className="w-full p-2.5 bg-white border border-pine-200 rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-bold mb-1">{t('جهة الاتصال في الطوارئ (الاسم):', 'Emergency Contact Name:')}</label>
              <input
                type="text"
                value={editForm.emergencyContactName}
                onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-bold mb-1">{t('هاتف الطوارئ:', 'Emergency Phone:')}</label>
              <input
                type="text"
                value={editForm.emergencyContactPhone}
                onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-ink-700 font-bold mb-1">{t('الحساسيات الدوائية (افصل بفاصلة):', 'Drug Allergies:')}</label>
              <input
                type="text"
                value={editForm.allergies}
                onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs shadow-sm cursor-pointer"
            >
              {t('حفظ التعديلات في ملفي', 'Save Profile Updates')}
            </button>
          </div>
        </form>
      )}

      {/* Grid of Medical Profile Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Refractive & Vision Parameters */}
        <div className="bg-white rounded-2xl p-4 border border-pine-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-bone-100 pb-2">
            <div className="flex items-center gap-2 text-pine-800 font-extrabold text-xs">
              <Eye className="w-4 h-4 text-pine-700" />
              <span>{t('قياسات النظر والانكسار الأخيرة', 'Refractive Vision Baseline')}</span>
            </div>
            {currentPatient.refractiveData.lastChecked && (
              <span className="text-[10px] text-ink-500 font-mono">{currentPatient.refractiveData.lastChecked}</span>
            )}
          </div>

          {currentPatient.refractiveData.lastChecked ? (
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 bg-bone-50 rounded-xl border border-bone-100">
                <span className="block font-bold text-ink-700 mb-1">{t('العين اليمنى (OD)', 'Right Eye (OD)')}</span>
                <div className="font-mono text-pine-800 font-bold text-sm">
                  {currentPatient.refractiveData.odSphere} Sph
                </div>
                <div className="font-mono text-[11px] text-ink-500">
                  {currentPatient.refractiveData.odCyl} Cyl @ {currentPatient.refractiveData.odAxis}
                </div>
              </div>

              <div className="p-2.5 bg-bone-50 rounded-xl border border-bone-100">
                <span className="block font-bold text-ink-700 mb-1">{t('العين اليسرى (OS)', 'Left Eye (OS)')}</span>
                <div className="font-mono text-pine-800 font-bold text-sm">
                  {currentPatient.refractiveData.osSphere} Sph
                </div>
                <div className="font-mono text-[11px] text-ink-500">
                  {currentPatient.refractiveData.osCyl} Cyl @ {currentPatient.refractiveData.osAxis}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-ink-400 italic py-3 text-center">
              {t('لا توجد قياسات نظر مسجلة بعد — تُضاف تلقائياً بعد أول كشف شامل.', 'No vision measurements yet — added automatically after your first comprehensive exam.')}
            </p>
          )}
        </div>

        {/* Medical History & Allergies */}
        <div className="bg-white rounded-2xl p-4 border border-pine-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs border-b border-bone-100 pb-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{t('الحساسيات والأمراض المزمنة', 'Allergies & Medical History')}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <span className="block text-[11px] font-bold text-ink-500 mb-1">{t('الحساسيات المسجلة:', 'Known Allergies:')}</span>
              {currentPatient.allergiesAr.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {currentPatient.allergiesAr.map((a, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                      {a}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-ink-400 italic text-[11px]">{t('لا توجد حساسيات دوائية', 'None')}</p>
              )}
            </div>

            <div className="pt-1">
              <span className="block text-[11px] font-bold text-ink-500 mb-1">{t('الحالات المرضية:', 'Chronic Conditions:')}</span>
              {currentPatient.chronicConditionsAr.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {currentPatient.chronicConditionsAr.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-lg bg-bone-100 text-ink-700 text-[11px] font-semibold">
                      {c}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-ink-400 italic text-[11px]">{t('سليم طبياً', 'Healthy')}</p>
              )}
            </div>
          </div>
        </div>

        {/* Emergency Contact & Insurance */}
        <div className="bg-white rounded-2xl p-4 border border-pine-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-pine-900 font-extrabold text-xs border-b border-bone-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-pine-800" />
            <span>{t('الطوارئ والتأمين الطبي', 'Emergency & Insurance')}</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 bg-bone-50 rounded-xl border border-bone-100 space-y-1">
              <span className="block text-[10px] text-ink-500 font-bold uppercase">{t('جهة الاتصال في الطوارئ', 'Emergency Contact')}</span>
              <p className="font-bold text-ink-700">{currentPatient.emergencyContact.name}</p>
              <a href={`tel:${currentPatient.emergencyContact.phone}`} className="text-pine-800 font-mono text-[11px] hover:underline flex items-center gap-1">
                <Phone className="w-3 h-3" />
                <span>{currentPatient.emergencyContact.phone}</span>
              </a>
            </div>

            <div className="p-2.5 bg-bone-50 rounded-xl border border-bone-100 space-y-1">
              <span className="block text-[10px] text-ink-500 font-bold uppercase">{t('وثيقة التأمين', 'Insurance Card')}</span>
              <p className="font-bold text-ink-700 text-[11px]">{currentPatient.insuranceProviderName}</p>
              <p className="font-mono text-ink-500 text-[10px]">{currentPatient.insurancePolicyNo}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Data Storage Notice — honest server-backed model */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-pine-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-bone-100 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pine-50 text-pine-800 border border-pine-200 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-ink-900">
                {t('أين تُحفظ بياناتك؟', 'Where is your data stored?')}
              </h4>
              <p className="text-xs text-ink-500 mt-0.5 max-w-md">
                {t(
                  'ملفك الطبي محفوظ في خوادم المستشفى تحت حسابك الشخصي، ولا يُرسل أي شيء تلقائياً دون إرادتك.',
                  'Your medical profile is stored on the hospital servers under your personal account — nothing is sent automatically without your consent.'
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Honest Status Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-bone-50 rounded-xl border border-bone-100">
            <span className="block text-[10px] text-ink-500 font-bold uppercase mb-1">{t('التخزين الحالي', 'Current storage')}</span>
            <strong className="text-ink-900">{t('خوادم المستشفى — عبر أي جهاز', 'Hospital servers — from any device')}</strong>
          </div>

          <div className="p-3 bg-bone-50 rounded-xl border border-bone-100">
            <span className="block text-[10px] text-ink-500 font-bold uppercase mb-1">{t('الحسابات وكلمات المرور', 'Accounts & passwords')}</span>
            <strong className="text-pine-700">{t('مفعّل — محمي بكلمة مرور', 'Active — password protected')}</strong>
          </div>

          <div className="p-3 bg-bone-50 rounded-xl border border-bone-100">
            <span className="block text-[10px] text-ink-500 font-bold uppercase mb-1">{t('الخصوصية', 'Privacy')}</span>
            <strong className="text-ink-900">{t('لا إرسال تلقائي للبيانات', 'No automatic data sharing')}</strong>
            <p className="text-[11px] text-ink-500 mt-0.5">
              {t('التواصل مع المستشفى يتم بإرادتك عبر واتساب أو الهاتف.', 'Contacting the hospital happens by your choice via WhatsApp or phone.')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Jump to Notifications & Newsletter */}
      <div className="bg-gradient-to-r from-pine-50 via-pine-50 to-pine-50 rounded-2xl p-5 border border-pine-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-start">
          <h4 className="text-sm font-extrabold text-ink-900 flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>{t('تنبيهات الواتساب الفورية ونشرة العيون الطبية مفعّلة', 'Instant WhatsApp Alerts & Eye Digest Active')}</span>
          </h4>
          <p className="text-xs text-ink-500">
            {t(
              `يتم إرسال تذكيرات المواعيد والقطرات مباشرة إلى هاتفك (${currentPatient.whatsappNumber}) والبريد (${currentPatient.email}).`,
              `Appointment and eye drop reminders are delivered directly to your phone (${currentPatient.whatsappNumber}) and email (${currentPatient.email}).`
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#portal-tab-notifications"
            onClick={(e) => {
              e.preventDefault();
              const tabButton = document.querySelector<HTMLButtonElement>('[data-portal-tab="notifications"]');
              tabButton?.click();
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>{t('إدارة التنبيهات', 'Manage Alerts')}</span>
          </a>
          <a
            href="#portal-tab-newsletter"
            onClick={(e) => {
              e.preventDefault();
              const tabButton = document.querySelector<HTMLButtonElement>('[data-portal-tab="newsletter"]');
              tabButton?.click();
            }}
            className="px-4 py-2 bg-pine-800 hover:bg-pine-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{t('النشرة الطبية', 'Newsletter')}</span>
          </a>
        </div>
      </div>

    </div>
  );
}
