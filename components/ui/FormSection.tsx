import React from 'react';

export interface FormSectionProps {
  number: number;
  title: string;
  badge?: string;
  children: React.ReactNode;
}

export default function FormSection({
  number,
  title,
  badge,
  children,
}: FormSectionProps) {
  return (
    <div className="bg-bone-50/90 border border-pine-200/90 rounded-2xl p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center justify-between border-b border-pine-200/80 pb-2.5">
        <h3 className="text-xs sm:text-sm font-extrabold text-pine-950 flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-pine-700 text-white flex items-center justify-center text-xs font-extrabold shadow-2xs">
            {number}
          </div>
          <span>{title}</span>
        </h3>
        {badge && (
          <span className="text-[10px] font-bold text-pine-800 bg-pine-100/70 border border-brass-300/80 px-2.5 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
