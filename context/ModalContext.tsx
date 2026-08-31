'use client';

import React, { createContext, useContext, useState } from 'react';
import type { Specialty } from '@/data/hospitalData';

interface ModalContextType {
  // Booking modal
  isBookingModalOpen: boolean;
  bookingDoctorId: string | null;
  bookingSpecialtyId: string | null;
  openBookingModal: (specialtyId?: string, doctorId?: string) => void;
  closeBookingModal: () => void;

  // Specialty details modal
  isSpecialtyModalOpen: boolean;
  activeSpecialty: Specialty | null;
  openSpecialtyModal: (specialty: Specialty) => void;
  closeSpecialtyModal: () => void;

  // Vision Test Modal
  isVisionTestModalOpen: boolean;
  openVisionTestModal: () => void;
  closeVisionTestModal: () => void;

  // Live Patient Queue Tracker Modal
  isQueueModalOpen: boolean;
  openQueueModal: () => void;
  closeQueueModal: () => void;

  // Surgical Cost & Insurance Calculator Modal
  isCostCalculatorModalOpen: boolean;
  openCostCalculatorModal: () => void;
  closeCostCalculatorModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: React.ReactNode }) {
  // Booking modal
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingDoctorId, setBookingDoctorId] = useState<string | null>(null);
  const [bookingSpecialtyId, setBookingSpecialtyId] = useState<string | null>(null);

  // Specialty modal
  const [isSpecialtyModalOpen, setIsSpecialtyModalOpen] = useState(false);
  const [activeSpecialty, setActiveSpecialty] = useState<Specialty | null>(null);

  // Simple modals
  const [isVisionTestModalOpen, setIsVisionTestModalOpen] = useState(false);
  const [isQueueModalOpen, setIsQueueModalOpen] = useState(false);
  const [isCostCalculatorModalOpen, setIsCostCalculatorModalOpen] = useState(false);

  // Booking modal — accepts specialtyId directly (no doctor lookup)
  const openBookingModal = (specialtyId?: string, doctorId?: string) => {
    if (specialtyId) setBookingSpecialtyId(specialtyId);
    if (doctorId) setBookingDoctorId(doctorId);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingDoctorId(null);
    setBookingSpecialtyId(null);
  };

  // Specialty modal
  const openSpecialtyModal = (specialty: Specialty) => {
    setActiveSpecialty(specialty);
    setIsSpecialtyModalOpen(true);
  };

  const closeSpecialtyModal = () => {
    setIsSpecialtyModalOpen(false);
    setActiveSpecialty(null);
  };

  // Simple modals
  const openVisionTestModal = () => setIsVisionTestModalOpen(true);
  const closeVisionTestModal = () => setIsVisionTestModalOpen(false);
  const openQueueModal = () => setIsQueueModalOpen(true);
  const closeQueueModal = () => setIsQueueModalOpen(false);
  const openCostCalculatorModal = () => setIsCostCalculatorModalOpen(true);
  const closeCostCalculatorModal = () => setIsCostCalculatorModalOpen(false);

  return (
    <ModalContext.Provider
      value={{
        isBookingModalOpen,
        bookingDoctorId,
        bookingSpecialtyId,
        openBookingModal,
        closeBookingModal,
        isSpecialtyModalOpen,
        activeSpecialty,
        openSpecialtyModal,
        closeSpecialtyModal,
        isVisionTestModalOpen,
        openVisionTestModal,
        closeVisionTestModal,
        isQueueModalOpen,
        openQueueModal,
        closeQueueModal,
        isCostCalculatorModalOpen,
        openCostCalculatorModal,
        closeCostCalculatorModal,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export function useModals() {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModals must be used within a ModalProvider');
  }
  return context;
}
