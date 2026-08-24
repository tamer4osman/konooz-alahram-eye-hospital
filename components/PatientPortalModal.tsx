'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { NEWSLETTER_TOPICS, NEWSLETTER_ISSUES } from '@/data/patientPortalData';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';
import Modal from '@/components/ui/Modal';
import { X, User, Calendar, Pill, Bell, Mail, Phone, ShieldCheck, CheckCircle2, AlertCircle, Sparkles, Send, Eye, Clock, Printer, FileText, Lock, LogOut, ChevronRight, Smartphone, Check, Bookmark } from 'lucide-react';

export default function PatientPortalModal() {
  const { lang, t, isRTL, openQueueModal, setActiveView } = useLanguage();
  const {
    currentPatient, createLocalProfile, logout, updateProfile, toggleNotificationPref, toggleNewsletterTopic, sendLiveNotificationSimulation, isPatientPortalOpen, closePatientPortal, activePortalTab, setActivePortalTab, openWhatsAppAlert, serverUser, isServerAuthenticated, loginWithServer, registerWithServer, logoutServer } = usePatientAuth();

  // Local form state for editing profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState({
    fullNameAr: '', phone: '', email: '', cityAr: '', insuranceProviderName: '', insurancePolicyNo: '', emergencyContactName: '', emergencyContactPhone: '', allergies: '' });

  // Create-profile form state (device-local profile; no passwords)
  const [createName, setCreateName] = useState('');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createCity, setCreateCity] = useState('بنغازي');
  const [createGender, setCreateGender] = useState<'male' | 'female'>('male');
  const [createError, setCreateError] = useState<string | null>(null);

  // Server account form state (email + password, httpOnly session)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Notification simulation state
  const [simulationSentMessage, setSimulationSentMessage] = useState<string | null>(null);
  const [activeNewsletterIssue, setActiveNewsletterIssue] = useState<string>(NEWSLETTER_ISSUES[0].id);

  const handleServerAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    setAuthBusy(true);
    const res = authMode === 'login'
      ? await loginWithServer(authEmail, authPassword)
      : await registerWithServer({ fullNameAr: authName, email: authEmail, password: authPassword, phone: authPhone || undefined });
    setAuthBusy(false);
    if (res.success) {
      setAuthSuccess(t(res.messageAr, res.messageEn));
      setAuthPassword('');
    } else {
      setAuthError(t(res.messageAr, res.messageEn));
    }
  };

  const handleServerLogout = async () => {
    await logoutServer();
    setAuthSuccess(t('تم تسجيل الخروج من الحساب السحابي', 'Signed out of the cloud account'));
  };

  if (!isPatientPortalOpen) return null;

  const startEdit = () => {
    if (!currentPatient) return;
    setEditForm({
      fullNameAr: currentPatient.fullNameAr, phone: currentPatient.phone, email: currentPatient.email, cityAr: currentPatient.cityAr, insuranceProviderName: currentPatient.insuranceProviderName, insurancePolicyNo: currentPatient.insurancePolicyNo, emergencyContactName: currentPatient.emergencyContact.name, emergencyContactPhone: currentPatient.emergencyContact.phone, allergies: currentPatient.allergiesAr.join(', ')
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;
    
    if (!editForm.email.trim() || !editForm.email.includes('@')) {
      alert(t('البريد الإلكتروني إلزامي لتأمين حسابك واستلام التقارير الطبية.', 'Email address is mandatory to secure your account and receive medical reports.'));
      return; }

    updateProfile({
      fullNameAr: editForm.fullNameAr, fullNameEn: editForm.fullNameAr, phone: editForm.phone, whatsappNumber: editForm.phone, email: editForm.email.trim(), cityAr: editForm.cityAr, insuranceProviderName: editForm.insuranceProviderName, insurancePolicyNo: editForm.insurancePolicyNo, emergencyContact: {
        ...currentPatient.emergencyContact, name: editForm.emergencyContactName, phone: editForm.emergencyContactPhone
      }, allergiesAr: editForm.allergies ? editForm.allergies.split(', ').map((s) => s.trim()) : []
    });
    setIsEditingProfile(false);
    setSimulationSentMessage(t('تم تحديث بيانات الملف الطبي بنجاح.', 'Medical profile records updated successfully.'));
    setTimeout(() => setSimulationSentMessage(null), 3500);
  };

  // Create Device-Local Profile Handler (no passwords — data stays on this device)
  const handleCreateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);

    const res = createLocalProfile({
      fullNameAr: createName,
      email: createEmail,
      phone: createPhone,
      cityAr: createCity,
      gender: createGender
    });

    if (res.success) {
      setActivePortalTab('profile');
      setSimulationSentMessage(lang === 'ar' ? res.messageAr! : res.messageEn!);
      setTimeout(() => setSimulationSentMessage(null), 4500);
    } else {
      setCreateError(lang === 'ar' ? (res.errorAr || 'تعذر إنشاء الملف.') : (res.errorEn || 'Could not create profile.'));
    }
  };

  // Remove Local Profile Handler
  const handleRemoveLocalProfile = () => {
    if (typeof window !== 'undefined' && !window.confirm(t('سيتم حذف ملفك المحفوظ على هذا الجهاز نهائياً. متابعة؟', 'This will permanently delete the profile saved on this device. Continue?'))) {
      return;
    }
    logout();
  };

  // WhatsApp draft helper: records locally and opens a pre-filled WhatsApp compose
  const triggerTestWhatsAppAlert = (type: 'appointment' | 'eyedrops' | 'newsletter') => {
    if (!currentPatient) return;

    let titleAr = '';
    let titleEn = '';
    let bodyAr = '';
    let bodyEn = '';

    if (type === 'appointment') {
      const apt = currentPatient.appointments[0];
      titleAr = 'تأكيد موعد العيادة وتتبع الدور';
      titleEn = 'Clinic Appointment Confirmation';
      bodyAr = apt
        ? `مرحباً ${currentPatient.fullNameAr}، أرغب بتأكيد موعدي (تذكرة رقم ${apt.ticketNumber}) مع ${apt.doctorNameAr} يوم ${apt.date} الساعة ${apt.time}. المكان: ${apt.room}.`
        : `مرحباً ${currentPatient.fullNameAr}، أرغب بالاستفسار عن موعد كشف في مستشفى كنوز الأهرام.`;
      bodyEn = apt
        ? `Dear ${currentPatient.fullNameEn}, I would like to confirm my appointment ticket ${apt.ticketNumber} with ${apt.doctorNameEn} on ${apt.date} at ${apt.time}. Location: ${apt.room}.`
        : `Dear ${currentPatient.fullNameEn}, I would like to inquire about an appointment at Konooz Al-Ahram Eye Hospital.`;
    } else if (type === 'eyedrops') {
      titleAr = 'استفسار بخصوص موعد قطرة العين';
      titleEn = 'Eye Drops Schedule Inquiry';
      bodyAr = `مرحباً، لدي استفسار حول جدول قطرات العين الموصوفة لي.`;
      bodyEn = `Hello, I have a question about my prescribed eye drop schedule.`;
    } else {
      titleAr = 'طلب اشتراك بالنشرة الطبية لكنوز الأهرام';
      titleEn = 'Konooz Al-Ahram Newsletter Subscription Request';
      bodyAr = `مرحباً، أرغب بالاشتراك في النشرة الطبية لطب وجراحة العيون.`;
      bodyEn = `Hello, I would like to subscribe to the ophthalmology health digest.`;
    }

    sendLiveNotificationSimulation('whatsapp', titleAr, titleEn, bodyAr, bodyEn);
    setSimulationSentMessage(t('تم تجهيز رسالة واتساب جاهزة للإرسال — راجع نافذة واتساب واضغط إرسال لإتمامها فعلياً.', 'A pre-filled WhatsApp draft is ready — switch to WhatsApp and press send to deliver it.'));
    setTimeout(() => setSimulationSentMessage(null), 4500);

    openWhatsAppAlert(`*مستشفى كنوز الأهرام لطب وجراحة العيون*\n\n📋 *${titleAr}*\n${bodyAr}\n\n📍 بنغازي - حي الفويهات\n📞 ${HOSPITAL_CONTACTS.primaryWhatsAppDisplay}`);
  };

  const triggerTestEmailAlert = () => {
    if (!currentPatient) return;
    const titleAr = 'التقرير الطبي وملخص المواعيد - مستشفى كنوز الأهرام';
    const titleEn = 'Medical Summary & Appointments - Konooz Al-Ahram';

    sendLiveNotificationSimulation('email', titleAr, titleEn, t('الإرسال البريدي التلقائي سيُفعّل عند اكتمال ربط النظام الطبي.', 'Automated email delivery activates once system integration is complete.'), t('الإرسال البريدي التلقائي سيُفعّل عند اكتمال ربط النظام الطبي.', 'Automated email delivery activates once system integration is complete.'));
    setSimulationSentMessage(t('سُجّل الطلب محلياً في سجلك — الإرسال البريدي الفعلي سيكون متاحاً قريباً.', 'Logged locally in your history — actual email delivery is coming soon.'));
    setTimeout(() => setSimulationSentMessage(null), 4000);
  };

  return (
    <Modal
      isOpen={isPatientPortalOpen}
      onClose={closePatientPortal}
      labelledById="patient-portal-modal-title"
      panelClassName="w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]"
    >
        
        {/* Header Bar */}
        <div className="bg-pine-900 text-white p-4 sm:p-6 flex items-center justify-between border-b border-ink-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-pine-500/20 border border-brass-400/40 flex items-center justify-center text-brass-300 shadow-inner">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="patient-portal-modal-title" className="text-lg sm:text-xl font-extrabold tracking-tight">
                  {t('بوابة المريض والملف الطبي الموحد', 'Patient Care Portal & Medical Profile')}
                </h2>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pine-500/20 text-brass-300 border border-pine-500/40">
                  {t('نظام كنوز المتكامل', 'Konooz Smart EMR')}
                </span>
              </div>
              <p className="text-xs text-ink-300 mt-0.5">
                {currentPatient
                  ? t(
                      `مرحباً بك: ${currentPatient.fullNameAr}`,
                      `Welcome: ${currentPatient.fullNameEn}`
                    )
                  : t('أنشئ ملفك المحلي لمتابعة مواعيدك وتنبيهاتك', 'Create your local profile to track appointments and alerts')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentPatient && (
              <button
                onClick={logout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-ink-300 hover:text-white bg-ink-700/80 hover:bg-red-500/20 hover:border-red-500/40 border border-ink-700 transition-colors"
                title={t('تسجيل الخروج', 'Log Out')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('خروج', 'Logout')}</span>
              </button>
            )}

            <button
              onClick={closePatientPortal}
              className="p-2 rounded-xl text-ink-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-bone-100 border-b border-pine-200 px-3 sm:px-6 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {currentPatient ? (
            <>
              <button
                onClick={() => setActivePortalTab('profile')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'profile'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t('ملفي الطبي والبيانات', 'My Medical Profile')}</span>
              </button>

              <button
                onClick={() => setActivePortalTab('appointments')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer relative ${
                  activePortalTab === 'appointments'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{t('مواعيدي والعيادات', 'Appointments')}</span>
                {currentPatient.appointments.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-pine-700 text-white text-[10px] flex items-center justify-center font-bold">
                    {currentPatient.appointments.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActivePortalTab('prescriptions')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'prescriptions'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Pill className="w-4 h-4" />
                <span>{t('الوصفات ومواعيد القطرات', 'Prescriptions & Drops')}</span>
              </button>

              <button
                onClick={() => setActivePortalTab('notifications')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'notifications'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Bell className="w-4 h-4 text-emerald-600" />
                <span>{t('تنبيهات الواتساب والإيميل', 'WhatsApp & Email Alerts')}</span>
              </button>

              <button
                onClick={() => setActivePortalTab('newsletter')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'newsletter'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Mail className="w-4 h-4 text-pine-800" />
                <span>{t('النشرة الطبية للعيون', 'Eye Health Digest')}</span>
              </button>

              <button
                onClick={() => setActivePortalTab('auth')}
                className={`py-3 px-3.5 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap flex items-center gap-2 transition-colors cursor-pointer ${
                  activePortalTab === 'auth'
                    ? 'border-pine-700 text-pine-800 bg-white shadow-xs rounded-t-lg'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Lock className="w-4 h-4" />
                <span>{t('الملف المحلي / تسجيل', 'Local Profile / Register')}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActivePortalTab('auth')}
              className="py-3 px-4 text-sm font-bold border-b-2 border-pine-700 text-pine-800 bg-white rounded-t-lg flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{t('تسجيل الدخول وفتح ملف جديد', 'Sign In / Register Profile')}</span>
            </button>
          )}
        </div>

        {/* Global Feedback Banner */}
        {simulationSentMessage && (
          <div className="bg-pine-50 border-b border-pine-200 px-4 py-2.5 flex items-center justify-between text-pine-900 text-xs font-bold animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{simulationSentMessage}</span>
            </div>
            <button onClick={() => setSimulationSentMessage(null)} className="text-emerald-700 hover:text-pine-900">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Main Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 bg-bone-50/50">
          
          {/* TAB 1: Profile */}
          {activePortalTab === 'profile' && currentPatient && (
            <div className="space-y-6">
              
              {/* Profile Card & Quick Actions */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-pine-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pine-500 to-ink-700 text-white flex items-center justify-center text-xl font-extrabold shadow-md">
                    {currentPatient.fullNameAr.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-ink-900">
                      {lang === 'ar' ? currentPatient.fullNameAr : currentPatient.fullNameEn}
                    </h3>
                    <p className="text-xs text-ink-500 flex items-center gap-2 mt-0.5 flex-wrap">
                        {currentPatient.nationalId && (
                          <>
                            <span>{t('الرقم الوطني:', 'National ID:')} <strong className="font-mono text-ink-700">{currentPatient.nationalId}</strong></span>
                            <span>•</span>
                          </>
                        )}
                        {currentPatient.bloodGroup && (
                          <>
                            <span>{t('فصيلة الدم:', 'Blood:')} <strong className="text-rose-600">{currentPatient.bloodGroup}</strong></span>
                            <span>•</span>
                          </>
                        )}
                        <span>{currentPatient.gender === 'female' ? t('أنثى', 'Female') : t('ذكر', 'Male')}</span>
                      </p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pine-50 text-pine-800 border border-pine-200">
                        {currentPatient.cityAr}
                      </span>
                      {currentPatient.insuranceProviderName && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-brass-50 text-brass-600 ring-1 ring-brass-300 border-amber-200">
                          {currentPatient.insuranceProviderName}
                        </span>
                      )}
                      {!currentPatient.insuranceProviderName && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-bone-50 text-ink-500 border border-pine-200">
                          {t('بدون تأمين مسجل', 'No insurance on file')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  <button
                    onClick={startEdit}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-ink-700 bg-bone-100 hover:bg-pine-200 border border-pine-200 transition-colors flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-ink-500" />
                    <span>{t('تعديل البيانات', 'Edit Profile')}</span>
                  </button>

                  <button
                    onClick={() => {
                      if (typeof window !== 'undefined') window.print();
                    }}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-pine-800 bg-pine-50 hover:bg-pine-100 border border-pine-200 transition-colors flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-pine-700" />
                    <span>{t('طباعة بطاقة المريض', 'Print Health Card')}</span>
                  </button>
                </div>
              </div>

              {/* Edit Profile Form if opened */}
              {isEditingProfile && (
                <form onSubmit={handleSaveProfile} className="bg-pine-50/70 border border-pine-200 rounded-2xl p-5 space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between border-b border-pine-200 pb-2">
                    <h4 className="text-sm font-extrabold text-pine-950 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-pine-800" />
                      <span>{t('تحديث البيانات الشخصية والطبية للمريض', 'Update Patient Personal & Medical Records')}</span>
                    </h4>
                    <button type="button" onClick={() => setIsEditingProfile(false)} className="text-pine-800 hover:text-pine-950 text-xs font-bold">
                      {t('إلغاء', 'Cancel')}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('الاسم بالكامل:', 'Full Name:')}</label>
                      <input
                        type="text"
                        required
                        value={editForm.fullNameAr}
                        onChange={(e) => setEditForm({ ...editForm, fullNameAr: e.target.value })}
                        className="w-full p-2.5 bg-white border border-pine-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('رقم الهاتف / الواتساب:', 'Phone / WhatsApp:')}</label>
                      <input
                        type="text"
                        required
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full p-2.5 bg-white border border-pine-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('البريد الإلكتروني:', 'Email Address:')}</label>
                      <input
                        type="email"
                        value={editForm.email}
                        onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('المدينة / الحي في ليبيا:', 'Libyan City / District:')}</label>
                      <input
                        type="text"
                        value={editForm.cityAr}
                        onChange={(e) => setEditForm({ ...editForm, cityAr: e.target.value })}
                        className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('جهة التأمين الطبي:', 'Insurance Company:')}</label>
                      <input
                        type="text"
                        value={editForm.insuranceProviderName}
                        onChange={(e) => setEditForm({ ...editForm, insuranceProviderName: e.target.value })}
                        className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('رقم بطاقة التأمين:', 'Insurance Policy No:')}</label>
                      <input
                        type="text"
                        value={editForm.insurancePolicyNo}
                        onChange={(e) => setEditForm({ ...editForm, insurancePolicyNo: e.target.value })}
                        className="w-full p-2.5 bg-white border border-pine-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('جهة الاتصال في الطوارئ (الاسم):', 'Emergency Contact Name:')}</label>
                      <input
                        type="text"
                        value={editForm.emergencyContactName}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContactName: e.target.value })}
                        className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('هاتف الطوارئ:', 'Emergency Phone:')}</label>
                      <input
                        type="text"
                        value={editForm.emergencyContactPhone}
                        onChange={(e) => setEditForm({ ...editForm, emergencyContactPhone: e.target.value })}
                        className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('الحساسيات الدوائية (افصل بفاصلة):', 'Drug Allergies:')}</label>
                      <input
                        type="text"
                        value={editForm.allergies}
                        onChange={(e) => setEditForm({ ...editForm, allergies: e.target.value })}
                        className="w-full p-2.5 bg-white border border-pine-200 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-pine-700 hover:bg-pine-800 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      {t('حفظ التعديلات في ملفي', 'Save Profile Updates')}
                    </button>
                  </div>
                </form>
              )}

              {/* Grid of Medical Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Refractive & Vision Parameters */}
                <div className="bg-white rounded-2xl p-4 border border-pine-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-bone-100 pb-2">
                    <div className="flex items-center gap-2 text-pine-800 font-extrabold text-xs">
                      <Eye className="w-4 h-4 text-pine-700" />
                      <span>{t('قياسات النظر والانكسار الأخيرة', 'Refractive Vision Baseline')}</span>
                    </div>
                    {currentPatient.refractiveData.lastChecked && (
                      <span className="text-[10px] text-ink-400 font-mono">{currentPatient.refractiveData.lastChecked}</span>
                    )}
                  </div>

                  {currentPatient.refractiveData.lastChecked ? (
                    <div className="grid grid-cols-2 gap-2 text-center text-xs">
                      <div className="p-2.5 bg-bone-50 rounded-xl border border-bone-100">
                        <span className="block font-bold text-ink-700 mb-1">{t('العين اليمنى (OD)', 'Right Eye (OD)')}</span>
                        <div className="font-mono text-pine-800 font-bold text-sm">
                          {currentPatient.refractiveData.odSphere} Sph
                        </div>
                        <div className="font-mono text-[11px] text-ink-500">
                          {currentPatient.refractiveData.odCyl} Cyl @ {currentPatient.refractiveData.odAxis}
                        </div>
                      </div>

                      <div className="p-2.5 bg-bone-50 rounded-xl border border-bone-100">
                        <span className="block font-bold text-ink-700 mb-1">{t('العين اليسرى (OS)', 'Left Eye (OS)')}</span>
                        <div className="font-mono text-pine-800 font-bold text-sm">
                          {currentPatient.refractiveData.osSphere} Sph
                        </div>
                        <div className="font-mono text-[11px] text-ink-500">
                          {currentPatient.refractiveData.osCyl} Cyl @ {currentPatient.refractiveData.osAxis}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-ink-400 italic py-3 text-center">
                      {t('لا توجد قياسات نظر مسجلة بعد — تُضاف تلقائياً بعد أول كشف شامل.', 'No vision measurements yet — added automatically after your first comprehensive exam.')}
                    </p>
                  )}
                </div>

                {/* Medical History & Allergies */}
                <div className="bg-white rounded-2xl p-4 border border-pine-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-rose-800 font-extrabold text-xs border-b border-bone-100 pb-2">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    <span>{t('الحساسيات والأمراض المزمنة', 'Allergies & Medical History')}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="block text-[11px] font-bold text-ink-500 mb-1">{t('الحساسيات المسجلة:', 'Known Allergies:')}</span>
                      {currentPatient.allergiesAr.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {currentPatient.allergiesAr.map((a, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-semibold">
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-ink-400 italic text-[11px]">{t('لا توجد حساسيات دوائية', 'None')}</p>
                      )}
                    </div>

                    <div className="pt-1">
                      <span className="block text-[11px] font-bold text-ink-500 mb-1">{t('الحالات المرضية:', 'Chronic Conditions:')}</span>
                      {currentPatient.chronicConditionsAr.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {currentPatient.chronicConditionsAr.map((c, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-lg bg-bone-100 text-ink-700 text-[11px] font-semibold">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-ink-400 italic text-[11px]">{t('سليم طبياً', 'Healthy')}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Emergency Contact & Insurance */}
                <div className="bg-white rounded-2xl p-4 border border-pine-200 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-pine-900 font-extrabold text-xs border-b border-bone-100 pb-2">
                    <ShieldCheck className="w-4 h-4 text-pine-800" />
                    <span>{t('الطوارئ والتأمين الطبي', 'Emergency & Insurance')}</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 bg-bone-50 rounded-xl border border-bone-100 space-y-1">
                      <span className="block text-[10px] text-ink-400 font-bold uppercase">{t('جهة الاتصال في الطوارئ', 'Emergency Contact')}</span>
                      <p className="font-bold text-ink-700">{currentPatient.emergencyContact.name}</p>
                      <a href={`tel:${currentPatient.emergencyContact.phone}`} className="text-pine-800 font-mono text-[11px] hover:underline flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span>{currentPatient.emergencyContact.phone}</span>
                      </a>
                    </div>

                    <div className="p-2.5 bg-bone-50 rounded-xl border border-bone-100 space-y-1">
                      <span className="block text-[10px] text-ink-400 font-bold uppercase">{t('وثيقة التأمين', 'Insurance Card')}</span>
                      <p className="font-bold text-ink-700 text-[11px]">{currentPatient.insuranceProviderName}</p>
                      <p className="font-mono text-ink-500 text-[10px]">{currentPatient.insurancePolicyNo}</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Data Storage Notice — honest local-first model */}
              <div className="bg-white rounded-2xl p-5 sm:p-6 border border-pine-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-bone-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-pine-50 text-pine-800 border border-pine-200 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-extrabold text-ink-900">
                        {t('أين تُحفظ بياناتك؟', 'Where is your data stored?')}
                      </h4>
                      <p className="text-xs text-ink-500 mt-0.5 max-w-md">
                        {t(
                          'ملفك الطبي محفوظ محلياً في متصفح هذا الجهاز فقط، ولا يُرسل إلى أي خادم حالياً.',
                          'Your medical profile is stored locally in this device\'s browser only — nothing is sent to any server.'
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleRemoveLocalProfile}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition-colors cursor-pointer self-start sm:self-auto"
                  >
                    <span>{t('حذف الملف من هذا الجهاز', 'Delete from this device')}</span>
                  </button>
                </div>

                {/* Honest Status Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-bone-50 rounded-xl border border-bone-100">
                    <span className="block text-[10px] text-ink-400 font-bold uppercase mb-1">{t('التخزين الحالي', 'Current storage')}</span>
                    <strong className="text-ink-900">{t('محلي على هذا الجهاز فقط', 'Local to this device only')}</strong>
                  </div>

                  <div className="p-3 bg-bone-50 rounded-xl border border-bone-100">
                    <span className="block text-[10px] text-ink-400 font-bold uppercase mb-1">{t('الحسابات السحابية وكلمات المرور', 'Online accounts & passwords')}</span>
                    <strong className="text-brass-600">{t('قريباً — لم تُفعّل بعد', 'Coming soon — not active yet')}</strong>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      {t('سيتم تشغيلها عند اكتمال ربط النظام الطبي.', 'Activates when hospital system integration completes.')}
                    </p>
                  </div>

                  <div className="p-3 bg-bone-50 rounded-xl border border-bone-100">
                    <span className="block text-[10px] text-ink-400 font-bold uppercase mb-1">{t('الخصوصية', 'Privacy')}</span>
                    <strong className="text-ink-900">{t('لا إرسال تلقائي للبيانات', 'No automatic data sharing')}</strong>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      {t('التواصل مع المستشفى يتم بإرادتك عبر واتساب أو الهاتف.', 'Contacting the hospital happens by your choice via WhatsApp or phone.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Jump to Notifications & Newsletter */}
              <div className="bg-gradient-to-r from-pine-50 via-pine-50 to-pine-50 rounded-2xl p-5 border border-pine-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-start">
                  <h4 className="text-sm font-extrabold text-ink-900 flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>{t('تنبيهات الواتساب الفورية ونشرة العيون الطبية مفعّلة', 'Instant WhatsApp Alerts & Eye Digest Active')}</span>
                  </h4>
                  <p className="text-xs text-ink-500">
                    {t(
                      `يتم إرسال تذكيرات المواعيد والقطرات مباشرة إلى هاتفك (${currentPatient.whatsappNumber}) والبريد (${currentPatient.email}).`,
                      `Appointment and eye drop reminders are delivered directly to your phone (${currentPatient.whatsappNumber}) and email (${currentPatient.email}).`
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActivePortalTab('notifications')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{t('إدارة التنبيهات', 'Manage Alerts')}</span>
                  </button>
                  <button
                    onClick={() => setActivePortalTab('newsletter')}
                    className="px-4 py-2 bg-pine-800 hover:bg-pine-700 text-white font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{t('النشرة الطبية', 'Newsletter')}</span>
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Appointments */}
          {activePortalTab === 'appointments' && currentPatient && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-ink-900">
                    {t('سجل المواعيد والعيادات الاستشارية', 'Consultation & Surgery Appointments')}
                  </h3>
                  <p className="text-xs text-ink-500">
                    {t('تابع مواعيد كشف العيون، العمليات الجراحية، وموقعك في الطابور المباشر', 'Track your clinical visits, surgical schedule, and live queue position')}
                  </p>
                </div>

                <button
                  onClick={() => {
                    closePatientPortal();
                    openQueueModal();
                  }}
                  className="px-3.5 py-2 bg-pine-50 hover:bg-pine-100 border border-pine-200 text-pine-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Clock className="w-4 h-4 text-pine-700 animate-pulse" />
                  <span>{t('شاشة تتبع الدور المباشر', 'Open Live Queue')}</span>
                </button>
              </div>

              <div className="space-y-3">
                {currentPatient.appointments.map((apt) => (
                  <div key={apt.id} className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bone-100 pb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-extrabold text-xs px-2.5 py-1 rounded-lg bg-ink-900 text-brass-300">
                          {apt.ticketNumber}
                        </span>
                        <div>
                          <h4 className="text-sm font-extrabold text-ink-900">{lang === 'ar' ? apt.doctorNameAr : apt.doctorNameEn}</h4>
                          <p className="text-xs text-pine-800 font-bold">{lang === 'ar' ? apt.specialtyAr : apt.specialtyEn}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            apt.status === 'in_queue'
                              ? 'bg-brass-100 text-brass-600 border border-brass-300 animate-pulse'
                              : apt.status === 'confirmed'
                              ? 'bg-pine-100 text-pine-900 border border-pine-300'
                              : apt.status === 'scheduled'
                              ? 'bg-pine-100 text-pine-900 border border-pine-300'
                              : 'bg-bone-100 text-ink-700'
                          }`}
                        >
                          {apt.status === 'in_queue'
                            ? t('في طابور الانتظار الآن', 'In Live Queue')
                            : apt.status === 'confirmed'
                            ? t('مؤكد وجاهز', 'Confirmed')
                            : apt.status === 'scheduled'
                            ? t('مجدول قادماً', 'Scheduled')
                            : t('مكتمل', 'Completed')}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-ink-500">
                      <div className="flex items-center gap-2 p-2 bg-bone-50 rounded-xl">
                        <Calendar className="w-4 h-4 text-ink-400" />
                        <span><strong>{t('التاريخ:', 'Date:')}</strong> {apt.date}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-bone-50 rounded-xl">
                        <Clock className="w-4 h-4 text-ink-400" />
                        <span><strong>{t('الوقت:', 'Time:')}</strong> {apt.time}</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-bone-50 rounded-xl">
                        <Eye className="w-4 h-4 text-ink-400" />
                        <span><strong>{t('المكان:', 'Room:')}</strong> {apt.room}</span>
                      </div>
                    </div>

                    {apt.instructionsAr && (
                      <div className="p-3 rounded-xl bg-brass-50/70 ring-1 ring-brass-300 text-brass-600 text-xs flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-brass-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold">{t('تعليمات وتحضيرات الموعد:', 'Patient Instructions:')}</strong>
                          <span>{lang === 'ar' ? apt.instructionsAr : apt.instructionsEn}</span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => triggerTestWhatsAppAlert('appointment')}
                        className="px-3 py-1.5 bg-pine-50 hover:bg-pine-100 text-pine-800 border border-pine-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                      >
                        <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{t('إرسال تذكير واتساب', 'WhatsApp Reminder')}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Prescriptions & Eye Drops */}
          {activePortalTab === 'prescriptions' && currentPatient && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-ink-900">
                    {t('الوصفات الطبية ومواعيد القطرات والعلاج', 'Ophthalmic Prescriptions & Drop Schedules')}
                  </h3>
                  <p className="text-xs text-ink-500">
                    {t('الخطة العلاجية المعتمدة من الاستشاري مع توقيتات وجرعات القطرات', 'Approved clinical prescriptions and eye drops timetable')}
                  </p>
                </div>

                <button
                  onClick={() => triggerTestWhatsAppAlert('eyedrops')}
                  className="px-3.5 py-2 bg-pine-50 hover:bg-pine-100 border border-pine-200 text-pine-800 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4 text-emerald-600" />
                  <span>{t('تنبيه بموعد القطرة الآن', 'Send Drop Reminder Alert')}</span>
                </button>
              </div>

              {currentPatient.prescriptions.length > 0 ? (
                currentPatient.prescriptions.map((rx) => (
                  <div key={rx.id} className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-bone-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-pine-700" />
                          <h4 className="text-sm font-extrabold text-ink-900">{lang === 'ar' ? rx.doctorAr : rx.doctorEn}</h4>
                        </div>
                        <p className="text-xs text-ink-500 mt-0.5">
                          <strong>{t('التشخيص:', 'Diagnosis:')}</strong> {lang === 'ar' ? rx.diagnosisAr : rx.diagnosisEn}
                        </p>
                      </div>
                      <span className="text-xs font-mono text-ink-500 bg-bone-100 px-2.5 py-1 rounded-lg">
                        {rx.date}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <span className="block text-xs font-extrabold text-ink-700 uppercase tracking-wider">{t('الأدوية والقطرات الموصوفة:', 'Prescribed Eye Medications:')}</span>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {rx.medications.map((med, i) => (
                          <div key={i} className="p-3.5 bg-bone-50 rounded-xl border border-pine-200 space-y-1 text-xs">
                            <div className="flex items-center justify-between">
                              <strong className="text-ink-900 font-extrabold text-xs sm:text-sm">{med.name}</strong>
                              <span className="px-2 py-0.5 rounded-md bg-pine-100 text-pine-900 font-mono font-bold text-[10px]">
                                {med.targetEye}
                              </span>
                            </div>
                            <div className="text-ink-700">
                              <span><strong>{t('الجرعة:', 'Dosage:')}</strong> {lang === 'ar' ? med.dosageAr : med.dosageEn}</span>
                            </div>
                            <div className="text-emerald-700 font-bold">
                              <span><strong>{t('التكرار:', 'Frequency:')}</strong> {lang === 'ar' ? med.frequencyAr : med.frequencyEn}</span>
                            </div>
                            <div className="text-ink-500 text-[11px]">
                              <span><strong>{t('المدة:', 'Duration:')}</strong> {lang === 'ar' ? med.durationAr : med.durationEn}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-8 text-center border border-pine-200 text-ink-500 space-y-2">
                  <Pill className="w-10 h-10 text-ink-300 mx-auto" />
                  <p className="text-sm font-bold">{t('لا توجد وصفات طبية سابقة مسجلة', 'No prescriptions recorded yet')}</p>
                  <p className="text-xs text-ink-400">{t('سيقوم الطبيب بإدراج الخطة العلاجية والقطرات عقب انتهاء الكشف.', 'The consultant will record your prescription following examination.')}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: WhatsApp & Email Alerts & Communication Center */}
          {activePortalTab === 'notifications' && currentPatient && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-ink-900">
                  {t('مركز التنبيهات الفورية (واتساب والبريد الإلكتروني)', 'Instant WhatsApp & Email Notification Hub')}
                </h3>
                <p className="text-xs text-ink-500">
                  {t('خصص قنوات استلام تذكيرات الكشوفات، مواعيد القطرات، والإرشادات بعد العمليات', 'Configure real-time channels for appointment alerts, drop schedules, and post-op care')}
                </p>
              </div>

              {/* Channels Status & Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* WhatsApp Channel Card */}
                <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-pine-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pine-500 text-white flex items-center justify-center shadow-xs">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-ink-900">{t('تنبيهات الواتساب الفورية', 'WhatsApp Instant Alerts')}</h4>
                        <p className="text-xs text-emerald-700 font-mono font-bold">{currentPatient.whatsappNumber}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleNotificationPref('whatsappAlerts')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        currentPatient.communicationPreferences.whatsappAlerts ? 'bg-emerald-600' : 'bg-ink-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          currentPatient.communicationPreferences.whatsappAlerts
                            ? isRTL ? '-translate-x-6' : 'translate-x-6'
                            : isRTL ? '-translate-x-1' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs text-ink-500">
                    <div className="flex items-center justify-between">
                      <span>{t('تذكير بموعد العيادة قبل 24 ساعة', '24h Appointment Reminder')}</span>
                      <input
                        type="checkbox"
                        checked={currentPatient.communicationPreferences.appointmentReminders}
                        onChange={() => toggleNotificationPref('appointmentReminders')}
                        className="rounded text-emerald-600 focus:ring-pine-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('تنبيهات مواعيد وضع قطرات العين', 'Eye Drop Dose Timetable Alerts')}</span>
                      <input
                        type="checkbox"
                        checked={currentPatient.communicationPreferences.eyeDropScheduleAlerts}
                        onChange={() => toggleNotificationPref('eyeDropScheduleAlerts')}
                        className="rounded text-emerald-600 focus:ring-pine-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('تنبيه عند اقتراب دورك في العيادة (رقم التذكرة)', 'Live Queue Approaching Alert')}</span>
                      <input
                        type="checkbox"
                        checked={currentPatient.communicationPreferences.queueTurnAlerts}
                        onChange={() => toggleNotificationPref('queueTurnAlerts')}
                        className="rounded text-emerald-600 focus:ring-pine-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-pine-100 flex items-center justify-between">
                    <span className="text-[11px] text-ink-500">{t('جرّب إرسال تنبيه تجريبي:', 'Test live dispatch:')}</span>
                    <button
                      onClick={() => triggerTestWhatsAppAlert('appointment')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t('إرسال واتساب تجريبي', 'Send Test Alert')}</span>
                    </button>
                  </div>
                </div>

                {/* Email Channel Card */}
                <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-pine-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-pine-800 text-white flex items-center justify-center shadow-xs">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-ink-900">{t('إشعارات البريد الإلكتروني', 'Email Summaries & Reports')}</h4>
                        <p className="text-xs text-pine-700 font-mono font-bold">{currentPatient.email}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => toggleNotificationPref('emailNotifications')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        currentPatient.communicationPreferences.emailNotifications ? 'bg-pine-800' : 'bg-ink-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          currentPatient.communicationPreferences.emailNotifications
                            ? isRTL ? '-translate-x-6' : 'translate-x-6'
                            : isRTL ? '-translate-x-1' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="space-y-2.5 text-xs text-ink-500">
                    <div className="flex items-center justify-between">
                      <span>{t('إرسال التقارير الطبية وفحوصات الأشعة (OCT)', 'Medical Reports & OCT PDF')}</span>
                      <input
                        type="checkbox"
                        checked={currentPatient.communicationPreferences.emailNotifications}
                        onChange={() => toggleNotificationPref('emailNotifications')}
                        className="rounded text-pine-800 focus:ring-pine-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('إرشادات العناية بعد جراحات الليزك والمياه البيضاء', 'Post-Op Surgical Care Instructions')}</span>
                      <input
                        type="checkbox"
                        checked={currentPatient.communicationPreferences.postOpCareGuides}
                        onChange={() => toggleNotificationPref('postOpCareGuides')}
                        className="rounded text-pine-800 focus:ring-pine-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{t('الاشتراك في النشرة الطبية للعيون', 'Subscribe to Eye Health Digest')}</span>
                      <input
                        type="checkbox"
                        checked={currentPatient.communicationPreferences.newsletterSubscribed}
                        onChange={() => toggleNotificationPref('newsletterSubscribed')}
                        className="rounded text-pine-800 focus:ring-pine-500 w-4 h-4 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="pt-2 border-t border-pine-100 flex items-center justify-between">
                    <span className="text-[11px] text-ink-500">{t('جرّب إرسال تقرير تجريبي:', 'Test report email:')}</span>
                    <button
                      onClick={triggerTestEmailAlert}
                      className="px-3 py-1.5 bg-pine-800 hover:bg-pine-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Send className="w-3 h-3" />
                      <span>{t('إرسال إيميل تجريبي', 'Send Test Email')}</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* Notification History Log */}
              <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
                <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-ink-500" />
                  <span>{t('سجل الإشعارات والتنبيهات المرسلة إلى حسابك', 'Recent Sent Notifications & Alerts')}</span>
                </h4>

                <div className="space-y-2">
                  {currentPatient.notificationHistory && currentPatient.notificationHistory.length > 0 ? (
                    currentPatient.notificationHistory.map((notif) => (
                      <div key={notif.id} className="p-3 rounded-xl bg-bone-50 border border-pine-200 flex items-start gap-3 text-xs">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-white ${
                            notif.channel === 'whatsapp' ? 'bg-emerald-600' : 'bg-pine-700'
                          }`}
                        >
                          {notif.channel === 'whatsapp' ? <Smartphone className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <strong className="text-ink-900 font-bold">{lang === 'ar' ? notif.titleAr : notif.titleEn}</strong>
                            <span className="text-[10px] text-ink-400 font-mono">{notif.timestamp}</span>
                          </div>
                          <p className="text-ink-500 text-[11px] leading-relaxed">{lang === 'ar' ? notif.bodyAr : notif.bodyEn}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-ink-400 italic py-2">{t('لا توجد إشعارات سابقة مسجلة.', 'No prior alerts recorded.')}</p>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* TAB 5: Eye Health Newsletter */}
          {activePortalTab === 'newsletter' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-pine-900 text-white p-5 rounded-2xl shadow-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brass-400" />
                    <h3 className="text-base sm:text-lg font-extrabold">
                      {t('نشرة كنوز الأهرام لطب وجراحة العيون', 'Konooz Al-Ahram Eye Health Digest')}
                    </h3>
                  </div>
                  <p className="text-xs text-ink-300 mt-1 max-w-xl">
                    {t(
                      'أحدث التطورات العلمية، نصائح جفاف العين في المناخ الليبي، وإرشادات تصحيح النظر والمياه البيضاء تصلك دورياً عبر البريد والواتساب.',
                      'Latest ophthalmic surgical advances, dry eye prevention tips, and refractive insights delivered directly to your inbox & WhatsApp.'
                    )}
                  </p>
                </div>

                {currentPatient && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-brass-300">
                      {currentPatient.communicationPreferences.newsletterSubscribed
                        ? t('أنت مشترك حالياً', 'Subscribed')
                        : t('غير مشترك', 'Not Subscribed')}
                    </span>
                    <button
                      onClick={() => toggleNotificationPref('newsletterSubscribed')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs ${
                        currentPatient.communicationPreferences.newsletterSubscribed
                          ? 'bg-rose-600 hover:bg-rose-700 text-white'
                          : 'bg-pine-500 hover:bg-brass-400 text-pine-950'
                      }`}
                    >
                      {currentPatient.communicationPreferences.newsletterSubscribed
                        ? t('إلغاء الاشتراك', 'Unsubscribe')
                        : t('اشترك مجاناً', 'Subscribe Free')}
                    </button>
                  </div>
                )}
              </div>

              {/* Topics of Interest Picker */}
              <div className="bg-white rounded-2xl p-5 border border-pine-200 shadow-xs space-y-3">
                <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider">
                  {t('المواضيع والاهتمامات الطبية المختارة:', 'Select Preferred Topics of Interest:')}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {NEWSLETTER_TOPICS.map((topic) => {
                    const isSelected =
                      currentPatient?.communicationPreferences?.newsletterTopics?.includes(topic.id) ?? true;

                    return (
                      <button
                        type="button"
                        key={topic.id}
                        onClick={() => currentPatient && toggleNewsletterTopic(topic.id)}
                        aria-pressed={isSelected}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 text-start ${
                          isSelected
                            ? 'bg-pine-50/70 border-brass-300 text-ink-900 shadow-xs'
                            : 'bg-bone-50 border-pine-200 text-ink-500 hover:border-ink-300'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                            isSelected ? 'bg-pine-700 border-pine-700 text-white' : 'border-ink-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div className="space-y-1 text-xs">
                          <strong className="block font-bold">{lang === 'ar' ? topic.titleAr : topic.titleEn}</strong>
                          <span className="inline-block text-[10px] font-semibold text-pine-800 bg-pine-100/70 px-2 py-0.5 rounded-md">
                            {lang === 'ar' ? topic.frequencyAr : topic.frequencyEn}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Latest Newsletter Issues Archive */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-ink-900 uppercase tracking-wider flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-pine-800" />
                  <span>{t('أحدث الأعداد والمقالات المنشورة', 'Latest Published Issues & Clinical Articles')}</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {NEWSLETTER_ISSUES.map((issue) => (
                    <div
                      key={issue.id}
                      className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                        activeNewsletterIssue === issue.id ? 'border-brass-400 ring-2 ring-pine-100' : 'border-pine-200'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-ink-400">
                          <span className="font-semibold text-pine-700 bg-pine-50 px-2 py-0.5 rounded-md">
                            {lang === 'ar' ? issue.categoryAr : issue.categoryEn}
                          </span>
                          <span>{lang === 'ar' ? issue.readTimeAr : issue.readTimeEn}</span>
                        </div>

                        <h5 className="text-sm font-extrabold text-ink-900 leading-snug">
                          {lang === 'ar' ? issue.titleAr : issue.titleEn}
                        </h5>

                        <p className="text-xs text-ink-500 leading-relaxed">
                          {lang === 'ar' ? issue.summaryAr : issue.summaryEn}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-bone-100 flex items-center justify-between">
                        <span className="text-[10px] text-ink-400 font-mono">{issue.date}</span>
                        <button
                          onClick={() => {
                            setActiveNewsletterIssue(issue.id);
                            triggerTestWhatsAppAlert('newsletter');
                          }}
                          className="text-xs font-bold text-pine-800 hover:text-pine-900 flex items-center gap-1"
                        >
                          <span>{t('إرسال عبر الواتساب', 'Send to WhatsApp')}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 6: Device-Local Profile Access */}
          {activePortalTab === 'auth' && (
            <div className="space-y-6">

              {/* Server cloud account (email + password) */}
              <div className="bg-white rounded-2xl p-5 sm:p-7 border border-pine-200 shadow-xs max-w-xl mx-auto space-y-4 animate-in fade-in">
                <div className="text-center space-y-1.5">
                  <div className="w-12 h-12 rounded-2xl bg-pine-700 text-white mx-auto flex items-center justify-center border border-pine-800">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-extrabold text-ink-900">
                    {t('الحساب السحابي الآمن', 'Secure Cloud Account')}
                  </h4>
                  <p className="text-xs text-ink-500">
                    {t('بريد إلكتروني وكلمة مرور — تُحفظ بياناتك في خادم المستشفى وتتبعك على أي جهاز.', 'Email and password — your data lives on the hospital server and follows you across devices.')}
                  </p>
                </div>

                {isServerAuthenticated ? (
                  <div className="space-y-3 text-center">
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span>
                        {t('مسجل الدخول:', 'Signed in as:')} <span dir="ltr" className="font-mono">{serverUser?.email}</span>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleServerLogout}
                      className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      {t('تسجيل الخروج من الحساب السحابي', 'Sign Out of Cloud Account')}
                    </button>
                    {serverUser?.role === 'STAFF' && (
                      <button
                        type="button"
                        onClick={() => { closePatientPortal(); setActiveView('dashboard'); }}
                        className="w-full py-3 bg-pine-700 hover:bg-pine-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                      >
                        {t('فتح لوحة تحكم المستشفى', 'Open Hospital Operations Dashboard')}
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleServerAuthSubmit} className="space-y-3.5 text-xs">
                    <div className="flex rounded-xl bg-bone-100 p-1 gap-1">
                      <button
                        type="button"
                        onClick={() => { setAuthMode('login'); setAuthError(null); }}
                        className={`flex-1 py-2 rounded-lg font-extrabold transition-all cursor-pointer ${authMode === 'login' ? 'bg-white text-pine-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'}`}
                      >
                        {t('تسجيل الدخول', 'Sign In')}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setAuthMode('register'); setAuthError(null); }}
                        className={`flex-1 py-2 rounded-lg font-extrabold transition-all cursor-pointer ${authMode === 'register' ? 'bg-white text-pine-900 shadow-sm' : 'text-ink-500 hover:text-ink-900'}`}
                      >
                        {t('حساب جديد', 'Create Account')}
                      </button>
                    </div>

                    {authMode === 'register' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-ink-700 font-bold mb-1">{t('الاسم الكامل *', 'Full Name *')}</label>
                          <input
                            type="text"
                            required
                            minLength={2}
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            className="w-full p-3 bg-bone-50 border border-ink-300 rounded-xl font-bold text-ink-900 focus:ring-2 focus:ring-pine-500 outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-ink-700 font-bold mb-1">{t('الهاتف (اختياري)', 'Phone (optional)')}</label>
                          <input
                            type="tel"
                            dir="ltr"
                            value={authPhone}
                            onChange={(e) => setAuthPhone(e.target.value)}
                            placeholder="091XXXXXXX"
                            className="w-full p-3 bg-bone-50 border border-ink-300 rounded-xl font-bold text-ink-900 focus:ring-2 focus:ring-pine-500 outline-hidden"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('البريد الإلكتروني *', 'Email Address *')}</label>
                      <input
                        type="email"
                        required
                        dir="ltr"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full p-3 bg-bone-50 border border-ink-300 rounded-xl font-bold text-ink-900 focus:ring-2 focus:ring-pine-500 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('كلمة المرور * (8 أحرف على الأقل)', 'Password * (min 8 characters)')}</label>
                      <input
                        type="password"
                        required
                        minLength={8}
                        dir="ltr"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className="w-full p-3 bg-bone-50 border border-ink-300 rounded-xl font-bold text-ink-900 focus:ring-2 focus:ring-pine-500 outline-hidden"
                      />
                    </div>

                    {authError && (
                      <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}
                    {authSuccess && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>{authSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authBusy}
                      className="w-full py-3 bg-pine-700 hover:bg-pine-800 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      {authBusy
                        ? t('جارٍ المعالجة…', 'Processing…')
                        : authMode === 'login'
                          ? t('دخول إلى حسابي', 'Sign In to My Account')
                          : t('إنشاء الحساب السحابي', 'Create Cloud Account')}
                    </button>
                  </form>
                )}
              </div>

              {currentPatient ? (
                /* Existing device-local profile */
                <div className="bg-white rounded-2xl p-5 sm:p-7 border border-pine-200 shadow-xs max-w-xl mx-auto space-y-5 animate-in fade-in text-center">
                  <div className="w-14 h-14 rounded-2xl bg-pine-50 text-pine-800 mx-auto flex items-center justify-center border border-pine-200">
                    <User className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-ink-900">
                      {t('ملفك محفوظ على هذا الجهاز', 'Your profile is saved on this device')}
                    </h4>
                    <p className="text-xs text-ink-500 flex items-center justify-center gap-1.5 flex-wrap">
                      <span className="font-bold text-ink-700">{currentPatient.fullNameAr}</span>
                      <span>•</span>
                      <span dir="ltr" className="font-mono">{currentPatient.email}</span>
                    </p>
                  </div>

                  <p className="text-[11px] text-brass-600 bg-brass-50 ring-1 ring-brass-300 rounded-xl p-3 leading-relaxed text-start">
                    {t(
                      'بياناتك تُخزَّن محلياً في متصفح هذا الجهاز فقط ولا تُرسل إلى أي خادم. للحساب السحابي المتزامن عبر الأجهزة استخدم نموذج الحساب الآمن أعلاه.',
                      'Your data is stored locally in this browser only and is never sent to a server. For a cross-device synced account, use the Secure Cloud Account form above.'
                    )}
                  </p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActivePortalTab('profile')}
                      className="px-5 py-2.5 bg-pine-700 hover:bg-pine-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      {t('متابعة إلى ملفي الطبي', 'Continue to My Profile')}
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveLocalProfile}
                      className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      {t('حذف الملف من هذا الجهاز', 'Delete from this device')}
                    </button>
                  </div>
                </div>
              ) : (
                /* Create device-local profile (no passwords yet) */
                <div className="bg-white rounded-2xl p-5 sm:p-7 border border-pine-200 shadow-xs max-w-xl mx-auto space-y-5 animate-in fade-in">
                  <div className="text-center space-y-1.5 border-b border-bone-100 pb-4">
                    <div className="w-12 h-12 rounded-2xl bg-pine-50 text-pine-800 mx-auto flex items-center justify-center border border-pine-200">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h4 className="text-base font-extrabold text-ink-900">
                      {t('إنشاء ملف طبي محلي', 'Create Your Medical Profile')}
                    </h4>
                    <p className="text-xs text-ink-500">
                      {t('بدون كلمات مرور — بياناتك تُحفظ على هذا الجهاز فقط. للحساب المتزامن استخدم النموذج الآمن أعلاه.', 'No passwords — your data is saved on this device only. For a synced account use the Secure Cloud form above.')}
                    </p>
                  </div>

                  {createError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>{createError}</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateProfileSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-ink-700 font-bold mb-1">{t('الاسم الكامل للمريض *', 'Patient Full Name *')}</label>
                        <input
                          type="text"
                          required
                          value={createName}
                          onChange={(e) => setCreateName(e.target.value)}
                          placeholder={t('مثال: سالم محمود الفيتوري', 'e.g. Salem Mahmoud')}
                          className="w-full p-3 bg-bone-50 border border-ink-300 rounded-xl font-bold text-ink-900 focus:ring-2 focus:ring-pine-500 outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-ink-700 font-bold mb-1">{t('رقم الهاتف والواتساب *', 'Phone / WhatsApp *')}</label>
                        <input
                          type="tel"
                          required
                          dir="ltr"
                          value={createPhone}
                          onChange={(e) => setCreatePhone(e.target.value)}
                          placeholder="091XXXXXXX"
                          className="w-full p-3 bg-bone-50 border border-ink-300 rounded-xl font-bold text-ink-900 focus:ring-2 focus:ring-pine-500 outline-hidden"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-ink-700 font-bold mb-1">{t('البريد الإلكتروني *', 'Email Address *')}</label>
                      <input
                        type="email"
                        required
                        dir="ltr"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        placeholder="patient@example.com"
                        className="w-full p-3 bg-bone-50 border border-ink-300 rounded-xl font-bold text-ink-900 focus:ring-2 focus:ring-pine-500 outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="block text-ink-700 font-bold mb-1">{t('المدينة / المنطقة:', 'City / Area:')}</label>
                        <input
                          type="text"
                          value={createCity}
                          onChange={(e) => setCreateCity(e.target.value)}
                          placeholder="بنغازي"
                          className="w-full p-3 bg-bone-50 border border-ink-300 rounded-xl font-bold text-ink-900"
                        />
                      </div>
                      <div>
                        <label className="block text-ink-700 font-bold mb-1">{t('الجنس:', 'Gender:')}</label>
                        <select
                          value={createGender}
                          onChange={(e) => setCreateGender(e.target.value as 'male' | 'female')}
                          className="w-full p-3 bg-bone-50 border border-ink-300 rounded-xl font-bold text-ink-900 cursor-pointer"
                        >
                          <option value="male">{t('ذكر', 'Male')}</option>
                          <option value="female">{t('أنثى', 'Female')}</option>
                        </select>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 bg-pine-700 hover:bg-pine-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>{t('حفظ الملف على هذا الجهاز', 'Save Profile on This Device')}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="bg-bone-100 border-t border-pine-200 px-4 sm:px-6 py-3 flex items-center justify-between text-xs text-ink-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-pine-700 flex-shrink-0" />
            <span>{t('الملف المحلي على هذا الجهاز — والحساب السحابي الآمن متاح من تبويب الحساب', 'Local profile on this device — Secure Cloud Account available in the Account tab')}</span>
          </div>

          <button
            onClick={closePatientPortal}
            className="px-4 py-2 bg-ink-900 hover:bg-ink-700 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            {t('إغلاق البوابة', 'Close Portal')}
          </button>
        </div>

    </Modal>
  );
}
