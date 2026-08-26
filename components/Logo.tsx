'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';
import { tenantConfig } from '@/config/tenant';

interface LogoProps {
  variant?: 'full' | 'compact' | 'light' | 'footer';
  className?: string;
}

export default function Logo({ className = '', variant = 'full' }: LogoProps) {
  const { lang } = useLanguage();
  const compact = variant === 'compact';
  const { identity, contacts } = tenantConfig;

  const nameLine = lang === 'ar' ? identity.shortNameAr : identity.shortNameEn;
  const typeLine = lang === 'ar' ? identity.orgTypeAr : identity.orgTypeEn;
  const cityLine = lang === 'ar' ? contacts.cityAr : contacts.cityEn;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Logo emblem — image if configured, else default SVG */}
      <div className="relative flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-pine-900 p-1.5 shadow-md shadow-pine-950/20 flex items-center justify-center group overflow-hidden">
        {identity.logoImage ? (
          <Image
            src={identity.logoImage}
            alt={nameLine}
            width={40}
            height={40}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M50 16 L88 78 L12 78 Z"
              stroke="#E8A33D"
              strokeWidth="3.5"
              strokeLinejoin="round"
              className="opacity-70 group-hover:opacity-100 transition-opacity duration-300"
            />
            <path
              d="M50 16 L50 78"
              stroke="#E8A33D"
              strokeWidth="2"
              strokeDasharray="2 3"
              className="opacity-60"
            />
            <path
              d="M10 50 C26 22, 74 22, 90 50 C74 78, 26 78, 10 50 Z"
              stroke="#C9DBD5"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="15" fill="#08211C" stroke="#A3C2B9" strokeWidth="3" />
            <circle cx="50" cy="50" r="6.5" fill="#E8A33D" />
            <circle cx="53" cy="47" r="2.5" fill="#FAF8F4" />
          </svg>
        )}
      </div>

      {/* Typography Block */}
      <div className="flex flex-col">
        <span className="text-sm sm:text-base font-bold tracking-tight text-pine-900 leading-tight">
          {nameLine}
        </span>
        {!compact && (
          <span className="text-[11px] sm:text-xs font-medium text-ink-500 flex items-center gap-1">
            <span>{typeLine}</span>
            <span className="w-1 h-1 rounded-full bg-brass-400 inline-block" />
            <span className="text-[10px] text-brass-600 font-semibold">{cityLine}</span>
          </span>
        )}
      </div>
    </div>
  );
}
