'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Lock } from 'lucide-react';
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
  const { isPatientPortalOpen, serverUser, openPatientPortal } = usePatientAuth();

  if (activeView === 'dashboard') {
    if (serverUser?.role !== 'STAFF') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-950 text-rose-400 mx-auto flex items-center justify-center border border-rose-900">
              <Lock className="w-7 h-7" aria-hidden="true" />
            </div>
            <h1 className="text-lg font-extrabold text-white">
              لوحة التحكم للطاقم المصرح لهم فقط
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed" dir="ltr">
              The operations dashboard requires a staff account. Patients can sign in from the patient portal.
            </p>
            <button
              type="button"
              onClick={() => openPatientPortal('auth')}
              className="px-5 py-2.5 bg-pine-600 hover:bg-pine-500 text-white font-extrabold text-xs rounded-xl transition-colors cursor-pointer"
            >
              تسجيل الدخول كطاقم / Staff Sign In
            </button>
          </div>
        </div>
      );
    }
    return (
      <>
        <HospitalDashboard />
        {isPatientPortalOpen && <PatientPortalModal />}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bone-50 text-ink-900 overflow-x-clip selection:bg-pine-900 selection:text-bone-50">
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
