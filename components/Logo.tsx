'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface LogoProps {
  variant?: 'full' | 'compact' | 'light' | 'footer';
  className?: string;
}

export default function Logo({ className = '' }: LogoProps) {
  const { lang } = useLanguage();

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Eye & Pyramid Geometric Emblem */}
      <div className="relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#0C2340] via-[#163660] to-[#0C2340] p-1.5 shadow-md shadow-slate-900/10 border border-teal-500/30 flex items-center justify-center group overflow-hidden">
        {/* Subtle Ambient Gold Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/10 via-teal-400/15 to-transparent pointer-events-none" />
        
        {/* Vector SVG Emblem: Eye Contour + Pyramid Apex + Laser Pupil */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full text-white"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle Pyramid Base Triangular Facets in Gold */}
          <path
            d="M50 16 L88 78 L12 78 Z"
            stroke="#D4AF37"
            strokeWidth="3.5"
            strokeLinejoin="round"
            className="opacity-70 group-hover:opacity-95 transition-opacity"
          />
          <path
            d="M50 16 L50 78"
            stroke="#D4AF37"
            strokeWidth="2"
            strokeDasharray="2 3"
            className="opacity-60"
          />
          
          {/* Dynamic Eye Ellipse Contour in Cyan */}
          <path
            d="M10 50 C26 22, 74 22, 90 50 C74 78, 26 78, 10 50 Z"
            stroke="#00A896"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(0,168,150,0.6)]"
          />
          
          {/* Inner Iris & Pupil with Laser Sparkle */}
          <circle
            cx="50"
            cy="50"
            r="15"
            fill="#0C2340"
            stroke="#00C4B4"
            strokeWidth="3"
          />
          <circle
            cx="50"
            cy="50"
            r="6.5"
            fill="#D4AF37"
            className="animate-pulse"
          />
          <circle cx="53" cy="47" r="2.5" fill="#FFFFFF" />
          
          {/* Precision Laser Crosshairs */}
          <line x1="50" y1="28" x2="50" y2="34" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="50" y1="66" x2="50" y2="72" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="28" y1="50" x2="34" y2="50" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="66" y1="50" x2="72" y2="50" stroke="#00E5FF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Typography Block */}
      <div className="flex flex-col">
        {lang === 'ar' ? (
          <>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#0C2340] dark:text-white leading-tight">
              مستشفى <span className="text-teal-600 font-black">كنوز الأهرام</span>
            </span>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 flex items-center gap-1">
              <span>لطب وجراحة العيون</span>
              <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              <span className="text-[10px] text-amber-700 font-medium">بنغازي</span>
            </span>
          </>
        ) : (
          <>
            <span className="text-sm sm:text-base font-extrabold tracking-tight text-[#0C2340] dark:text-white leading-tight">
              KONOOZ <span className="text-teal-600 font-black">AL-AHRAM</span>
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 flex items-center gap-1">
              <span>Eye & Surgery Hospital</span>
              <span className="w-1 h-1 rounded-full bg-amber-500 inline-block" />
              <span className="text-[10px] text-amber-700 font-medium">Benghazi</span>
            </span>
          </>
        )}
      </div>
    </div>
  );
}
