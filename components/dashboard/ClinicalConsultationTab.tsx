'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ClinicalConsultationRecord } from '@/data/dashboardData';
import { Stethoscope, Eye, FileText, Plus, Printer, AlertCircle, ShieldCheck, Search, Calendar, Activity, Zap } from 'lucide-react';

interface ClinicalConsultationTabProps {
  onReferToSurgery?: (patientName: string, procedure: string) => void;
}

export default function ClinicalConsultationTab(_: ClinicalConsultationTabProps) {
  const { lang, t, } = useLanguage();

  const [records, setRecords] = useState<ClinicalConsultationRecord[]>([]);
  const [selectedRecordId, setSelectedRecordId] = useState<string>('');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/staff/clinical-records')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) {
          const list = json.data as ClinicalConsultationRecord[];
          setRecords(list);
          if (list.length > 0) setSelectedRecordId(list[0].id);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewRecordModalOpen, setIsNewRecordModalOpen] = useState(false);
  const [isPrintSuccess, setIsPrintSuccess] = useState(false);

  // D5: portal-account picker — staff link the record to a real patient
  // account at entry time. Walk-ins stay unlinked (patientRefId absent).
  interface AccountHit {
    accountId: string;
    profileId: string;
    labelAr: string;
    labelEn: string;
    phone: string;
    email: string;
  }
  const [accountQuery, setAccountQuery] = useState('');
  const [accountResults, setAccountResults] = useState<AccountHit[]>([]);
  const [linkedAccount, setLinkedAccount] = useState<AccountHit | null>(null);
  const [accountSearching, setAccountSearching] = useState(false);

  useEffect(() => {
    if (!isNewRecordModalOpen) return;
    const q = accountQuery.trim();
    if (q.length < 2) {
      setAccountResults([]);
      return;
    }
    const timer = setTimeout(() => {
      setAccountSearching(true);
      fetch(`/api/staff/patient-accounts/search?q=${encodeURIComponent(q)}`)
        .then(async (res) => {
          if (!res.ok) return;
          const json = await res.json();
          if (Array.isArray(json?.data)) setAccountResults(json.data as AccountHit[]);
        })
        .catch(() => {})
        .finally(() => setAccountSearching(false));
    }, 300);
    return () => clearTimeout(timer);
  }, [accountQuery, isNewRecordModalOpen]);

  // New Consultation Form State
  const [newConsultation, setNewConsultation] = useState<Partial<ClinicalConsultationRecord>>({
    ticketNumber: 'KZ-8960', patientNameAr: '', patientNameEn: '', patientAge: 45, patientGender: 'male', patientPhone: '+218 91 000 0000', doctorAr: 'أ.د. محمود الحسيني', doctorEn: 'Prof. Dr. Mahmoud Al-Husseini', clinicRoom: 'عيادة 101', visitDate: '2026-08-18', visitTime: '11:00', status: 'in_progress', chiefComplaintAr: '', chiefComplaintEn: '', visualAcuityOD_Unaided: '6/18', visualAcuityOD_BCVA: '6/6', visualAcuityOS_Unaided: '6/12', visualAcuityOS_BCVA: '6/6', iopOD_mmHg: 16, iopOS_mmHg: 15, corneaAr: 'شفافة وسليمة', corneaEn: 'Clear and compact', anteriorChamberAr: 'عمق طبيعي وهادئ', anteriorChamberEn: 'Deep and quiet', lensStatusAr: 'شفافة بدون عتامات', lensStatusEn: 'Clear crystalline lens', fundusMaculaAr: 'قاع العين والعصب البصري والماقولا طبيعية', fundusMaculaEn: 'Normal optic disc and macula', icdCode: 'H52.1', diagnosisAr: 'قصر نظر بسيط', diagnosisEn: 'Simple Myopia', prescriptions: [
      {
        id: 'rx-new-1', drugNameAr: 'قطرة مرطبة خالية من المواد الحافظة (Hylo-Fresh)', drugNameEn: 'Hylo-Fresh Preservative Free Drops', category: 'lubricant', eye: 'OU', dosage: 'نقطة واحدة', frequency: '4 مرات يومياً', durationDays: 30, instructionsAr: 'لراحة العين وترطيب سطح القرنية', instructionsEn: 'Instill 1 drop 4 times daily'
      }
    ], nextFollowUpDate: '2026-09-18' });

  const activeRecord = records.find((r) => r.id === selectedRecordId) || records[0];

  const filteredRecords = records.filter(
    (r) =>
      r.patientNameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.icdCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrintNote = () => {
    setIsPrintSuccess(true);
    setTimeout(() => setIsPrintSuccess(false), 3000);
  };

  const handleCreateConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConsultation.patientNameAr) return;

    const payload = {
      ticketNumber: newConsultation.ticketNumber || 'KZ-9999',
      patientRefId: linkedAccount?.accountId || undefined,
      patientNameAr: newConsultation.patientNameAr || '',
      patientNameEn: newConsultation.patientNameEn || newConsultation.patientNameAr || '',
      patientAge: Number(newConsultation.patientAge) || 30,
      patientGender: newConsultation.patientGender || 'male',
      patientPhone: newConsultation.patientPhone || '+218 91 000 0000',
      doctorAr: newConsultation.doctorAr || 'أ.د. محمود الحسيني',
      doctorEn: newConsultation.doctorEn || 'Prof. Dr. Mahmoud Al-Husseini',
      clinicRoom: newConsultation.clinicRoom || 'عيادة 101',
      visitDate: newConsultation.visitDate || '2026-08-18',
      visitTime: newConsultation.visitTime || '11:00',
      status: newConsultation.status || 'completed',
      chiefComplaintAr: newConsultation.chiefComplaintAr || 'فحص عيون روتيني',
      chiefComplaintEn: newConsultation.chiefComplaintEn || 'Routine eye exam',
      visualAcuityOD_Unaided: newConsultation.visualAcuityOD_Unaided || '6/12',
      visualAcuityOD_BCVA: newConsultation.visualAcuityOD_BCVA || '6/6',
      visualAcuityOS_Unaided: newConsultation.visualAcuityOS_Unaided || '6/12',
      visualAcuityOS_BCVA: newConsultation.visualAcuityOS_BCVA || '6/6',
      iopOD_mmHg: Number(newConsultation.iopOD_mmHg) || 16,
      iopOS_mmHg: Number(newConsultation.iopOS_mmHg) || 15,
      corneaAr: newConsultation.corneaAr || 'سليمة',
      corneaEn: newConsultation.corneaEn || 'Normal',
      anteriorChamberAr: newConsultation.anteriorChamberAr || 'طبيعي',
      anteriorChamberEn: newConsultation.anteriorChamberEn || 'Deep & quiet',
      lensStatusAr: newConsultation.lensStatusAr || 'شفافة',
      lensStatusEn: newConsultation.lensStatusEn || 'Clear',
      fundusMaculaAr: newConsultation.fundusMaculaAr || 'طبيعي',
      fundusMaculaEn: newConsultation.fundusMaculaEn || 'Normal',
      icdCode: newConsultation.icdCode || 'H52.1',
      diagnosisAr: newConsultation.diagnosisAr || 'فحص سليم',
      diagnosisEn: newConsultation.diagnosisEn || 'Normal ocular exam',
      surgicalPlan: newConsultation.surgicalPlan || undefined,
      nextFollowUpDate: newConsultation.nextFollowUpDate || '2026-09-18',
      prescriptions: (newConsultation.prescriptions || []).map((rx) => ({
        drugNameAr: rx.drugNameAr,
        drugNameEn: rx.drugNameEn,
        category: rx.category,
        eye: rx.eye,
        dosage: rx.dosage,
        frequency: rx.frequency,
        durationDays: rx.durationDays,
        instructionsAr: rx.instructionsAr,
        instructionsEn: rx.instructionsEn,
        taperingSchedule: rx.taperingSchedule,
      })),
    };

    fetch('/api/staff/clinical-records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) {
          const created = json.data as ClinicalConsultationRecord;
          setRecords((prev) => [created, ...prev]);
          setSelectedRecordId(created.id);
        }
      })
      .catch(() => {});

    setIsNewRecordModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-pine-950  to-ink-900 rounded-2xl p-5 sm:p-6 text-white border border-pine-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pine-500/20 text-brass-300 border border-brass-400/30 flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>{t('نظام الكشف السريري والملف الإلكتروني (Bahmni / OpenMRS)', 'Clinical Consultation & Ophthalmic EMR Pad')}</span>
            </span>
            <span className="text-xs text-ink-400 font-mono">
              ICD-10 Coded • e-Prescription
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {t('سجل المعاينة الطبية، فحص قاع العين، والوصفات الإلكترونية', 'Ophthalmic Clinical Examination, Fundoscopy & e-Rx')}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewRecordModalOpen(true)}
            className="px-4 py-2.5 bg-pine-800 hover:bg-pine-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-pine-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('معاينة طبية جديدة', 'New Consultation Note')}</span>
          </button>
        </div>
      </div>

      {/* Main Split-View: Patient Queue List + Active Clinical Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Patient EMR Queue (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 border border-pine-200 shadow-sm flex flex-col h-[760px]">
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-pine-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-pine-700" />
                <span>{t('قائمة الكشوفات السريرية', 'Consultation Queue')}</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-bone-100 text-ink-700">
                {filteredRecords.length} {t('مرضى', 'patients')}
              </span>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute top-3 left-3 rtl:left-auto rtl:right-3 text-ink-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('بحث بالاسم، رقم التذكرة، أو التشخيص...', 'Search patient, ticket, or ICD...')}
                className="w-full text-xs pl-8 rtl:pl-3 rtl:pr-8 pr-3 py-2 bg-bone-50 border border-pine-200 rounded-xl focus:outline-none focus:border-pine-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredRecords.map((rec) => {
              const isSelected = rec.id === activeRecord?.id;
              const hasHighIop = rec.iopOD_mmHg > 21 || rec.iopOS_mmHg > 21;

              return (
                <button
                  type="button"
                  key={rec.id}
                  onClick={() => setSelectedRecordId(rec.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer text-start ${
                    isSelected
                      ? 'bg-pine-50/80 border-pine-500 shadow-xs'
                      : 'bg-bone-50/70 border-pine-200 hover:border-brass-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-[#0B3D33] text-white">
                      {rec.ticketNumber}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                        rec.status === 'referred_to_surgery'
                          ? 'bg-rose-100 text-rose-800'
                          : rec.status === 'completed'
                          ? 'bg-pine-100 text-pine-800'
                          : 'bg-brass-100 text-brass-600'
                      }`}
                    >
                      {rec.status === 'referred_to_surgery'
                        ? t('تحويل للجراحة', 'Surgery Referral')
                        : rec.status === 'completed'
                        ? t('مكتمل', 'Completed')
                        : t('قيد المعاينة', 'In Progress')}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-ink-900 truncate">
                    {lang === 'ar' ? rec.patientNameAr : rec.patientNameEn}
                  </h4>

                  <div className="flex items-center gap-2 text-[10px] text-ink-500 mt-1">
                    <span>{rec.patientAge} {t('سنة', 'yrs')}</span>
                    <span>•</span>
                    <span className="font-mono text-pine-800 font-bold">{rec.icdCode}</span>
                    <span>•</span>
                    <span className="truncate">{lang === 'ar' ? rec.diagnosisAr : rec.diagnosisEn}</span>
                  </div>

                  {hasHighIop && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] font-extrabold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      <AlertCircle className="w-3 h-3" />
                      <span>{t('ضغط العين مرتفع', 'Elevated IOP Warning')} ({rec.iopOD_mmHg}/{rec.iopOS_mmHg} mmHg)</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Full Ophthalmic Examination Sheet (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-5 sm:p-6 border border-pine-200 shadow-sm flex flex-col justify-between h-[760px] overflow-y-auto">
          {activeRecord ? (
            <div className="space-y-5">
              
              {/* Patient Header Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-pine-200 gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-pine-800 text-white">
                      {activeRecord.ticketNumber}
                    </span>
                    <h3 className="text-base font-extrabold text-pine-900">
                      {lang === 'ar' ? activeRecord.patientNameAr : activeRecord.patientNameEn}
                    </h3>
                    <span className="text-xs text-ink-500">
                      ({activeRecord.patientAge} {t('سنة', 'yrs')} • {activeRecord.patientGender === 'male' ? t('ذكر', 'Male') : t('أنثى', 'Female')})
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-ink-500 mt-1">
                    <span>{t('الطبيب المعاين:', 'Consultant:')} <strong className="text-ink-700">{lang === 'ar' ? activeRecord.doctorAr : activeRecord.doctorEn}</strong></span>
                    <span>•</span>
                    <span>{activeRecord.clinicRoom}</span>
                    <span>•</span>
                    <span>{activeRecord.visitDate} ({activeRecord.visitTime})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintNote}
                    className="px-3 py-1.5 bg-bone-100 hover:bg-pine-200 text-ink-700 text-xs font-bold rounded-xl border border-ink-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-pine-800" />
                    <span>{isPrintSuccess ? t('تم تجهيز الطباعة ✓', 'Printed ✓') : t('طباعة الروشتة والتقرير', 'Print Note & e-Rx')}</span>
                  </button>
                </div>
              </div>

              {/* Chief Complaint */}
              <div className="p-3 bg-brass-50/70 border border-brass-600 rounded-xl text-xs">
                <span className="font-bold text-brass-600 block mb-0.5 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-brass-600" />
                  <span>{t('الشكوى الرئيسية (Chief Complaint):', 'Chief Complaint:')}</span>
                </span>
                <p className="text-pine-900 font-medium">
                  {lang === 'ar' ? activeRecord.chiefComplaintAr : activeRecord.chiefComplaintEn}
                </p>
              </div>

              {/* 2-Eye Ophthalmic Matrix (OD: Right Eye / OS: Left Eye) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Right Eye (OD - Oculus Dexter) */}
                <div className="p-4 rounded-xl bg-bone-50 border border-pine-200 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-pine-200">
                    <span className="font-extrabold text-xs text-pine-900 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-pine-700" />
                      <span>{t('العين اليمنى (OD - Right Eye)', 'Right Eye (OD)')}</span>
                    </span>
                    <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-pine-100 text-pine-900">
                      IOP: {activeRecord.iopOD_mmHg} mmHg
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-white border border-bone-100">
                      <span className="text-[10px] text-ink-500 block">{t('النظر بدون نظارة', 'Unaided VA')}</span>
                      <span className="font-mono font-bold text-ink-700">{activeRecord.visualAcuityOD_Unaided}</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-bone-100">
                      <span className="text-[10px] text-ink-500 block">{t('أفضل تصحيح (BCVA)', 'Best Corrected')}</span>
                      <span className="font-mono font-bold text-pine-800">{activeRecord.visualAcuityOD_BCVA}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-ink-500">{t('القرنية (Cornea):', 'Cornea:')} </span>
                      <span className="text-ink-700">{lang === 'ar' ? activeRecord.corneaAr : activeRecord.corneaEn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink-500">{t('العدسة (Lens):', 'Lens:')} </span>
                      <span className="text-ink-700">{lang === 'ar' ? activeRecord.lensStatusAr : activeRecord.lensStatusEn}</span>
                    </div>
                  </div>
                </div>

                {/* Left Eye (OS - Oculus Sinister) */}
                <div className="p-4 rounded-xl bg-bone-50 border border-pine-200 space-y-2.5">
                  <div className="flex items-center justify-between pb-2 border-b border-pine-200">
                    <span className="font-extrabold text-xs text-pine-900 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-pine-800" />
                      <span>{t('العين اليسرى (OS - Left Eye)', 'Left Eye (OS)')}</span>
                    </span>
                    <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-pine-100 text-pine-900">
                      IOP: {activeRecord.iopOS_mmHg} mmHg
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-white border border-bone-100">
                      <span className="text-[10px] text-ink-500 block">{t('النظر بدون نظارة', 'Unaided VA')}</span>
                      <span className="font-mono font-bold text-ink-700">{activeRecord.visualAcuityOS_Unaided}</span>
                    </div>
                    <div className="p-2 rounded bg-white border border-bone-100">
                      <span className="text-[10px] text-ink-500 block">{t('أفضل تصحيح (BCVA)', 'Best Corrected')}</span>
                      <span className="font-mono font-bold text-pine-700">{activeRecord.visualAcuityOS_BCVA}</span>
                    </div>
                  </div>

                  <div className="text-xs space-y-1 pt-1">
                    <div>
                      <span className="text-[10px] font-bold text-ink-500">{t('الخزانة الأمامية (AC):', 'Ant. Chamber:')} </span>
                      <span className="text-ink-700">{lang === 'ar' ? activeRecord.anteriorChamberAr : activeRecord.anteriorChamberEn}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-ink-500">{t('الشبكية والماقولا (Fundus):', 'Fundus:')} </span>
                      <span className="text-ink-700">{lang === 'ar' ? activeRecord.fundusMaculaAr : activeRecord.fundusMaculaEn}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Diagnosis & Surgical Plan */}
              <div className="p-4 bg-pine-50/60 border border-pine-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-pine-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-pine-800" />
                    <span>{t('التشخيص المعتمد والترميز الدولي (ICD-10)', 'ICD-10 Coded Diagnosis')}</span>
                  </span>
                  <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-pine-800 text-white">
                    {activeRecord.icdCode}
                  </span>
                </div>
                <p className="text-sm font-bold text-pine-900">
                  {lang === 'ar' ? activeRecord.diagnosisAr : activeRecord.diagnosisEn}
                </p>
                {activeRecord.surgicalPlan && (
                  <div className="pt-2 border-t border-pine-200/80 text-xs">
                    <span className="font-bold text-pine-900">{t('الخطة الجراحية المقررة: ', 'Surgical Plan: ')}</span>
                    <span className="text-ink-700 font-semibold">{activeRecord.surgicalPlan}</span>
                  </div>
                )}
              </div>

              {/* e-Prescriptions & Drops Posology */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-pine-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-brass-600" />
                  <span>{t('الوصفة الطبية الإلكترونية وبروتوكول القطرات (e-Prescription)', 'e-Prescription & Drops Schedule')}</span>
                </h4>

                <div className="space-y-2">
                  {activeRecord.prescriptions.map((rx) => (
                    <div key={rx.id} className="p-3 rounded-xl bg-bone-50 border border-pine-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-brass-100 text-brass-600 uppercase">
                            {rx.eye} ({rx.eye === 'OD' ? t('اليمنى', 'OD') : rx.eye === 'OS' ? t('اليسرى', 'OS') : t('كلتا العينين', 'Both')})
                          </span>
                          <span className="font-bold text-ink-900">
                            {lang === 'ar' ? rx.drugNameAr : rx.drugNameEn}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink-500 mt-1">
                          {rx.dosage} • {rx.frequency} • {rx.durationDays} {t('يوماً', 'days')}
                        </p>
                        {rx.taperingSchedule && (
                          <div className="mt-1.5 flex flex-wrap gap-1">
                            {rx.taperingSchedule.map((tap, idx) => (
                              <span key={idx} className="text-[9px] px-1.5 py-0.5 rounded bg-pine-100 text-pine-900 font-bold">
                                {tap}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Follow-up advisory */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-bone-100 border border-pine-200 text-xs font-semibold text-ink-700">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-pine-700" />
                  <span>{t('موعد المراجعة القادم: ', 'Next Review Milestone: ')} <strong className="text-pine-900">{activeRecord.nextFollowUpDate}</strong></span>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-ink-400 text-xs">
              {t('اختر مريضاً لعرض السجل الطبي', 'Select a patient to view EMR')}
            </div>
          )}
        </div>

      </div>

      {/* ========================================================================= */}
      {/* MODAL: NEW CLINICAL CONSULTATION NOTE */}
      {/* ========================================================================= */}
      {isNewRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-bone-100">
              <h3 className="text-base font-extrabold text-pine-900 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-pine-700" />
                <span>{t('تسجيل كشف سريري جديد (OpenMRS Consultation Sheet)', 'New Clinical Consultation Form')}</span>
              </h3>
              <button
                onClick={() => setIsNewRecordModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-bone-100 text-ink-400 hover:text-ink-700 transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateConsultation} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('اسم المريض (عربي) *', 'Patient Name (Arabic) *')}</label>
                  <input
                    type="text"
                    required
                    value={newConsultation.patientNameAr || ''}
                    onChange={(e) => setNewConsultation({ ...newConsultation, patientNameAr: e.target.value })}
                    placeholder="مثال: عبد السلام الفرجاني"
                    className="w-full p-2.5 rounded-xl border border-pine-200 bg-bone-50 focus:bg-white focus:outline-none focus:border-pine-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('العمر ورقم الهاتف', 'Age & Phone')}</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={newConsultation.patientAge || 45}
                      onChange={(e) => setNewConsultation({ ...newConsultation, patientAge: Number(e.target.value) })}
                      className="w-20 p-2.5 rounded-xl border border-pine-200 bg-bone-50 focus:bg-white focus:outline-none focus:border-pine-500"
                    />
                    <input
                      type="text"
                      value={newConsultation.patientPhone || '+218 91 000 0000'}
                      onChange={(e) => setNewConsultation({ ...newConsultation, patientPhone: e.target.value })}
                      className="flex-1 p-2.5 rounded-xl border border-pine-200 bg-bone-50 focus:bg-white focus:outline-none focus:border-pine-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* D5: link to portal account (optional) */}
              <div className="text-xs">
                {linkedAccount ? (
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-pine-50 border border-pine-200">
                    <span className="font-bold text-pine-900">
                      {lang === 'ar' ? 'مرتبط بحساب:' : 'Linked to account:'}{' '}
                      <span className="font-mono" dir="ltr">{linkedAccount.email}</span>
                      <span className="text-ink-500 font-mono" dir="ltr"> · {linkedAccount.phone}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => { setLinkedAccount(null); setAccountQuery(''); }}
                      className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-bold hover:bg-rose-100 transition-colors cursor-pointer"
                    >
                      {t('إلغاء الربط', 'Unlink')}
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <label className="font-bold text-ink-700 block mb-1">
                      {t('ربط بحساب المريض (اختياري — يظهر في بوابة المريض)', 'Link to patient account (optional — visible in the patient portal)')}
                    </label>
                    <input
                      type="text"
                      value={accountQuery}
                      onChange={(e) => setAccountQuery(e.target.value)}
                      placeholder={t('ابحث برقم الهاتف أو البريد أو الاسم…', 'Search by phone, email, or name…')}
                      className="w-full p-2.5 rounded-xl border border-pine-200 bg-bone-50 focus:bg-white focus:outline-none focus:border-pine-500"
                    />
                    {accountSearching && (
                      <p className="absolute inset-x-0 top-full mt-1 p-2 rounded-xl bg-white border border-pine-100 shadow-sm text-ink-500 z-10">
                        {t('جارٍ البحث…', 'Searching…')}
                      </p>
                    )}
                    {!accountSearching && accountResults.length > 0 && (
                      <ul className="absolute inset-x-0 top-full mt-1 rounded-xl bg-white border border-pine-100 shadow-md z-10 max-h-44 overflow-y-auto">
                        {accountResults.map((hit) => (
                          <li key={hit.accountId}>
                            <button
                              type="button"
                              onClick={() => { setLinkedAccount(hit); setAccountResults([]); setAccountQuery(''); }}
                              className="w-full text-start px-3 py-2 hover:bg-pine-50 transition-colors cursor-pointer"
                            >
                              <span className="font-bold text-ink-900">{lang === 'ar' ? hit.labelAr : hit.labelEn}</span>
                              <span className="font-mono text-ink-500" dir="ltr"> · {hit.phone} · {hit.email}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Tonometry & Visual Acuity */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div>
                  <label className="font-bold text-ink-500 block mb-1">{t('نظر اليمنى OD', 'VA OD')}</label>
                  <input
                    type="text"
                    value={newConsultation.visualAcuityOD_BCVA || '6/6'}
                    onChange={(e) => setNewConsultation({ ...newConsultation, visualAcuityOD_BCVA: e.target.value })}
                    className="w-full p-2 rounded-xl border border-pine-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-500 block mb-1">{t('ضغط اليمنى (mmHg)', 'IOP OD')}</label>
                  <input
                    type="number"
                    value={newConsultation.iopOD_mmHg || 16}
                    onChange={(e) => setNewConsultation({ ...newConsultation, iopOD_mmHg: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-pine-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-500 block mb-1">{t('نظر اليسرى OS', 'VA OS')}</label>
                  <input
                    type="text"
                    value={newConsultation.visualAcuityOS_BCVA || '6/6'}
                    onChange={(e) => setNewConsultation({ ...newConsultation, visualAcuityOS_BCVA: e.target.value })}
                    className="w-full p-2 rounded-xl border border-pine-200 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-500 block mb-1">{t('ضغط اليسرى (mmHg)', 'IOP OS')}</label>
                  <input
                    type="number"
                    value={newConsultation.iopOS_mmHg || 15}
                    onChange={(e) => setNewConsultation({ ...newConsultation, iopOS_mmHg: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl border border-pine-200 font-mono"
                  />
                </div>
              </div>

              {/* Diagnosis & ICD-10 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('رمز ICD-10', 'ICD-10 Code')}</label>
                  <input
                    type="text"
                    value={newConsultation.icdCode || 'H25.1'}
                    onChange={(e) => setNewConsultation({ ...newConsultation, icdCode: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-pine-200 font-mono font-bold uppercase"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="font-bold text-ink-700 block mb-1">{t('التشخيص السريري المعتمد', 'Clinical Diagnosis')}</label>
                  <input
                    type="text"
                    value={newConsultation.diagnosisAr || ''}
                    onChange={(e) => setNewConsultation({ ...newConsultation, diagnosisAr: e.target.value })}
                    placeholder="مثال: مياه بيضاء نووية بالعين اليمنى"
                    className="w-full p-2.5 rounded-xl border border-pine-200"
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsNewRecordModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-ink-500 hover:bg-bone-100 rounded-xl"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-pine-700 hover:bg-pine-800 rounded-xl shadow-md cursor-pointer"
                >
                  {t('حفظ المعاينة والوصفة', 'Save EMR Note')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
