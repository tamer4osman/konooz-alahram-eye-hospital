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
  const { currentPatient, openPatientPortal } = usePatientAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#home', labelAr: 'الرئيسية', labelEn: 'Home' }, { href: '#specialties', labelAr: 'التخصصات الجراحية', labelEn: 'Specialties' }, { href: '#doctors', labelAr: 'نخبة الاستشاريين الزائرين', labelEn: 'Visiting Consultants' }, { href: '#technology', labelAr: 'الأجهزة والتقنيات', labelEn: 'Tech & Diagnostics' }, { href: '#vision-screener', labelAr: 'فحص نظرك الذاتي', labelEn: 'Vision Screener' }, { href: '#spitar', labelAr: 'حجز سبيتار', labelEn: 'Spitar Booking' }, { href: '#contact', labelAr: 'العنوان والتواصل', labelEn: 'Contact' }, ];

  return (
    <header className="sticky top-0 z-50 w-full transition-all">
      {/* Top Utility Announcement Strip */}
      <div className="bg-[#0C2340] text-slate-200 border-b border-slate-800 text-xs py-1.5 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          
          {/* Left: Emergency hotlines & live consultant status */}
          <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto py-0.5 scrollbar-none">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 bg-teal-950/80 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/40 text-[11px] font-semibold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping inline-block" />
              <span>{t('نخبة استشاريي مصر هذا الشهر متواجدون للحجز', 'Visiting Egyptian Consultants Available') }</span>
            </div>

            {/* Quick Emergency Phone */}
            <div className="hidden sm:flex items-center gap-2 text-slate-300 text-[11px]">
              <span className="text-slate-400">{t('طوارئ وحجز:', 'Emergency & Booking:') }</span>
              <a
                href={`tel:${HOSPITAL_CONTACTS.primaryWhatsApp}`}
                className="font-bold text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                dir="ltr"
              >
                <Phone className="w-3 h-3" />
                {HOSPITAL_CONTACTS.primaryWhatsAppDisplay}
              </a>
              <span className="text-slate-600">|</span>
              <a
                href={`tel:${HOSPITAL_CONTACTS.secondaryWhatsApp}`}
                className="font-bold text-amber-400 hover:text-amber-300 transition-colors hidden md:inline"
                dir="ltr"
              >
                {HOSPITAL_CONTACTS.phoneNumbers[1].display}
              </a>
            </div>
          </div>

          {/* Right: Accessibility Toolbar & Language Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 ms-auto">
            {/* Vision Accessibility Controls */}
            <AccessibilityToolbar />

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800/80 rounded-lg p-0.5 border border-slate-700/60">
              <button
                id="btn-lang-ar"
                onClick={() => setLang('ar') }
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  lang === 'ar'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                العربية
              </button>
              <button
                id="btn-lang-en"
                onClick={() => setLang('en')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                  lang === 'en'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
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
        className={`w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-md shadow-slate-900/5 border-b border-slate-200/80 py-2.5'
            : 'bg-white border-b border-slate-100 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Hospital Logo */}
          <Link href="#home" className="flex-shrink-0" aria-label="Konooz Al-Ahram Eye Hospital">
            <Logo />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-5 text-sm font-semibold text-slate-700">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="hover:text-teal-600 transition-colors py-1 relative group"
              >
                {t(link.labelAr, link.labelEn)}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all duration-200 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Patient Portal & Profile Button */}
            <button
              id="btn-nav-patient-portal"
              onClick={() => openPatientPortal('profile')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title={t('بوابة المريض والملف الطبي وتنبيهات الواتساب', 'Patient Portal & WhatsApp Alerts')}
            >
              <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-black">
                {currentPatient ? currentPatient.fullNameAr.slice(0, 1) : <User className="w-3 h-3" />}
              </div>
              <span className="max-w-[110px] truncate">
                {currentPatient ? currentPatient.fullNameAr.split(' ')[0] : t('بوابة المريض', 'Patient Portal')}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            </button>

            {/* Live Queue Tracker */}
            <button
              id="btn-nav-queue"
              onClick={openQueueModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors cursor-pointer"
              title={t('تتبع دورك المباشر في العيادة أو العمليات', 'Live Patient Queue Tracker')}
            >
              <Clock className="w-4 h-4 text-teal-600 animate-pulse" />
              <span>{t('تتبع دورك', 'Live Queue')}</span>
            </button>

            {/* Surgical Cost & Insurance Calculator */}
            <button
              id="btn-nav-calculator"
              onClick={openCostCalculatorModal}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors cursor-pointer"
              title={t('حاسبة تكاليف العمليات والتغطية التأمينية', 'Surgical Cost & Insurance Estimator')}
            >
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span>{t('حاسبة العمليات', 'Cost Estimator')}</span>
            </button>

            {/* Dashboard Command Hub Button */}
            <button
              id="btn-nav-dashboard"
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all shadow-xs cursor-pointer group"
              title={t('لوحة التحكم وإدارة العمليات الطبية (Bahmni Hub)', 'Hospital Operations Command Hub')}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
              </span>
              <span>{t('إدارة المستشفى', 'Operations Hub')}</span>
            </button>

            {/* Primary Booking Modal Button */}
            <button
              id="btn-nav-book-appointment"
              onClick={() => openBookingModal()}
              className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-extrabold text-white bg-gradient-to-r from-[#0C2340] to-[#163660] hover:from-[#163660] hover:to-teal-800 rounded-xl shadow-md shadow-slate-900/10 border border-teal-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-teal-300" />
              <span>{t('حجز فوري ومباشر', 'Instant Direct Booking')}</span>
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              id="btn-mobile-book-header"
              onClick={() => openBookingModal()}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-[#0C2340] rounded-lg shadow-sm cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-teal-300" />
              <span>{t('حجز فوري ومباشر', 'Instant Booking')}</span>
            </button>

            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 shadow-xl px-4 pt-3 pb-6 animate-fadeIn">
          <nav className="flex flex-col gap-2 mb-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-teal-600 transition-colors flex items-center justify-between"
              >
                <span>{t(link.labelAr, link.labelEn)}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {/* Patient Portal in Mobile Menu */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openPatientPortal('profile');
              }}
              className="w-full py-2.5 px-4 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-900 rounded-xl text-sm font-bold flex items-center justify-between shadow-xs"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-black">
                  {currentPatient ? currentPatient.fullNameAr.slice(0, 1) : <User className="w-3.5 h-3.5" />}
                </div>
                <span>{currentPatient ? `${t('ملفي الطبي:', 'My Profile:')} ${currentPatient.fullNameAr}` : t('بوابة المريض وتسجيل الدخول', 'Patient Portal & Login')}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                {t('تنبيهات الواتساب', 'WhatsApp')}
              </span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setActiveView('dashboard');
              }}
              className="w-full py-2.5 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
            >
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping inline-block" />
              <span>{t('لوحة التحكم وإدارة العمليات (Bahmni Hub)', 'Hospital Operations Command Hub')}</span>
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openQueueModal();
                }}
                className="py-2.5 px-3 bg-teal-50 border border-teal-200 text-teal-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Clock className="w-4 h-4 text-teal-600" />
                <span>{t('تتبع دورك المباشر', 'Live Queue')}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  openCostCalculatorModal();
                }}
                className="py-2.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Calculator className="w-4 h-4 text-emerald-600" />
                <span>{t('حاسبة العمليات', 'Cost Estimator')}</span>
              </button>
            </div>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openVisionTestModal();
              }}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
            >
              <Eye className="w-4 h-4 text-teal-600" />
              <span>{t('اختبار فحص النظر الذاتي', 'Self-Vision Screener')}</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openBookingModal();
              }}
              className="w-full py-3 px-4 bg-[#0C2340] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <Calendar className="w-4 h-4 text-teal-300" />
              <span>{t('احجز موعد كشف بالمستشفى', 'Book Hospital Appointment')}</span>
            </button>

            <a
              href={`https://wa.me/${HOSPITAL_CONTACTS.primaryWhatsApp.replace('+', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2"
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
