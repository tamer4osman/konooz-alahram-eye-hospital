'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from './Logo';
import AccessibilityToolbar from './AccessibilityToolbar';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';
import { Phone, Calendar, Menu, X, Clock, Eye, ArrowUpRight, Calculator, User } from 'lucide-react';

export default function Navbar() {
  const {
    lang, setLang, t, openBookingModal, openVisionTestModal, setActiveView, openQueueModal, openCostCalculatorModal
  } = useLanguage();
  const { currentPatient, openPatientPortal, serverUser } = usePatientAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 20);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#home', labelAr: 'الرئيسية', labelEn: 'Home' }, { href: '#specialties', labelAr: 'التخصصات الجراحية', labelEn: 'Specialties' }, { href: '#doctors', labelAr: 'نخبة الاستشاريين الزائرين', labelEn: 'Visiting Consultants' }, { href: '#technology', labelAr: 'الأجهزة والتقنيات', labelEn: 'Tech & Diagnostics' }, { href: '#vision-screener', labelAr: 'فحص نظرك الذاتي', labelEn: 'Vision Screener' }, { href: '#spitar', labelAr: 'حجز سبيتار', labelEn: 'Spitar Booking' }, { href: '#contact', labelAr: 'العنوان والتواصل', labelEn: 'Contact' }, ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all">
      {/* Top Utility Announcement Strip */}
      <div className="bg-pine-950 text-pine-100 border-b border-white/5 text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">

          {/* Left: Emergency hotlines & live consultant status */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-0.5 scrollbar-none">
            {/* Live Indicator — the single animated status dot on the page */}
            <div className="flex items-center gap-1.5 text-pine-200 text-[11px] font-semibold whitespace-nowrap">
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brass-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brass-400" />
              </span>
              <span>{t('نخبة استشاريي مصر هذا الشهر متواجدون للحجز', 'Visiting Egyptian Consultants Available') }</span>
            </div>

            {/* Quick Emergency Phone */}
            <div className="hidden sm:flex items-center gap-2 text-pine-200 text-[11px]">
              <span className="text-pine-300">{t('طوارئ وحجز:', 'Emergency & Booking:') }</span>
              <a
                href={`tel:${HOSPITAL_CONTACTS.primaryWhatsApp}`}
                className="font-bold text-brass-300 hover:text-brass-400 transition-colors flex items-center gap-1"
                dir="ltr"
              >
                <Phone className="w-3 h-3" />
                {HOSPITAL_CONTACTS.primaryWhatsAppDisplay}
              </a>
              <span className="text-pine-700">|</span>
              <a
                href={`tel:${HOSPITAL_CONTACTS.secondaryWhatsApp}`}
                className="font-bold text-brass-300 hover:text-brass-400 transition-colors hidden md:inline"
                dir="ltr"
              >
                {HOSPITAL_CONTACTS.phoneNumbers[1].display}
              </a>
            </div>
          </div>

          {/* Right: Quick Tools, Accessibility Toolbar & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 ms-auto">
            {/* Secondary quick tools (compact chips) */}
            <div className="hidden lg:flex items-center gap-1">
              <button
                id="btn-nav-patient-portal"
                onClick={() => openPatientPortal('profile')}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 ring-1 ring-white/15 text-pine-100 hover:text-white text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
                title={t('بوابة المريض والملف الطبي وتنبيهات الواتساب', 'Patient Portal & WhatsApp Alerts')}
              >
                <User className="w-3 h-3" />
                <span className="hidden xl:inline">{t('بوابة المريض', 'Patient Portal')}</span>
              </button>

              <button
                id="btn-nav-queue"
                onClick={openQueueModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 ring-1 ring-white/15 text-pine-100 hover:text-white text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
                title={t('تتبع دورك المباشر في العيادة أو العمليات', 'Live Patient Queue Tracker')}
              >
                <Clock className="w-3 h-3" />
                <span className="hidden xl:inline">{t('تتبع دورك', 'Live Queue')}</span>
              </button>

              <button
                id="btn-nav-calculator"
                onClick={openCostCalculatorModal}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 ring-1 ring-white/15 text-pine-100 hover:text-white text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
                title={t('حاسبة تكاليف العمليات والتغطية التأمينية', 'Surgical Cost & Insurance Estimator')}
              >
                <Calculator className="w-3 h-3" />
                <span className="hidden xl:inline">{t('حاسبة العمليات', 'Cost Estimator')}</span>
              </button>

              <button
                id="btn-nav-dashboard"
                onClick={() => {
                  if (serverUser?.role === 'ADMIN') {
                    setActiveView('dashboard');
                  } else {
                    openPatientPortal('auth');
                  }
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 hover:bg-white/20 ring-1 ring-brass-400/40 text-pine-100 hover:text-white text-[11px] font-bold transition-colors cursor-pointer whitespace-nowrap"
                title={t('لوحة التحكم — للطاقم المصرح لهم فقط', 'Operations Hub — authorized staff only')}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brass-400 inline-block" aria-hidden="true" />
                <span className="hidden xl:inline">{t('إدارة المستشفى', 'Operations Hub')}</span>
              </button>
            </div>

            {/* Vision Accessibility Controls */}
            <AccessibilityToolbar />

            {/* Language Switcher */}
            <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
              <button
                id="btn-lang-ar"
                onClick={() => setLang('ar') }
                className={`px-2.5 py-1 min-h-[26px] inline-flex items-center rounded-md text-[11px] font-bold transition-all ${
                  lang === 'ar'
                    ? 'bg-bone-50 text-pine-900'
                    : 'text-pine-200 hover:text-white'
                }`}
              >
                العربية
              </button>
              <button
                id="btn-lang-en"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 min-h-[26px] inline-flex items-center rounded-md text-[11px] font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-bone-50 text-pine-900'
                    : 'text-pine-200 hover:text-white'
                }`}
              >
                English
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Main Navigation Bar */}
      <div
        className={`w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-bone-50/95 backdrop-blur-md shadow-[0_4px_24px_-8px_rgba(8,33,28,0.18)] border-b border-pine-900/10 py-2.5'
            : 'bg-bone-50 border-b border-pine-900/5 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Hospital Logo */}
          <Link href="#home" className="flex-shrink-0" aria-label="Konooz Al-Ahram Eye Hospital">
            <Logo variant="compact" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-3 text-[13px] font-semibold text-ink-700 whitespace-nowrap min-w-0 overflow-x-auto scrollbar-none" aria-label="Primary">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-pine-800 transition-colors py-1 relative group"
              >
                {t(link.labelAr, link.labelEn)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brass-400 transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Primary Booking CTA */}
          <div className="hidden lg:flex items-center flex-shrink-0">
            {/* Primary Booking Button */}
            <button
              id="btn-nav-book-appointment"
              onClick={() => openBookingModal()}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-bone-50 bg-pine-900 hover:bg-pine-800 rounded-lg shadow-sm shadow-pine-950/20 transition-all cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <Calendar className="w-4 h-4 text-brass-300" />
              <span>{t('حجز فوري ومباشر', 'Instant Direct Booking')}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="btn-mobile-book-header"
              onClick={() => openBookingModal()}
              className="flex items-center gap-1 px-2 py-2 text-[11px] font-bold text-bone-50 bg-pine-900 rounded-lg shadow-sm cursor-pointer whitespace-nowrap flex-shrink-0"
            >
              <Calendar className="w-3.5 h-3.5 text-brass-300" />
              <span className="hidden min-[420px]:inline">{t('حجز فوري ومباشر', 'Instant Booking')}</span>
            </button>

            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-ink-700 hover:bg-pine-100 transition-colors"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-bone-50 border-b border-pine-900/10 shadow-xl px-4 pt-3 pb-6">
          <nav className="flex flex-col mb-4 divide-y divide-pine-900/5" aria-label="Mobile">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-1 py-3 text-sm font-semibold text-ink-900 hover:text-pine-800 transition-colors flex items-center justify-between"
              >
                <span>{t(link.labelAr, link.labelEn)}</span>
                <ArrowUpRight className="w-4 h-4 text-ink-300" />
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-pine-900/10 flex flex-col gap-2.5">
            {/* Patient Portal in Mobile Menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openPatientPortal('profile');
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-pine-50 border border-pine-900/15 text-ink-900 rounded-lg text-sm font-bold flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-pine-800 text-bone-50 flex items-center justify-center text-xs font-extrabold">
                  {currentPatient ? currentPatient.fullNameAr.slice(0, 1) : <User className="w-3.5 h-3.5" />}
                </div>
                <span>{currentPatient ? `${t('ملفي الطبي:', 'My Profile:')} ${currentPatient.fullNameAr}` : t('بوابة المريض وتسجيل الدخول', 'Patient Portal & Login')}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-pine-100 text-pine-800 font-bold">
                {t('تنبيهات الواتساب', 'WhatsApp')}
              </span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (serverUser?.role === 'ADMIN') {
                  setActiveView('dashboard');
                } else {
                  openPatientPortal('auth');
                }
              }}
              className="w-full py-2.5 px-4 bg-bone-100 hover:bg-bone-200 border border-pine-900/15 text-ink-900 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-brass-400 inline-block" aria-hidden="true" />
              <span>{t('لوحة التحكم وإدارة العمليات (Bahmni Hub)', 'Hospital Operations Command Hub')}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openQueueModal();
                }}
                className="py-2.5 px-3 bg-white border border-pine-900/15 text-ink-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-pine-50 transition-colors"
              >
                <Clock className="w-4 h-4 text-pine-700" />
                <span>{t('تتبع دورك المباشر', 'Live Queue')}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCostCalculatorModal();
                }}
                className="py-2.5 px-3 bg-white border border-pine-900/15 text-ink-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-pine-50 transition-colors"
              >
                <Calculator className="w-4 h-4 text-pine-700" />
                <span>{t('حاسبة العمليات', 'Cost Estimator')}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openVisionTestModal();
              }}
              className="w-full py-2.5 px-4 bg-bone-100 hover:bg-bone-200 border border-pine-900/15 text-ink-900 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Eye className="w-4 h-4 text-pine-700" />
              <span>{t('اختبار فحص النظر الذاتي', 'Self-Vision Screener')}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openBookingModal();
              }}
              className="w-full py-3 px-4 bg-pine-900 hover:bg-pine-800 text-bone-50 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Calendar className="w-4 h-4 text-brass-300" />
              <span>{t('احجز موعد كشف بالمستشفى', 'Book Hospital Appointment')}</span>
            </button>

            <a
              href={`https://wa.me/${HOSPITAL_CONTACTS.primaryWhatsApp.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-white border border-pine-900/15 text-pine-900 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-pine-50 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>{t(`تواصل فوري واتساب: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`, `WhatsApp Chat: ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`)}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
