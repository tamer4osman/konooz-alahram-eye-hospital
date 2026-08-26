'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { usePortalActions } from './usePortalActions';
import { Lock, User, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

interface AuthTabProps {
  notify: (message: string, timeoutMs?: number) => void;
  /** Called after a device-local profile is created so the portal can switch tabs. */
  onProfileCreated: () => void;
}

export default function AuthTab({ notify, onProfileCreated }: AuthTabProps) {
  const { lang, t, setActiveView } = useLanguage();
  const {
    currentPatient, createLocalProfile, closePatientPortal,
    setActivePortalTab, serverUser, isServerAuthenticated, loginWithServer, registerWithServer, logoutServer
  } = usePatientAuth();
  const { removeLocalProfile } = usePortalActions(notify);

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
  const [authConsent, setAuthConsent] = useState(false);

  const handleServerAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);
    if (authMode === 'register' && !authConsent) {
      setAuthError(t('يجب الموافقة على سياسة الخصوصية أولاً', 'You must agree to the Privacy Policy first'));
      return;
    }
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
      onProfileCreated();
      notify(lang === 'ar' ? res.messageAr! : res.messageEn!, 4500);
    } else {
      setCreateError(lang === 'ar' ? (res.errorAr || 'تعذر إنشاء الملف.') : (res.errorEn || 'Could not create profile.'));
    }
  };

  return (
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
            {serverUser?.role === 'ADMIN' && (
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

            {authMode === 'register' && (
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={authConsent}
                  onChange={(e) => setAuthConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-ink-300 text-pine-700 focus:ring-pine-500"
                  required
                />
                <span className="text-[11px] text-ink-500 leading-tight">
                  {t(
                    'أقر بمتابعة إنشاء حسابي وأوافق على ',
                    'I agree to the '
                  )}
                  <a
                    href={`/${lang}/privacy`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-pine-700 underline hover:text-pine-900"
                  >
                    {t('سياسة الخصوصية وحماية البيانات', 'Privacy Policy')}
                  </a>
                  {t(' procedures.', ' procedures.')}
                </span>
              </label>
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
              onClick={removeLocalProfile}
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
  );
}
