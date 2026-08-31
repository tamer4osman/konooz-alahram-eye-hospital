'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  HospitalBed,
  BedStatus,
  WardType
} from '@/data/dashboardData';
import { Bed, HeartPulse, Activity, UserCheck, Sparkles, Clock, Plus, Droplets } from 'lucide-react';

export default function BedManagementTab() {
  const { lang, t, } = useLanguage();

  const [bedsList, setBedsList] = useState<HospitalBed[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/staff/beds')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) setBedsList(json.data as HospitalBed[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  const [activeWardFilter, setActiveWardFilter] = useState<'all' | WardType>('all');
  const [selectedBed, setSelectedBed] = useState<HospitalBed | null>(null);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isAddBedModalOpen, setIsAddBedModalOpen] = useState(false);
  const [confirmingDischargeId, setConfirmingDischargeId] = useState<string | null>(null);

  // Vitals edit form
  const [vitalsForm, setVitalsForm] = useState({
    bloodPressure: '120/80', heartRateBpm: 72, spO2Percent: 99, tempCelsius: 36.8, painScore: 1
  });

  // Add Bed form
  const [newBedForm, setNewBedForm] = useState<Partial<HospitalBed>>({
    bedNumber: 'SUITE-207', wardType: 'daycare_suite', wardNameAr: 'أجنحة الإقامة الفندقية واليوم الواحد', wardNameEn: 'Daycare Private Suites', floorAr: 'الطابق الأول - جناح المرضى الخاص', floorEn: '1st Floor - Private Patient Wing', status: 'ready_clean'
  });

  const filteredBeds = bedsList.filter((bed) => {
    if (activeWardFilter === 'all') return true;
    return bed.wardType === activeWardFilter; });

  const occupiedCount = bedsList.filter((b) => b.status === 'occupied').length;
  const readyCount = bedsList.filter((b) => b.status === 'ready_clean').length;
  const dirtyCount = bedsList.filter((b) => b.status === 'dirty_cleaning').length;
  const reservedCount = bedsList.filter((b) => b.status === 'reserved').length;
  const occupancyRate = Math.round((occupiedCount / Math.max(bedsList.length, 1)) * 100);

  const handleUpdateBedStatus = (bedId: string, newStatus: BedStatus) => {
    setBedsList((prev) =>
      prev.map((bed) => {
        if (bed.id === bedId) {
          return {
            ...bed, status: newStatus, // If cleaned, remove dirty state
            ...(newStatus === 'ready_clean' && {
              patientId: undefined, patientNameAr: undefined, patientNameEn: undefined, bloodPressure: undefined, painScore: undefined
            })
          };
        }
        return bed;
      })
    );
    fetch(`/api/staff/beds/${bedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  const handleDischargePatient = (bedId: string) => {
    setBedsList((prev) =>
      prev.map((b) => (b.id === bedId ? { ...b, status: 'dirty_cleaning' } : b))
    );
    fetch(`/api/staff/beds/${bedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'dirty_cleaning' })
    }).catch(() => {});
    setConfirmingDischargeId(null);
    if (selectedBed?.id === bedId) {
      setSelectedBed(null);
    }
  };

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBed) return;

    const vitals = {
      bloodPressure: vitalsForm.bloodPressure,
      heartRateBpm: Number(vitalsForm.heartRateBpm),
      spO2Percent: Number(vitalsForm.spO2Percent),
      tempCelsius: Number(vitalsForm.tempCelsius),
      painScore: Number(vitalsForm.painScore)
    };

    setBedsList((prev) =>
      prev.map((b) => (b.id === selectedBed.id ? { ...b, ...vitals } : b))
    );
    fetch(`/api/staff/beds/${selectedBed.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(vitals)
    }).catch(() => {});
    setIsVitalsModalOpen(false); };

  const handleAddBed = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      bedNumber: newBedForm.bedNumber || 'BED-' + Math.floor(100 + Math.random() * 900),
      wardType: newBedForm.wardType || 'daycare_suite',
      wardNameAr: newBedForm.wardType === 'pacu_recovery' ? 'وحدة الإفاقة المتقدمة (PACU)' : 'أجنحة الإقامة الفندقية واليوم الواحد',
      wardNameEn: newBedForm.wardType === 'pacu_recovery' ? 'Post-Anesthesia Care Unit (PACU)' : 'Daycare Private Suites',
      floorAr: newBedForm.floorAr || 'الطابق الأول',
      floorEn: newBedForm.floorEn || '1st Floor',
      nurseInChargeAr: 'فاطمة الورفلي (رئيسة التمريض)',
      nurseInChargeEn: 'Fatima Al-Warfalli, RN'
    };

    fetch('/api/staff/beds', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) setBedsList((prev) => [...prev, json.data as HospitalBed]);
      })
      .catch(() => {});
    setIsAddBedModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-ink-900  to-pine-950 rounded-2xl p-5 sm:p-6 text-white border border-pine-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pine-500/20 text-pine-300 border border-brass-400/30 flex items-center gap-1">
              <Bed className="w-3.5 h-3.5" />
              <span>{t('نظام إدارة الأسرّة والأجنحة (Bahmni IPD Ward Map)', 'Inpatient Bed & Ward Management System') }</span>
            </span>
            <span className="text-xs text-ink-400 font-mono">
              Live Vitals Telemetry • PACU & Daycare
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
            {t('خريطة أسرّة الإفاقة، أجنحة الإقامة الفندقية، والمؤشرات الحيوية', 'PACU Recovery Beds, Daycare Suites & Bedside Telemetry')}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddBedModalOpen(true)}
            className="px-4 py-2.5 bg-pine-800 hover:bg-pine-700 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-pine-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('إضافة سرير / جناح جديد', 'Add Bed / Suite')}</span>
          </button>
        </div>
      </div>

      {/* Bed Status KPI Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-xs font-bold">{t('نسبة إشغال الأسرّة', 'Bed Occupancy')}</span>
            <Activity className="w-4 h-4 text-pine-800" />
          </div>
          <div className="text-2xl font-extrabold text-pine-900">{occupancyRate}%</div>
          <span className="text-[10px] text-pine-700 font-semibold">{occupiedCount} {t('مشغول من أصل', 'occupied of')} {bedsList.length}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-xs font-bold">{t('أسرّة جاهزة ومعقمة', 'Ready & Clean')}</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700">{readyCount}</div>
          <span className="text-[10px] text-emerald-600 font-semibold">{t('متاحة لاستقبال الحالات فوراً', 'Available for instant admission')}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-xs font-bold">{t('مرضى قيد الاستشفاء', 'Patients Admitted')}</span>
            <HeartPulse className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-extrabold text-rose-600">{occupiedCount}</div>
          <span className="text-[10px] text-rose-600 font-semibold">{t('تحت الملاحظة والعلامات الحيوية', 'Active vital signs telemetry')}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-xs font-bold">{t('قيد التعقيم والتنظيف', 'Housekeeping')}</span>
            <Droplets className="w-4 h-4 text-brass-600" />
          </div>
          <div className="text-2xl font-extrabold text-brass-600">{dirtyCount}</div>
          <span className="text-[10px] text-brass-600 font-semibold">{t('فريق مكافحة العدوى قيد العمل', 'Sanitization in progress')}</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-pine-200 shadow-xs">
          <div className="flex items-center justify-between text-ink-500 mb-1">
            <span className="text-xs font-bold">{t('محجوز لحالات لاحقة', 'Reserved')}</span>
            <Clock className="w-4 h-4 text-pine-700" />
          </div>
          <div className="text-2xl font-extrabold text-pine-800">{reservedCount}</div>
          <span className="text-[10px] text-pine-700 font-semibold">{t('لجراحات اليوم المجدولة', 'For upcoming surgical cases')}</span>
        </div>
      </div>

      {/* Ward Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveWardFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeWardFilter === 'all'
              ? 'bg-[#0B3D33] text-white shadow-xs'
              : 'bg-white text-ink-500 hover:bg-bone-100 border border-pine-200'
          }`}
        >
          {t('كل الأجنحة والأسرّة', 'All Wards & Beds')} ({bedsList.length})
        </button>
        <button
          onClick={() => setActiveWardFilter('pacu_recovery')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeWardFilter === 'pacu_recovery'
              ? 'bg-pine-800 text-white shadow-xs'
              : 'bg-white text-ink-500 hover:bg-bone-100 border border-pine-200'
          }`}
        >
          {t('وحدة الإفاقة المتقدمة (PACU)', 'PACU Recovery Ward')}
        </button>
        <button
          onClick={() => setActiveWardFilter('daycare_suite')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeWardFilter === 'daycare_suite'
              ? 'bg-pine-700 text-white shadow-xs'
              : 'bg-white text-ink-500 hover:bg-bone-100 border border-pine-200'
          }`}
        >
          {t('أجنحة الإقامة الفندقية اليومية', 'Daycare Private Suites')}
        </button>
        <button
          onClick={() => setActiveWardFilter('vip_inpatient')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeWardFilter === 'vip_inpatient'
              ? 'bg-brass-600 text-white shadow-xs'
              : 'bg-white text-ink-500 hover:bg-bone-100 border border-pine-200'
          }`}
        >
          {t('الجناح الملكي الفندقي (VIP)', 'Royal Executive VIP')}
        </button>
      </div>

      {/* Visual Bed Grid (Bahmni Ward Matrix) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBeds.map((bed) => {
          const isOccupied = bed.status === 'occupied';
          const isClean = bed.status === 'ready_clean';
          const isDirty = bed.status === 'dirty_cleaning';
          const _isReserved = bed.status === 'reserved';

          return (
            <div
              key={bed.id}
              className={`bg-white rounded-2xl p-5 border transition-all relative overflow-hidden shadow-xs hover:shadow-md ${
                isOccupied
                  ? 'border-rose-300 ring-1 ring-rose-200'
                  : isClean
                  ? 'border-pine-300 ring-1 ring-pine-100'
                  : isDirty
                  ? 'border-brass-300 ring-1 ring-brass-100'
                  : 'border-ink-300'
              }`}
            >
              {/* Card Header Strip */}
              <div className="flex items-start justify-between gap-2 pb-3 mb-3 border-b border-bone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-[#0B3D33] text-white">
                      {bed.bedNumber}
                    </span>
                    <h3 className="text-xs font-extrabold text-ink-900">
                      {lang === 'ar' ? bed.wardNameAr : bed.wardNameEn}
                    </h3>
                  </div>
                  <span className="text-[10px] text-ink-500 block mt-0.5">
                    {lang === 'ar' ? bed.floorAr : bed.floorEn}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    isOccupied
                      ? 'bg-rose-500 text-white animate-pulse'
                      : isClean
                      ? 'bg-emerald-600 text-white'
                      : isDirty
                      ? 'bg-brass-500 text-white'
                      : 'bg-ink-500 text-white'
                  }`}
                >
                  {isOccupied
                    ? t('مشغول بمريض', 'Occupied')
                    : isClean
                    ? t('جاهز ومعقم', 'Ready & Clean')
                    : isDirty
                    ? t('قيد التعقيم', 'Needs Cleaning')
                    : t('محجوز', 'Reserved')}
                </span>
              </div>

              {/* Card Body: Patient Details or Vacant State */}
              {isOccupied ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] font-bold text-ink-400 block">{t('المريض الحالي:', 'Admitted Patient:')}</span>
                    <h4 className="text-xs font-extrabold text-pine-900 flex items-center gap-1.5 mt-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-pine-700" />
                      <span>{lang === 'ar' ? bed.patientNameAr : bed.patientNameEn}</span>
                      <span className="text-[10px] text-ink-500 font-normal">({bed.patientAge} {t('سنة', 'yrs')})</span>
                    </h4>
                    {bed.surgeryPerformedAr && (
                      <p className="text-[11px] text-ink-500 font-medium mt-1">
                        {lang === 'ar' ? bed.surgeryPerformedAr : bed.surgeryPerformedEn}
                      </p>
                    )}
                    <span className="text-[10px] text-ink-500 block mt-0.5">
                      {t('الجراح: ', 'Surgeon: ')} {lang === 'ar' ? bed.assignedDoctorAr : bed.assignedDoctorEn}
                    </span>
                  </div>

                  {/* Bedside Vitals Telemetry */}
                  {bed.bloodPressure && (
                    <div className="grid grid-cols-4 gap-1.5 p-2.5 bg-bone-50 rounded-xl border border-bone-100 text-center">
                      <div>
                        <span className="text-[9px] text-ink-400 block font-bold">BP</span>
                        <span className="text-[11px] font-mono font-bold text-ink-700">{bed.bloodPressure}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-ink-400 block font-bold">HR</span>
                        <span className="text-[11px] font-mono font-bold text-rose-700">{bed.heartRateBpm} <small className="text-[8px]">bpm</small></span>
                      </div>
                      <div>
                        <span className="text-[9px] text-ink-400 block font-bold">SpO2</span>
                        <span className="text-[11px] font-mono font-bold text-pine-800">{bed.spO2Percent}%</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-ink-400 block font-bold">Pain</span>
                        <span className="text-[11px] font-mono font-bold text-pine-700">{bed.painScore}/10</span>
                      </div>
                    </div>
                  )}

                  {/* Inline Discharge Confirmation */}
                  {confirmingDischargeId === bed.id ? (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                      <p className="text-[11px] font-bold text-rose-900">
                        {t('هل تؤكد تصريح خروج المريض وتحويل السرير للتعقيم؟', 'Confirm patient discharge & dispatch cleaning?')}
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDischargePatient(bed.id)}
                          className="flex-1 py-1 text-[10px] font-extrabold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
                        >
                          {t('نعم، تصريح الخروج', 'Yes, Discharge')}
                        </button>
                        <button
                          onClick={() => setConfirmingDischargeId(null)}
                          className="flex-1 py-1 text-[10px] font-bold bg-white text-ink-700 border border-ink-300 rounded-lg cursor-pointer"
                        >
                          {t('إلغاء', 'Cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 pt-2 border-t border-bone-100">
                      <button
                        onClick={() => {
                          setSelectedBed(bed);
                          setVitalsForm({
                            bloodPressure: bed.bloodPressure || '120/80',
                            heartRateBpm: bed.heartRateBpm || 72,
                            spO2Percent: bed.spO2Percent || 99,
                            tempCelsius: bed.tempCelsius || 36.8,
                            painScore: bed.painScore || 1
                          });
                          setIsVitalsModalOpen(true);
                        }}
                        className="flex-1 py-1.5 px-2 bg-bone-100 hover:bg-pine-200 text-ink-700 text-[11px] font-bold rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <HeartPulse className="w-3.5 h-3.5 text-rose-600" />
                        <span>{t('تحديث المؤشرات الحيوية', 'Vitals')}</span>
                      </button>

                      <button
                        onClick={() => setConfirmingDischargeId(bed.id)}
                        className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                      >
                        {t('خروج المريض', 'Discharge')}
                      </button>
                    </div>
                  )}
                </div>
              ) : isDirty ? (
                <div className="space-y-3 py-2 text-center">
                  <Droplets className="w-8 h-8 text-brass-500 mx-auto" />
                  <div>
                    <span className="text-xs font-extrabold text-brass-600 block">{t('السرير بانتظار التعقيم والتطهير', 'Sanitization Required')}</span>
                    <span className="text-[10px] text-ink-500">{t('مسؤول التعقيم: فريق مكافحة العدوى', 'Assigned: Infection Control')}</span>
                  </div>
                  <button
                    onClick={() => handleUpdateBedStatus(bed.id, 'ready_clean')}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{t('تأكيد اكتمال التعقيم والجاهزية', 'Mark as Sterile & Ready')}</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3 py-2 text-center">
                  <Sparkles className="w-8 h-8 text-pine-500 mx-auto" />
                  <div>
                    <span className="text-xs font-extrabold text-pine-900 block">{t('السرير معقم ومتاح للاستقبال', 'Clean & Ready for Admission')}</span>
                    <span className="text-[10px] text-ink-500">{t('المسؤول: ', 'Nurse: ')} {lang === 'ar' ? bed.nurseInChargeAr : bed.nurseInChargeEn}</span>
                  </div>
                  <button
                    onClick={() => handleUpdateBedStatus(bed.id, 'reserved')}
                    className="w-full py-1.5 bg-bone-100 hover:bg-pine-200 text-ink-700 text-xs font-bold rounded-xl border border-pine-200 transition-colors cursor-pointer"
                  >
                    {t('حجز لجراحة قادمة', 'Reserve for Upcoming Case')}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* MODAL: UPDATE VITAL SIGNS TELEMETRY */}
      {/* ========================================================================= */}
      {isVitalsModalOpen && selectedBed && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-bone-100">
              <h3 className="text-sm font-extrabold text-pine-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" />
                <span>{t('تسجيل المؤشرات الحيوية السريرية', 'Record Vital Signs Telemetry')}</span>
              </h3>
              <button
                onClick={() => setIsVitalsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-bone-100 text-ink-400 hover:text-ink-700"
              >
                ✕
              </button>
            </div>

            <div className="mb-4 p-3 bg-bone-50 rounded-xl border border-pine-200 text-xs">
              <span className="text-[10px] text-ink-500 block">{t('المريض والسرير:', 'Patient & Bed:')}</span>
              <span className="font-bold text-ink-900">{lang === 'ar' ? selectedBed.patientNameAr : selectedBed.patientNameEn}</span>
              <span className="font-mono text-pine-800 font-bold block mt-0.5">{selectedBed.bedNumber}</span>
            </div>

            <form onSubmit={handleSaveVitals} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('ضغط الدم (Blood Pressure)', 'Blood Pressure (mmHg)')}</label>
                <input
                  type="text"
                  value={vitalsForm.bloodPressure}
                  onChange={(e) => setVitalsForm({ ...vitalsForm, bloodPressure: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-pine-200 font-mono font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('نبض القلب (HR bpm)', 'Heart Rate (bpm)')}</label>
                  <input
                    type="number"
                    value={vitalsForm.heartRateBpm}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, heartRateBpm: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-pine-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('نسبة الأكسجين (SpO2 %)', 'SpO2 (%)')}</label>
                  <input
                    type="number"
                    value={vitalsForm.spO2Percent}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, spO2Percent: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-pine-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('درجة الحرارة (°C)', 'Temperature (°C)')}</label>
                  <input
                    type="number"
                    step="0.1"
                    value={vitalsForm.tempCelsius}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, tempCelsius: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-pine-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('مستوى الألم (1-10)', 'Pain Score (1-10)')}</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={vitalsForm.painScore}
                    onChange={(e) => setVitalsForm({ ...vitalsForm, painScore: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-pine-200 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsVitalsModalOpen(false)}
                  className="px-3 py-2 text-xs font-bold text-ink-500 hover:bg-bone-100 rounded-xl"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-extrabold text-white bg-pine-800 hover:bg-pine-700 rounded-xl shadow-md cursor-pointer"
                >
                  {t('حفظ المؤشرات الحيوية', 'Save Vitals')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW BED / WARD SUITE */}
      {/* ========================================================================= */}
      {isAddBedModalOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-bone-100">
              <h3 className="text-base font-extrabold text-pine-900 flex items-center gap-2">
                <Bed className="w-5 h-5 text-pine-800" />
                <span>{t('إضافة سرير أو جناح استشفاء جديد', 'Add Inpatient Bed / Suite')}</span>
              </h3>
              <button
                onClick={() => setIsAddBedModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-bone-100 text-ink-400 hover:text-ink-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBed} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('رمز السرير / الجناح *', 'Bed Code *')}</label>
                <input
                  type="text"
                  required
                  value={newBedForm.bedNumber || ''}
                  onChange={(e) => setNewBedForm({ ...newBedForm, bedNumber: e.target.value })}
                  placeholder="مثال: PACU-07 أو SUITE-207"
                  className="w-full p-2.5 rounded-xl border border-pine-200 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('نوع الجناح الطبي', 'Ward Category')}</label>
                <select
                  value={newBedForm.wardType}
                  onChange={(e) => setNewBedForm({ ...newBedForm, wardType: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl border border-pine-200 bg-white"
                >
                  <option value="pacu_recovery">{t('وحدة الإفاقة المتقدمة (PACU)', 'PACU Recovery Ward')}</option>
                  <option value="daycare_suite">{t('أجنحة الإقامة الفندقية واليوم الواحد', 'Daycare Private Suites')}</option>
                  <option value="vip_inpatient">{t('الجناح الملكي الفندقي (VIP Suite)', 'Royal VIP Suite')}</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('الطابق والموقع', 'Floor / Location')}</label>
                <input
                  type="text"
                  value={newBedForm.floorAr || ''}
                  onChange={(e) => setNewBedForm({ ...newBedForm, floorAr: e.target.value })}
                  placeholder="مثال: الطابق الثاني - مجمع العمليات"
                  className="w-full p-2.5 rounded-xl border border-pine-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsAddBedModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-ink-500 hover:bg-bone-100 rounded-xl"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-extrabold text-white bg-pine-800 hover:bg-pine-700 rounded-xl shadow-md cursor-pointer"
                >
                  {t('تسجيل السرير في الخريطة', 'Add Bed to Map')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
