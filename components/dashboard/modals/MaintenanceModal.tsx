'use client';

import React, { useState } from 'react';
import { X, Wrench, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { HospitalEquipment } from '@/data/dashboardData';
import Modal from '@/components/ui/Modal';

interface MaintenanceModalProps {
  device: HospitalEquipment | null;
  open: boolean;
  onClose: () => void;
  /** Receives the certified fields so the parent can merge them into its list. */
  onCertified: (deviceId: string, updates: Partial<HospitalEquipment>) => void;
}

export default function MaintenanceModal({ device, open, onClose, onCertified }: MaintenanceModalProps) {
  const { lang, t } = useLanguage();
  const [notes, setNotes] = useState('');
  const [nextDue, setNextDue] = useState('2026-11-15');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!device) return;

    const today = new Date().toISOString().split('T')[0];
    const updates: Partial<HospitalEquipment> = {
      status: 'operational',
      lastMaintenanceDate: today,
      nextServiceDue: nextDue,
      notesAr: notes ? `تمت المعايرة: ${notes}` : undefined,
      healthScore: 100,
      uptimePercentage: 99.9
    };

    fetch(`/api/staff/equipment/${device.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    }).catch(() => {});
    onCertified(device.id, updates);

    onClose();
    setNotes('');
  };

  return (
    <Modal isOpen={open && !!device} onClose={onClose} labelledById="maintenance-title" panelClassName="max-w-lg w-full p-6">
      {device && (
        <>
          <button
            onClick={onClose}
            className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-4">
            <span className="text-[10px] font-mono font-extrabold text-pine-800 bg-pine-50 px-2 py-0.5 rounded uppercase">
              {device.brand} - {device.serialNumber}
            </span>
            <h3 id="maintenance-title" className="text-base font-extrabold text-pine-900 mt-1 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-pine-700" />
              <span>{t('توثيق صيانة ومعايرة جهاز طبي', 'Biomedical Service & Optical Calibration Log')}</span>
            </h3>
            <p className="text-xs text-ink-500 mt-0.5">
              {lang === 'ar' ? device.nameAr : device.nameEn}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="p-3 bg-bone-50 rounded-xl border border-bone-100 space-y-1">
              <div className="flex justify-between">
                <span className="text-ink-500">{t('الموقع الحالي:', 'Location:')}</span>
                <strong className="text-ink-900">{device.roomCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">{t('المهندس المسؤول:', 'Engineer:')}</span>
                <strong className="text-ink-900">
                  {lang === 'ar' ? device.technicianInChargeAr : device.technicianInChargeEn}
                </strong>
              </div>
            </div>

            <div>
              <label className="font-bold text-ink-700 block mb-1">{t('ملاحظات الفحص والمعايرة *', 'Calibration & Inspection Notes *')}</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('تم فحص طاقة الليزر، معايرة المسافة البؤرية، واختبار حساسات الضغط بنجاح...', 'Energy level verified, beam centering tested, full self-diagnostic passed...')}
                className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-ink-700 block mb-1">{t('تاريخ المعايرة الدورية القادمة', 'Next Due Date')}</label>
              <input
                type="date"
                value={nextDue}
                onChange={(e) => setNextDue(e.target.value)}
                className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
              />
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
                className="px-5 py-2.5 bg-pine-800 hover:bg-pine-800 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-brass-300" />
                <span>{t('اعتماد المعايرة وإعادة للخدمة', 'Certify & Set Operational')}</span>
              </button>
            </div>
          </form>
        </>
      )}
    </Modal>
  );
}
