'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type FontSize = 'sm' | 'base' | 'lg' | 'xl';

interface AccessibilityContextType {
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  highContrast: boolean;
  setHighContrast: (val: boolean | ((prev: boolean) => boolean)) => void;
  toggleHighContrast: () => void;
  readingRuler: boolean;
  toggleReadingRuler: () => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [readingRuler, setReadingRuler] = useState<boolean>(false);
  const [rulerY, setRulerY] = useState<number>(200);

  const increaseFontSize = () => {
    setFontSize((prev) => {
      if (prev === 'sm') return 'base';
      if (prev === 'base') return 'lg';
      if (prev === 'lg') return 'xl';
      return 'xl';
    });
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => {
      if (prev === 'xl') return 'lg';
      if (prev === 'lg') return 'base';
      if (prev === 'base') return 'sm';
      return 'sm';
    });
  };

  const resetFontSize = () => setFontSize('base');
  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const toggleReadingRuler = () => setReadingRuler((prev) => !prev);

  useEffect(() => {
    if (!readingRuler) return;
    const handleMouseMove = (e: MouseEvent) => {
      setRulerY(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [readingRuler]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (highContrast) {
        document.documentElement.classList.add('high-contrast');
      } else {
        document.documentElement.classList.remove('high-contrast');
      }
    }
  }, [highContrast]);

  const fontSizeClass = {
    sm: 'text-[14px]',
    base: 'text-[16px]',
    lg: 'text-[18px]',
    xl: 'text-[20px]',
  }[fontSize];

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        increaseFontSize,
        decreaseFontSize,
        resetFontSize,
        highContrast,
        setHighContrast,
        toggleHighContrast,
        readingRuler,
        toggleReadingRuler,
      }}
    >
      <div className={`${fontSizeClass} min-h-screen transition-all duration-200`}>
        {readingRuler && (
          <div
            className="reading-guide-line"
            style={{ top: `${rulerY}px` }}
            aria-hidden="true"
          />
        )}
        {children}
      </div>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}
