'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';
import { PatientAuthProvider, usePatientAuth } from '@/context/PatientAuthContext';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ServicesGrid from '@/components/ServicesGrid';
import DoctorsSection from '@/components/DoctorsSection';
import TechnologySection from '@/components/TechnologySection';
import VisionTestInteractive from '@/components/VisionTestInteractive';
import TestimonialsAndStats from '@/components/TestimonialsAndStats';
import LocationAndContact from '@/components/LocationAndContact';
import FloatingWidgets from '@/components/FloatingWidgets';
import Footer from '@/components/Footer';

// Heavy / rarely-used surfaces are code-split and only fetched when first shown.
// Each modal additionally renders conditionally, so its chunk downloads on
// first open instead of shipping with the landing page.
const HospitalDashboard = dynamic(() => import('@/components/dashboard/HospitalDashboard'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-sm font-bold text-slate-300 animate-pulse">…</p>
    </div>
  )
});
const SpecialtyDetailModal = dynamic(() => import('@/components/SpecialtyDetailModal'), { ssr: false });
const BookingModal = dynamic(() => import('@/components/BookingModal'), { ssr: false });
const LiveQueueTrackerModal = dynamic(() => import('@/components/LiveQueueTrackerModal'), { ssr: false });
const SurgicalCostCalculatorModal = dynamic(() => import('@/components/SurgicalCostCalculatorModal'), { ssr: false });
const PatientPortalModal = dynamic(() => import('@/components/PatientPortalModal'), { ssr: false });

function MainAppContent() {
  const {
    activeView,
    isSpecialtyModalOpen,
    isBookingModalOpen,
    isQueueModalOpen,
    closeQueueModal,
    isCostCalculatorModalOpen,
    closeCostCalculatorModal,
    openBookingModal
  } = useLanguage();
  const { isPatientPortalOpen } = usePatientAuth();

  if (activeView === 'dashboard') {
    return (
      <>
        <HospitalDashboard />
        {isPatientPortalOpen && <PatientPortalModal />}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-teal-500 selection:text-white">
      {/* Top Header & Sticky Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main className="flex-grow">
        {/* Hero Section with Split-Screen & Quick Booking Card */}
        <Hero />

        {/* 6 Core Clinical Specialties Grid */}
        <ServicesGrid />

        {/* Visiting Consultants & Medical Team */}
        <DoctorsSection />

        {/* State-of-the-Art Technology & Diagnostics */}
        <TechnologySection />

        {/* Interactive Vision Acuity & Amsler Grid Self-Screener */}
        <VisionTestInteractive />

        {/* Testimonials, Trust Stats & Visual Clarity Simulator */}
        <TestimonialsAndStats />

        {/* Location, Spitar Booking, Phone Directory & FAQ */}
        <LocationAndContact />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals — mounted (and fetched) only while open */}
      {isSpecialtyModalOpen && <SpecialtyDetailModal />}
      {isBookingModalOpen && <BookingModal />}
      {isQueueModalOpen && <LiveQueueTrackerModal isOpen={isQueueModalOpen} onClose={closeQueueModal} />}
      {isCostCalculatorModalOpen && (
        <SurgicalCostCalculatorModal
          isOpen={isCostCalculatorModalOpen}
          onClose={closeCostCalculatorModal}
          onOpenBookingModal={() => openBookingModal()}
        />
      )}
      {isPatientPortalOpen && <PatientPortalModal />}

      {/* Floating Action Buttons */}
      <FloatingWidgets />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <PatientAuthProvider>
        <MainAppContent />
      </PatientAuthProvider>
    </LanguageProvider>
  );
}
