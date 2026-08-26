'use client';

import React from 'react';
import type { IntakeField } from '@/lib/types/intake-schema';
import type { Language } from '@/context/LanguageContext';
import { ChevronDown } from 'lucide-react';

interface IntakeFormRendererProps {
  fields: IntakeField[];
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
  lang: Language;
  errors?: Record<string, string>;
}

function RadioGroup({
  field,
  value,
  onChange,
  lang,
}: {
  field: IntakeField;
  value: string;
  onChange: (v: string) => void;
  lang: Language;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {field.options?.map((opt) => {
        const selected = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-all font-medium ${
              selected
                ? 'bg-pine-900 text-bone-50 border-pine-900'
                : 'bg-white text-ink-700 border-pine-900/15 hover:border-pine-600'
            }`}
          >
            {lang === 'ar' ? opt.labelAr : opt.labelEn}
            {opt.emoji ? ` ${opt.emoji}` : ''}
          </button>
        );
      })}
    </div>
  );
}

function SelectField({
  field,
  value,
  onChange,
  lang,
}: {
  field: IntakeField;
  value: string;
  onChange: (v: string) => void;
  lang: Language;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden appearance-none transition-all text-ink-900 font-medium cursor-pointer"
      >
        <option value="">
          {lang === 'ar' ? '— اختر —' : '— Select —'}
        </option>
        {field.options?.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {lang === 'ar' ? opt.labelAr : opt.labelEn}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3.5 h-3.5 text-ink-400 absolute left-2.5 top-2.5 pointer-events-none" />
    </div>
  );
}

function TextField({
  field,
  value,
  onChange,
  lang,
}: {
  field: IntakeField;
  value: string;
  onChange: (v: string) => void;
  lang: Language;
}) {
  return (
    <input
      type={field.type === 'tel' ? 'tel' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : 'text'}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={lang === 'ar' ? field.placeholderAr : field.placeholderEn}
      minLength={field.minLength}
      maxLength={field.maxLength}
      className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden transition-all text-ink-900"
    />
  );
}

function TextareaField({
  field,
  value,
  onChange,
  lang,
}: {
  field: IntakeField;
  value: string;
  onChange: (v: string) => void;
  lang: Language;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={lang === 'ar' ? field.placeholderAr : field.placeholderEn}
      minLength={field.minLength}
      maxLength={field.maxLength}
      rows={3}
      className="w-full px-3 py-2 text-xs bg-white border border-pine-900/15 rounded-lg focus:ring-2 focus:ring-pine-600 focus:border-pine-600 outline-hidden transition-all text-ink-900 resize-none"
    />
  );
}

export default function IntakeFormRenderer({
  fields,
  values,
  onChange,
  lang,
  errors,
}: IntakeFormRendererProps) {
  return (
    <div className="space-y-4">
      {fields.map((field) => {
        const label = lang === 'ar' ? field.labelAr : field.labelEn;
        const error = errors?.[field.id];

        return (
          <div key={field.id}>
            <label className="block text-xs font-bold text-ink-700 mb-1">
              {label}
              {field.required && <span className="text-red-500 ms-1">*</span>}
            </label>

            {field.type === 'radio-group' && (
              <RadioGroup
                field={field}
                value={values[field.id] ?? ''}
                onChange={(v) => onChange(field.id, v)}
                lang={lang}
              />
            )}

            {field.type === 'select' && (
              <SelectField
                field={field}
                value={values[field.id] ?? ''}
                onChange={(v) => onChange(field.id, v)}
                lang={lang}
              />
            )}

            {(field.type === 'text' || field.type === 'tel' || field.type === 'email' || field.type === 'date') && (
              <TextField
                field={field}
                value={values[field.id] ?? ''}
                onChange={(v) => onChange(field.id, v)}
                lang={lang}
              />
            )}

            {field.type === 'textarea' && (
              <TextareaField
                field={field}
                value={values[field.id] ?? ''}
                onChange={(v) => onChange(field.id, v)}
                lang={lang}
              />
            )}

            {error && (
              <p className="text-red-500 text-[10px] mt-0.5">{error}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
