'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useStaffAuth } from '@/context/StaffAuthContext';
import { Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StaffLoginForm() {
  const { t } = useLanguage();
  const { loginWithServer } = useStaffAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res = await loginWithServer(email, password);
    setBusy(false);
    if (res.success) {
      setPassword('');
      // Middleware (D11) governs the session world; a reload lands the staff
      // session on /ops with a live session instead of a client-side jump.
      window.location.reload();
    } else {
      setError(t(res.messageAr, res.messageEn));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-700 rounded-2xl p-8 space-y-5">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-pine-800 text-brass-300 mx-auto flex items-center justify-center border border-brass-500/30">
            <Lock className="w-7 h-7" aria-hidden="true" />
          </div>
          <h1 className="text-lg font-extrabold text-white">
            {t('مركز العمليات للطاقم المصرح لهم فقط', 'Operations Hub — Authorized Staff Only')}
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            {t(
              'هذه المنطقة مخصصة لطاقم المستشفى. المرضى يمكنهم تسجيل الدخول من بوابة المريض.',
              'This area is for hospital staff. Patients can sign in from the patient portal.'
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label htmlFor="staff-email" className="block text-slate-300 font-bold mb-1">
              {t('البريد الإلكتروني *', 'Email Address *')}
            </label>
            <input
              id="staff-email"
              type="email"
              required
              dir="ltr"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@konooz.test"
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-xl font-bold text-white focus:ring-2 focus:ring-pine-500 outline-hidden"
            />
          </div>

          <div>
            <label htmlFor="staff-password" className="block text-slate-300 font-bold mb-1">
              {t('كلمة المرور *', 'Password *')}
            </label>
            <input
              id="staff-password"
              type="password"
              required
              dir="ltr"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-800 border border-slate-600 rounded-xl font-bold text-white focus:ring-2 focus:ring-pine-500 outline-hidden"
            />
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-pine-700 hover:bg-pine-600 disabled:opacity-60 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" aria-hidden="true" />
            <span>
              {busy
                ? t('جارٍ المعالجة…', 'Processing…')
                : t('تسجيل الدخول كطاقم', 'Staff Sign In')}
            </span>
          </button>
        </form>

        <p className="text-[11px] text-slate-500 text-center leading-relaxed">
          <CheckCircle2 className="w-3 h-3 inline-block me-1" aria-hidden="true" />
          {t(
            'حسابات الطاقم تُنشأ من مدير النظام فقط — لا يوجد تسجيل ذاتي.',
            'Staff accounts are provisioned by the system administrator only — no self-registration.'
          )}
        </p>
      </div>
    </div>
  );
}
