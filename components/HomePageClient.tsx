'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import { tenantConfig } from '@/config/tenant';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { ReactNode } from 'react';

// Below-the-fold components: lazy-loaded to reduce initial bundle
const Hero = dynamic(() => import('@/components/Hero'), { ssr: false, loading: () => <div className="min-h-[60vh] bg-bone-50" /> });
const DoctorsSection = dynamic(() => import('@/components/DoctorsSection'), { ssr: false });
const VisionTestInteractive = dynamic(() => import('@/components/VisionTestInteractive'), { ssr: false });
const FloatingWidgets = dynamic(() => import('@/components/FloatingWidgets'), { ssr: false });

const SpecialtyDetailModal = dynamic(() => import('@/components/SpecialtyDetailModal'), { ssr: false });
const BookingModal = dynamic(() => import('@/components/BookingModal'), { ssr: false });
const SurgicalCostCalculatorModal = dynamic(() => import('@/components/SurgicalCostCalculatorModal'), { ssr: false });

interface HomePageClientProps {
  servicesSlot: ReactNode;
  technologiesSlot: ReactNode;
  testimonialsSlot: ReactNode;
  faqsSlot: ReactNode;
}

export default function HomePageClient({ servicesSlot, technologiesSlot, testimonialsSlot, faqsSlot }: HomePageClientProps) {
  const {
    isSpecialtyModalOpen,
    isBookingModalOpen,
    isCostCalculatorModalOpen,
    closeCostCalculatorModal,
    openBookingModal
  } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-bone-50 text-ink-900 overflow-x-clip selection:bg-pine-900 selection:text-bone-50">
      {/* Top Header & Sticky Navigation */}
      <Navbar />

      {/* Main Content Sections */}
      <main id="main-content" className="flex-grow">
        {/* Hero Section with Split-Screen & Quick Booking Card */}
        <Hero />

        {/* 6 Core Clinical Specialties Grid */}
        {servicesSlot}

        {/* Visiting Consultants & Medical Team */}
        <DoctorsSection />

        {/* State-of-the-Art Technology & Diagnostics */}
        {tenantConfig.capabilities.showTechnologies !== false && technologiesSlot}

        {/* Interactive Vision Acuity & Amsler Grid Self-Screener */}
        {tenantConfig.capabilities.visionTest && <VisionTestInteractive />}

        {/* Testimonials, Trust Stats & Visual Clarity Simulator — server-provided content */}
        {tenantConfig.capabilities.showTestimonials !== false && testimonialsSlot}

        {/* Location, Spitar Booking, Phone Directory & FAQ — server-provided content */}
        {faqsSlot}
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Modals — mounted (and fetched) only while open */}
      {isSpecialtyModalOpen && <SpecialtyDetailModal />}
      {isBookingModalOpen && <BookingModal />}
      {isCostCalculatorModalOpen && tenantConfig.capabilities.costCalculator && (
        <SurgicalCostCalculatorModal
          isOpen={isCostCalculatorModalOpen}
          onClose={closeCostCalculatorModal}
          onOpenBookingModal={() => openBookingModal()}
        />
      )}

      {/* Floating Action Buttons */}
      <FloatingWidgets />
    </div>
  );
}
