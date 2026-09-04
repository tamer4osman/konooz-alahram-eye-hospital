'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import Modal from '@/components/ui/Modal';
import type { SurgicalConsumable } from '@/data/dashboardData';
import { AlertTriangle, PackagePlus } from 'lucide-react';

export interface RestockModalProps {
  item: SurgicalConsumable | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function RestockModal({ item, onClose, onSaved }: RestockModalProps) {
  const { t } = useLanguage();
  const [stockLevel, setStockLevel] = useState('0');
  const [reorderStatus, setReorderStatus] = useState<SurgicalConsumable['reorderStatus']>('optimal');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (item) {
      setStockLevel(String(item.stockCurrent));
      setReorderStatus(item.reorderStatus);
      setError(null);
    }
  }, [item]);

  if (!item) return null;

  const parsedLevel = Number(stockLevel);
  const levelValid = Number.isInteger(parsedLevel) && parsedLevel >= 0;

  const handleSave = async () => {
    if (!levelValid) {
      setError(t('أدخل رقماً صحيحاً صفراً أو أكثر', 'Enter a whole number of zero or more'));
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/staff/consumables/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stockLevel: parsedLevel, reorderStatus }),
      });
      if (res.ok) {
        onSaved();
        onClose();
      } else {
        const json = await res.json().catch(() => null);
        setError(json?.messageAr ?? t('تعذر حفظ التحديث', 'Could not save the update'));
      }
    } catch {
      setError(t('تعذر الاتصال بالخادم', 'Could not reach the server'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={item !== null}
      onClose={onClose}
      labelledById="restock-title"
      panelClassName="max-w-md"
    >
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-pine-200 pb-3">
          <PackagePlus className="w-5 h-5 text-pine-700" />
          <h2 id="restock-title" className="text-sm font-extrabold text-pine-900">
            {t('تعديل المخزون', 'Adjust Stock')}
          </h2>
        </div>

        <p className="text-xs text-ink-700 font-bold">
          {t(item.nameAr, item.nameEn || item.nameAr)}
          <span className="text-[10px] font-mono text-ink-500 block mt-0.5">{item.brand}</span>
        </p>

        <div>
          <label htmlFor="restock-level" className="block text-xs font-bold text-ink-700 mb-1">
            {t('الكمية الحالية', 'Current quantity')} ({t(item.unitAr, item.unitEn || item.unitAr)})
          </label>
          <input
            id="restock-level"
            name="stockLevel"
            type="number"
            min={0}
            step={1}
            value={stockLevel}
            onChange={(e) => setStockLevel(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-none"
          />
        </div>

        <div>
          <label htmlFor="restock-reorder" className="block text-xs font-bold text-ink-700 mb-1">
            {t('حالة التوريد', 'Reorder status')}
          </label>
          <select
            id="restock-reorder"
            name="reorderStatus"
            value={reorderStatus}
            onChange={(e) => setReorderStatus(e.target.value as SurgicalConsumable['reorderStatus'])}
            className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-xl appearance-none"
          >
            <option value="optimal">{t('مخزون مثالي', 'Optimal')}</option>
            <option value="low_stock">{t('مخزون منخفض', 'Low Stock')}</option>
            <option value="reorder_placed">{t('تم طلب التوريد', 'Reorder Placed')}</option>
          </select>
        </div>

        {error && (
          <div role="alert" className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl px-3 py-2.5 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-pine-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-ink-500 hover:text-ink-700 cursor-pointer"
          >
            {t('إلغاء', 'Cancel')}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !levelValid}
            className="px-4 py-2 text-xs font-bold bg-pine-900 text-white rounded-lg hover:bg-pine-800 disabled:opacity-50 cursor-pointer"
          >
            {saving ? t('...', '...') : t('حفظ', 'Save')}
          </button>
        </div>
      </div>
    </Modal>
  );
}
