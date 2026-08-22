'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { HospitalEquipment, DeviceStatus } from '@/data/dashboardData';
import { Cpu, ShieldCheck, Wrench, Search, RefreshCw, Plus, Trash2 } from 'lucide-react';

interface EquipmentTabProps {
  equipmentList: HospitalEquipment[];
  onUpdateDeviceStatus: (deviceId: string, newStatus: DeviceStatus) => void;
  onOpenMaintenanceModal: (device: HospitalEquipment) => void;
  onOpenAddEquipmentModal: () => void;
  onRemoveEquipment: (deviceId: string) => void; }

export default function EquipmentTab({
  equipmentList, onUpdateDeviceStatus, onOpenMaintenanceModal, onOpenAddEquipmentModal, onRemoveEquipment
}: EquipmentTabProps) {
  const { lang, t, } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [calibratingId, setCalibratingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const statuses: { id: string; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'جميع الأجهزة الطبية', labelEn: 'All Equipment' }, { id: 'operational', labelAr: 'جاهز ومعاير', labelEn: 'Operational' }, { id: 'in_use', labelAr: 'قيد الاستخدام اللحظي', labelEn: 'In Use' }, { id: 'under_calibration', labelAr: 'قيد المعايرة والاختبار', labelEn: 'Under Calibration' }, { id: 'maintenance_scheduled', labelAr: 'صيانة مجدولة', labelEn: 'Maintenance' }
  ];

  const filteredEquipment = equipmentList.filter((e) => {
    const matchesStatus = selectedStatus === 'all' || e.status === selectedStatus;
    const matchesSearch =
      searchQuery.trim() === '' ||
      e.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.roomCode.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesStatus && matchesSearch; });

  const handleSelfCalibrate = (id: string) => {
    setCalibratingId(id);
    setTimeout(() => {
      setCalibratingId(null);
    }, 1200);
  };

  const getStatusBadge = (status: DeviceStatus) => {
    switch (status) {
      case 'in_use':
        return {
          bg: 'bg-rose-500 text-white', text: t('قيد الاستخدام (نشط)', 'In Use'), border: 'border-rose-300' };
      case 'operational':
        return {
          bg: 'bg-emerald-600 text-white', text: t('جاهز ومعاير 100%', 'Operational'), border: 'border-emerald-300'
        };
      case 'under_calibration':
        return {
          bg: 'bg-amber-500 text-white', text: t('معايرة دورية', 'Calibrating'), border: 'border-amber-300' };
      default:
        return {
          bg: 'bg-slate-600 text-white', text: t('صيانة مجدولة', 'Maintenance'), border: 'border-slate-300'
        };
    } };

  const statusOptions: DeviceStatus[] = [
    'operational',
    'in_use',
    'under_calibration',
    'maintenance_scheduled'
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-black text-[#0C2340] flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-600" />
            <span>{t('إدارة الأجهزة والمعدات الطبية وجراحات الليزر', 'Biomedical Devices & Laser Systems Fleet')}</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(
              'متابعة المعايرة الدورية، سجلات الأمان، ساعات التشغيل، ومؤشرات كفاءة الليزر والميكروسكوبات',
              'Track optical calibration, safety protocols, procedure count & uptime telemetry'
            )}
          </p>
        </div>

        {/* Global Fleet Uptime Metric & Add Device Button */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:flex px-3.5 py-2 bg-teal-50 text-teal-900 border border-teal-200 rounded-xl text-xs font-bold items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>{t('متوسط كفاءة الأسطول: 99.8%', 'Fleet Average Uptime: 99.8%')}</span>
          </div>

          <button
            onClick={onOpenAddEquipmentModal}
            className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('إضافة جهاز طبي جديد', 'Add Medical Device')}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute top-3 left-3 rtl:left-auto rtl:right-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('البحث باسم الجهاز أو الموديل أو السيريال...', 'Search by device name, brand, model, serial...')}
              className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0">
            {statuses.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedStatus === st.id
                    ? 'bg-[#0C2340] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t(st.labelAr, st.labelEn)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Equipment Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredEquipment.map((device) => {
          const badge = getStatusBadge(device.status);
          const isCalibrating = calibratingId === device.id;

          return (
            <div
              key={device.id}
              className={`bg-white rounded-2xl p-5 border-2 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${badge.border}`}
            >
              <div>
                {/* Brand & Serial Number Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200 uppercase tracking-wider block w-fit mb-1">
                      {device.brand}
                    </span>
                    <h3 className="text-sm font-extrabold text-[#0C2340]">
                      {lang === 'ar' ? device.nameAr : device.nameEn}
                    </h3>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={device.status}
                    onChange={(e) => onUpdateDeviceStatus(device.id, e.target.value as DeviceStatus)}
                    className={`text-[10px] font-extrabold py-1 px-2 rounded-lg border focus:outline-none cursor-pointer ${badge.bg}`}
                  >
                    {statusOptions.map((st) => (
                      <option key={st} value={st} className="bg-white text-slate-900 font-semibold">
                        {st === 'operational'
                          ? t('جاهز ومعاير', 'Operational')
                          : st === 'in_use'
                          ? t('قيد الاستخدام', 'In Use')
                          : st === 'under_calibration'
                          ? t('معايرة دورية', 'Under Calibration')
                          : t('صيانة', 'Maintenance')}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model and Room Code */}
                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-3">
                  <div>
                    <span className="text-[10px] text-slate-400 block">{t('الموديل التقني', 'Model')}</span>
                    <span className="font-bold text-slate-800 font-mono text-[11px]">{device.model}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-[10px] text-slate-400 block">{t('الموقع', 'Location')}</span>
                    <span className="font-mono text-xs font-black text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {device.roomCode}
                    </span>
                  </div>
                </div>

                {/* Telemetry Metrics Bar */}
                <div className="grid grid-cols-3 gap-2 bg-slate-900 text-white p-2.5 rounded-xl text-center mb-3">
                  <div>
                    <span className="text-[9px] text-slate-400 block">{t('نسبة الجاهزية', 'Uptime')}</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">{device.uptimePercentage}%</span>
                  </div>
                  <div className="border-x border-slate-700">
                    <span className="text-[9px] text-slate-400 block">{t('إجمالي الحالات', 'Procedures')}</span>
                    <span className="font-mono text-xs font-bold text-amber-300">{device.totalProceduresRun}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block">{t('صحة الجهاز', 'Health')}</span>
                    <span className="font-mono text-xs font-bold text-teal-300">{device.healthScore}/100</span>
                  </div>
                </div>

                {/* Notes & Calibration Status */}
                <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100 mb-3">
                  {lang === 'ar' ? device.notesAr : device.notesEn}
                </p>

                {/* Maintenance Due Date & In Charge */}
                <div className="space-y-1 text-[11px] text-slate-500 mb-3">
                  <div className="flex items-center justify-between">
                    <span>{t('آخر صيانة ومعايرة:', 'Last Calibration:')}</span>
                    <strong className="font-mono text-slate-700">{device.lastMaintenanceDate}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('الصيانة القادمة:', 'Next Due:')}</span>
                    <strong className="font-mono text-teal-700">{device.nextServiceDue}</strong>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>{t('المهندس المسؤول:', 'Engineer In Charge:')}</span>
                    <strong className="text-slate-800">{lang === 'ar' ? device.technicianInChargeAr : device.technicianInChargeEn}</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleSelfCalibrate(device.id)}
                  disabled={isCalibrating}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-800 text-slate-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCalibrating ? 'animate-spin text-teal-600' : ''}`} />
                  <span>{isCalibrating ? t('جاري الاختبار...', 'Testing...') : t('اختبار المعايرة', 'Run Self-Test')}</span>
                </button>

                <button
                  onClick={() => onOpenMaintenanceModal(device)}
                  className="px-3 py-1.5 bg-[#0C2340] hover:bg-teal-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Wrench className="w-3.5 h-3.5 text-teal-300" />
                  <span>{t('طلب صيانة', 'Service Log')}</span>
                </button>

                <button
                  onClick={() => setConfirmingDeleteId(device.id)}
                  title={t('إخراج الجهاز من الخدمة وحذفه', 'Decommission / Remove device')}
                  className="p-1.5 bg-slate-100 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Inline Delete Confirmation */}
              {confirmingDeleteId === device.id && (
                <div className="mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between gap-2 animate-fadeIn">
                  <span className="text-[11px] font-bold text-rose-800 leading-tight">
                    {t('هل تريد بالتأكيد إزالة هذا الجهاز؟', 'Confirm remove equipment?')}
                  </span>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => {
                        onRemoveEquipment(device.id);
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
