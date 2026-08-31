import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface FormSelectOption {
  id: string;
  labelAr: string;
  labelEn: string;
}

export interface FormSelectProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: FormSelectOption[];
  lang: 'ar' | 'en';
  icon?: React.ReactNode;
}

export default function FormSelect({
  id,
  label,
  value,
  onChange,
  options,
  lang,
  icon,
}: FormSelectProps) {
  return (
    <div>
      <label className="block text-xs font-bold text-ink-700 mb-1 flex items-center gap-1.5">
        {icon}
        <span>{label}</span>
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full ps-3.5 pe-8 py-2.5 text-xs sm:text-sm bg-white border border-ink-300 rounded-xl focus:ring-2 focus:ring-pine-500 focus:border-pine-500 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {lang === 'ar' ? opt.labelAr : opt.labelEn}
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-ink-400 absolute left-3 rtl:left-3 rtl:right-auto top-3.5 pointer-events-none" />
      </div>
    </div>
  );
}
