'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { SPECIALTIES } from '@/data/hospitalData';

interface ModalTriggerProps {
  action: 'booking' | 'specialty' | 'visionTest';
  className?: string;
  children: React.ReactNode;
  specialtyId?: string;
  doctorId?: string;
  id?: string;
}

export default function ModalTrigger({
  action,
  className,
  children,
  specialtyId,
  doctorId,
  id,
}: ModalTriggerProps) {
  const { openBookingModal, openSpecialtyModal, openVisionTestModal } =
    useLanguage();

  const handleClick = () => {
    if (action === 'booking') {
      openBookingModal(specialtyId, doctorId);
      return;
    }
    if (action === 'specialty') {
      const spec = SPECIALTIES.find((s) => s.id === specialtyId);
      if (spec) openSpecialtyModal(spec);
      return;
    }
    openVisionTestModal();
  };

  return (
    <button type="button" id={id} className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
