'use client';
// fallow-ignore-file

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { DASHBOARD_MODULES, ROLE_PRESETS, type DashboardModule, type PermissionsMap } from '@/lib/permissions';
import Modal from '@/components/ui/Modal';
import { Shield, Check, X, ChevronDown } from 'lucide-react';

interface PermissionMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The staff member being edited */
  targetUserId: string;
  targetUserName: string;
  /** Current permissions for this user */
  currentPermissions: PermissionsMap;
  /** Callback when permissions are saved */
  onSave: (permissions: PermissionsMap) => void;
}

const MODULE_LABELS: Record<DashboardModule, { ar: string; en: string }> = {
  overview: { ar: 'لوحة التحكم', en: 'Overview' },
  clinical: { ar: 'الكشف السريري', en: 'Clinical' },
  surgeries: { ar: 'العمليات', en: 'Surgeries' },
  rooms: { ar: 'الغرف', en: 'Rooms' },
  beds: { ar: 'الأسرّة', en: 'Beds' },
  personnel: { ar: 'الكوادر', en: 'Personnel' },
  equipment: { ar: 'الأجهزة', en: 'Equipment' },
  billing: { ar: 'الفوترة', en: 'Billing' },
  analytics: { ar: 'التحليلات', en: 'Analytics' },
};

export default function PermissionMatrixModal({
  isOpen,
  onClose,
  targetUserId,
  targetUserName,
  currentPermissions,
  onSave,
}: PermissionMatrixModalProps) {
  const { lang, t } = useLanguage();
  const [permissions, setPermissions] = useState<PermissionsMap>({ ...currentPermissions });
  const [saving, setSaving] = useState(false);

  const toggleModule = (module: DashboardModule) => {
    setPermissions((prev) => {
      const current = prev[module];
      const next: PermissionsMap = { ...prev };
      if (!current) {
        next[module] = 'read';
      } else if (current === 'read') {
        next[module] = 'write';
      } else {
        delete next[module];
      }
      return next;
    });
  };

  const applyPreset = (presetName: string) => {
    const preset = ROLE_PRESETS[presetName];
    if (preset) setPermissions({ ...preset });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/users/${targetUserId}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions }),
      });
      if (res.ok) {
        onSave(permissions);
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} labelledById="perm-matrix-title" panelClassName="max-w-lg">
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-pine-200 pb-3">
          <Shield className="w-5 h-5 text-pine-700" />
          <h2 id="perm-matrix-title" className="text-sm font-extrabold text-pine-900">
            {t('صلاحيات الوصول', 'Access Permissions')} — {targetUserName}
          </h2>
        </div>

        {/* Preset selector */}
        <div>
          <label className="text-xs font-bold text-ink-700 mb-1 block">
            {t('قالب سريع', 'Quick Preset')}
          </label>
          <div className="relative">
            <select
              onChange={(e) => e.target.value && applyPreset(e.target.value)}
              defaultValue=""
              className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg appearance-none"
            >
              <option value="" disabled>{t('اختر قالباً...', 'Choose a preset...')}</option>
              {Object.keys(ROLE_PRESETS).map((name) => (
                <option key={name} value={name}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Permission matrix */}
        <div className="space-y-1">
          <div className="grid grid-cols-[1fr_60px_60px] gap-1 text-[10px] font-bold text-ink-500 px-2">
            <span>{t('الوحدة', 'Module')}</span>
            <span className="text-center">{t('قراءة', 'Read')}</span>
            <span className="text-center">{t('كتابة', 'Write')}</span>
          </div>
          {DASHBOARD_MODULES.map((mod) => {
            const level = permissions[mod];
            return (
              <div
                key={mod}
                className="grid grid-cols-[1fr_60px_60px] gap-1 items-center px-2 py-1.5 rounded-lg hover:bg-bone-100"
              >
                <span className="text-xs font-medium text-ink-700">
                  {lang === 'ar' ? MODULE_LABELS[mod].ar : MODULE_LABELS[mod].en}
                </span>
                <button
                  type="button"
                  onClick={() => toggleModule(mod)}
                  className={`w-full h-6 rounded flex items-center justify-center text-xs transition-all ${
                    level
                      ? 'bg-pine-900 text-white'
                      : 'bg-bone-200 text-ink-400 hover:bg-bone-100'
                  }`}
                >
                  {level ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-40" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPermissions((prev) => {
                      const next = { ...prev };
                      if (level === 'write') {
                        next[mod] = 'read';
                      } else if (level === 'read') {
                        next[mod] = 'write';
                      } else {
                        delete next[mod];
                      }
                      return next;
                    });
                  }}
                  className={`w-full h-6 rounded flex items-center justify-center text-xs transition-all ${
                    level === 'write'
                      ? 'bg-brass-500 text-white'
                      : 'bg-bone-200 text-ink-400 hover:bg-bone-100'
                  }`}
                >
                  {level === 'write' ? <Check className="w-3 h-3" /> : <X className="w-3 h-3 opacity-40" />}
                </button>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2 border-t border-pine-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-ink-500 hover:text-ink-700"
          >
            {t('إلغاء', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-bold bg-pine-900 text-white rounded-lg hover:bg-pine-800 disabled:opacity-50"
          >
            {saving ? t('...', '...') : t('حفظ', 'Save')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
