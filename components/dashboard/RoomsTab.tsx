'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { HospitalRoom, RoomStatus } from '@/data/dashboardData';
import { Building2, Activity, ShieldCheck, Thermometer, Droplets, Wind, User, Cpu, Bed, Plus, Trash2 } from 'lucide-react';

interface RoomsTabProps {
  roomsList: HospitalRoom[];
  onUpdateRoomStatus: (roomId: string, newStatus: RoomStatus) => void;
  onOpenRoomModal: (room: HospitalRoom) => void;
  onOpenAddRoomModal: () => void;
  onRemoveRoom: (roomId: string) => void; }

export default function RoomsTab({
  roomsList, onUpdateRoomStatus, onOpenRoomModal, onOpenAddRoomModal, onRemoveRoom
}: RoomsTabProps) {
  const { lang, t, } = useLanguage();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, _setSelectedStatus] = useState<string>('all');
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const types: { id: string; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'جميع الغرف والأجنحة', labelEn: 'All Facilities' }, { id: 'operating_theater', labelAr: 'غرف العمليات الكبرى (OR)', labelEn: 'Operating Theaters' }, { id: 'outpatient_clinic', labelAr: 'العيادات الخارجية التخصصية', labelEn: 'Outpatient Clinics' }, { id: 'diagnostic_suite', labelAr: 'مختبرات الأشعة والتشخيص', labelEn: 'Diagnostic Labs' }, { id: 'recovery_ward', labelAr: 'وحدة الإفاقة والأسرّة الفندقية', labelEn: 'Recovery & Daycare Beds' }, { id: 'laser_room', labelAr: 'غرف الليزر الصغرى', labelEn: 'Laser Procedure Rooms' }
  ];

  const filteredRooms = roomsList.filter((r) => {
    const matchesType = selectedType === 'all' || r.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'occupied_surgery':
        return {
          bg: 'bg-rose-500 text-white',
          text: t('جراحة نشطة', 'In Surgery'),
          border: 'border-rose-300'
        };
      case 'in_consultation':
        return {
          bg: 'bg-amber-500 text-white',
          text: t('كشف نشط', 'In Consultation'),
          border: 'border-amber-300'
        };
      case 'ready_clean':
        return {
          bg: 'bg-emerald-600 text-white',
          text: t('جاهزة ومعقمة 100%', 'Ready & Sterile'),
          border: 'border-emerald-300'
        };
      case 'sterilizing':
        return {
          bg: 'bg-blue-600 text-white',
          text: t('قيد دورة التعقيم', 'Sterilization In Progress'),
          border: 'border-blue-300'
        };
      default:
        return {
          bg: 'bg-slate-600 text-white',
          text: t('صيانة وتحديث', 'Maintenance'),
          border: 'border-slate-300'
        };
    }
  };

  const statusOptions: RoomStatus[] = [
    'ready_clean',
    'occupied_surgery',
    'in_consultation',
    'sterilizing',
    'maintenance'
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-[#0C2340] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-600" />
            <span>{t('إدارة غرف العمليات والعيادات ومراقبة الأسرّة', 'Operating Theaters, Clinics & Facility Control')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'مراقبة فورية للتعقيم، ضغط الهواء الإيجابي HEPA، درجات الحرارة، والأجهزة الملحقة بكل جناح',
              'Real-time environmental telemetry, positive HEPA pressure, temperature & attached systems'
            )}
          </p>
        </div>

        {/* Live Facility Summary Counter & Add Room Button */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex px-3 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('معايير التعقيم: 100% مطابقة', 'Sterility: 100% Verified')}</span>
          </div>

          <button
            onClick={onOpenAddRoomModal}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('إضافة جناح / غرفة جديدة', 'Add New Room / Suite')}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        {types.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedType === type.id
                ? 'bg-[#0C2340] text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t(type.labelAr, type.labelEn)}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredRooms.map((room) => {
          const badge = getStatusBadge(room.status);
          const occupancyRatio = (room.occupiedCount / room.capacity) * 100;

          return (
            <div
              key={room.id}
              className={`bg-white rounded-2xl p-5 border-2 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${badge.border}`}
            >
              <div>
                {/* Top Code, Title & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                        {room.code}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400">
                        {lang === 'ar' ? room.floorAr : room.floorEn}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-[#0C2340]">
                      {lang === 'ar' ? room.nameAr : room.nameEn}
                    </h3>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={room.status}
                    onChange={(e) => onUpdateRoomStatus(room.id, e.target.value as RoomStatus)}
                    className={`text-[11px] font-extrabold py-1 px-2 rounded-lg border focus:outline-none cursor-pointer ${badge.bg}`}
                  >
                    {statusOptions.map((st) => (
                      <option key={st} value={st} className="bg-white text-slate-900 font-semibold">
                        {st === 'ready_clean'
                          ? t('جاهزة ومعقمة', 'Ready & Clean')
                          : st === 'occupied_surgery'
                          ? t('جراحة نشطة', 'In Surgery')
                          : st === 'in_consultation'
                          ? t('كشف نشط', 'In Consultation')
                          : st === 'sterilizing'
                          ? t('قيد التعقيم', 'Sterilizing')
                          : t('صيانة', 'Maintenance')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Active Case / Doctor in Charge Box */}
                {(room.currentDoctorAr || room.currentProcedureAr) && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mb-3 space-y-1 text-xs">
                    {room.currentDoctorAr && (
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <User className="w-3.5 h-3.5 text-teal-600" />
                        <span>{lang === 'ar' ? room.currentDoctorAr : room.currentDoctorEn}</span>
                      </div>
                    )}
                    {room.currentProcedureAr && (
                      <div className="flex items-start gap-1.5 text-slate-600 font-semibold text-[11px]">
                        <Activity className="w-3.5 h-3.5 text-rose-500 mt-0.5 flex-shrink-0" />
                        <span>{lang === 'ar' ? room.currentProcedureAr : room.currentProcedureEn}</span>
                      </div>
                    )}
                    {room.currentPatientId && (
                      <div className="text-[10px] text-slate-400 font-mono">
                        {t('رقم المريض: ', 'Patient ID: ')} {room.currentPatientId}
                      </div>
                    )}
                  </div>
                )}

                {/* Main Hardware Attached */}
                <div className="p-2.5 bg-teal-50/50 rounded-xl border border-teal-100 mb-3 flex items-center gap-2 text-xs">
                  <Cpu className="w-4 h-4 text-teal-700 flex-shrink-0" />
                  <span className="text-[11px] font-bold text-teal-950 truncate">
                    {lang === 'ar' ? room.mainDeviceAssignedAr : room.mainDeviceAssignedEn}
                  </span>
                </div>

                {/* Live Environmental Sensors */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900 text-white p-2.5 rounded-xl text-center mb-3">
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                      <Thermometer className="w-3 h-3 text-amber-400" />
                      <span>{t('الحرارة', 'Temp')}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-300">{room.tempCelsius}°C</span>
                  </div>

                  <div className="border-x border-slate-700">
                    <span className="text-[9px] text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                      <Droplets className="w-3 h-3 text-teal-400" />
                      <span>{t('الرطوبة', 'Hum')}</span>
                    </span>
                    <span className="font-mono text-xs font-bold text-teal-300">{room.humidityPercent}%</span>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5 flex items-center justify-center gap-1">
                      <Wind className="w-3 h-3 text-emerald-400" />
                      <span>{t('الضغط', 'Pressure')}</span>
                    </span>
                    <span className="text-[10px] font-bold text-emerald-300">
                      {room.airPressureHepa === 'positive_optimal'
                        ? t('+ إيجابي HEPA', '+ Positive')
                        : t('قياسي', 'Standard')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Capacity / Bed Occupancy Progress Bar */}
              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                  <span className="flex items-center gap-1">
                    <Bed className="w-3 h-3 text-teal-600" />
                    <span>{t('الإشغال / الطاقة الاستيعابية', 'Capacity / Occupancy')}</span>
                  </span>
                  <span className="font-mono text-slate-900">
                    {room.occupiedCount} / {room.capacity}
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      occupancyRatio >= 100
                        ? 'bg-rose-500'
                        : occupancyRatio > 0
                        ? 'bg-teal-500'
                        : 'bg-emerald-400'
                    }`}
                    style={{ width: `${Math.max(occupancyRatio, 5)}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons: Details & Remove Room */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 mt-3">
                <button
                  onClick={() => onOpenRoomModal(room)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-[#0C2340] hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-colors cursor-pointer text-center"
                >
                  {t('لوحة تحكم الجناح', 'Room Controls')}
                </button>

                <button
                  onClick={() => setConfirmingDeleteId(room.id)}
                  title={t('حذف هذا الجناح من النظام', 'Remove room')}
                  className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline Delete Confirmation */}
              {confirmingDeleteId === room.id && (
                <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 animate-fadeIn">
                  <span className="text-[11px] font-bold text-rose-800 leading-tight">
                    {t('هل تريد بالتأكيد إزالة هذا الجناح؟', 'Confirm remove room?')}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        onRemoveRoom(room.id);
                        setConfirmingDeleteId(null);
                      }}
                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-black rounded-lg transition-colors cursor-pointer"
                    >
                      {t('نعم، حذف', 'Delete')}
                    </button>
                    <button
                      onClick={() => setConfirmingDeleteId(null)}
                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      {t('إلغاء', 'Cancel')}
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
}
