'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { PatientProfile } from '@/data/patientPortalData';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';
import { AUTH_MESSAGES } from '@/data/authMessages';
import { normalizeProfile } from '@/lib/patient/profile-normalizer';

interface ServerPatientUser {
  id: string;
  email: string;
}

type PatientMeResponse = {
  data?: {
    user?: { id?: string; email?: string };
    profile?: Record<string, unknown>;
  };
};

interface PatientAuthContextType {
  profile: PatientProfile | null;
  /** Alias of `profile` kept for the existing tab components. */
  currentPatient: PatientProfile | null;
  isLoggedIn: boolean;

  serverUser: ServerPatientUser | null;
  isServerAuthenticated: boolean;
  /** False until the mount-time /me resolves — prevents a login-form flash. */
  sessionChecked: boolean;

  loginWithServer: (email: string, password: string) => Promise<{ success: boolean; messageAr: string; messageEn: string }>;
  registerWithServer: (params: {
    fullNameAr: string;
    email: string;
    password: string;
    phone?: string;
    gender?: 'male' | 'female';
    consent?: boolean;
  }) => Promise<{ success: boolean; messageAr: string; messageEn: string }>;
  logoutServer: () => Promise<void>;

  /** Optimistic local merge, then PATCH /api/patient/profile; reverts on failure. */
  updateProfile: (updates: Partial<PatientProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;

  toggleNotificationPref: (key: keyof PatientProfile['communicationPreferences']) => void;
  toggleNewsletterTopic: (topicId: string) => void;

  // Logs a prepared alert in the patient's history and opens WhatsApp with a
  // pre-filled draft. No message is delivered automatically — automated
  // delivery arrives with backend integration.
  sendLiveNotificationSimulation: (channel: 'whatsapp' | 'email', titleAr: string, titleEn: string, bodyAr: string, bodyEn: string) => void;
  sendNotification: (channel: 'whatsapp' | 'email', titleAr: string, titleEn: string, body: string) => void;

  // General newsletter visitors (in-memory only, no device storage)
  newsletterSubscribers: Array<{ email: string; whatsapp: string; name: string; date: string }>;
  subscribeNewsletter: (email: string, whatsapp: string, name: string) => { success: boolean; messageAr: string; messageEn: string };

  openWhatsAppAlert: (messageText: string) => void;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [serverUser, setServerUser] = useState<ServerPatientUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<Array<{ email: string; whatsapp: string; name: string; date: string }>>([]);

  useEffect(() => {
    let cancelled = false;
    // konooz_patient_session is httpOnly, so document.cookie can never see it —
    // the /me fetch is the only honest session check. Always fetch on mount.
    fetch('/api/patient/auth/me')
      .then(async (res) => {
        if (!res.ok || cancelled) return;
        const json = (await res.json()) as PatientMeResponse;
        const user = json?.data?.user;
        if (!cancelled && user?.id && user?.email) {
          setServerUser({ id: user.id, email: user.email });
          setProfile(normalizeProfile(json?.data?.profile ?? null, user.email));
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSessionChecked(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/patient/auth/me');
      // 200 user:null is the silent-probe "not logged in" response (and the
      // result of an expired session) — clear state, same as !res.ok.
      const json = res.ok ? ((await res.json()) as PatientMeResponse) : null;
      const user = json?.data?.user;
      if (!user?.id || !user?.email) {
        setServerUser(null);
        setProfile(null);
        return;
      }
      setServerUser({ id: user.id, email: user.email });
      setProfile(normalizeProfile(json?.data?.profile ?? null, user.email));
    } catch {
      setServerUser(null);
      setProfile(null);
    }
  }, []);

  const loginWithServer = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/patient/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const json = (await res.json()) as PatientMeResponse & { error?: { messageAr?: string; messageEn?: string } };
      if (res.ok && json?.data?.user?.id && json.data.user.email) {
        setServerUser({ id: json.data.user.id, email: json.data.user.email });
        await refreshProfile();
        return { success: true, messageAr: AUTH_MESSAGES.loginSuccess.ar, messageEn: AUTH_MESSAGES.loginSuccess.en };
      }
      const err = json?.error;
      return {
        success: false,
        messageAr: err?.messageAr ?? AUTH_MESSAGES.invalidCredentials.ar,
        messageEn: err?.messageEn ?? AUTH_MESSAGES.invalidCredentials.en,
      };
    } catch {
      return { success: false, messageAr: 'تعذر الاتصال بالخادم، حاول مجدداً', messageEn: 'Could not reach the server, please retry' };
    }
  }, [refreshProfile]);

  const registerWithServer = useCallback(async (params: {
    fullNameAr: string;
    email: string;
    password: string;
    phone?: string;
    gender?: 'male' | 'female';
    consent?: boolean;
  }) => {
    try {
      const res = await fetch('/api/patient/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullNameAr: params.fullNameAr.trim(),
          email: params.email.trim().toLowerCase(),
          password: params.password,
          phone: params.phone || undefined,
          gender: params.gender,
          consent: params.consent ?? true,
        }),
      });
      const json = (await res.json()) as PatientMeResponse & { error?: { messageAr?: string; messageEn?: string } };
      if (res.ok && json?.data?.user?.id && json.data.user.email) {
        setServerUser({ id: json.data.user.id, email: json.data.user.email });
        await refreshProfile();
        return { success: true, messageAr: AUTH_MESSAGES.registerSuccess.ar, messageEn: AUTH_MESSAGES.registerSuccess.en };
      }
      const err = json?.error;
      return {
        success: false,
        messageAr: err?.messageAr ?? 'تعذر إنشاء الحساب',
        messageEn: err?.messageEn ?? 'Could not create account',
      };
    } catch {
      return { success: false, messageAr: 'تعذر الاتصال بالخادم، حاول مجدداً', messageEn: 'Could not reach the server, please retry' };
    }
  }, [refreshProfile]);

  const logoutServer = useCallback(async () => {
    try {
      await fetch('/api/patient/auth/logout', { method: 'POST' });
    } catch {
      // cookie is cleared server-side regardless
    }
    setServerUser(null);
    setProfile(null);
  }, []);

  const updateProfile = useCallback(async (updates: Partial<PatientProfile>): Promise<boolean> => {
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
    try {
      const res = await fetch('/api/patient/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) {
        await refreshProfile();
        return false;
      }
      return true;
    } catch {
      await refreshProfile();
      return false;
    }
  }, [refreshProfile]);

  const toggleNotificationPref = useCallback((key: keyof PatientProfile['communicationPreferences']) => {
    if (!profile) return;
    const communicationPreferences = {
      ...profile.communicationPreferences,
      [key]: !profile.communicationPreferences[key],
    };
    void updateProfile({ communicationPreferences });
  }, [profile, updateProfile]);

  const toggleNewsletterTopic = useCallback((topicId: string) => {
    if (!profile) return;
    const existing = profile.communicationPreferences.newsletterTopics || [];
    const updatedTopics = existing.includes(topicId)
      ? existing.filter((topic) => topic !== topicId)
      : [...existing, topicId];
    const communicationPreferences = {
      ...profile.communicationPreferences,
      newsletterTopics: updatedTopics,
      newsletterSubscribed: updatedTopics.length > 0,
    };
    void updateProfile({ communicationPreferences });
  }, [profile, updateProfile]);

  const sendLiveNotificationSimulation = useCallback((
    channel: 'whatsapp' | 'email',
    titleAr: string,
    titleEn: string,
    bodyAr: string,
    bodyEn: string
  ) => {
    if (!profile) return;
    const newNotif = {
      id: `notif-${Date.now()}`,
      channel,
      titleAr,
      titleEn,
      bodyAr,
      bodyEn,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent' as const,
    };
    void updateProfile({ notificationHistory: [newNotif, ...(profile.notificationHistory || [])] });
  }, [profile, updateProfile]);

  const sendNotification = useCallback((channel: 'whatsapp' | 'email', titleAr: string, titleEn: string, body: string) => {
    sendLiveNotificationSimulation(channel, titleAr, titleEn, body, body);
  }, [sendLiveNotificationSimulation]);

  const subscribeNewsletter = useCallback((email: string, whatsapp: string, name: string) => {
    if (!email && !whatsapp) {
      return {
        success: false,
        messageAr: 'يرجى إدخال البريد الإلكتروني أو رقم الواتساب للاشتراك',
        messageEn: 'Please provide either an email or WhatsApp number to subscribe',
      };
    }

    const newSub = {
      email: email || 'N/A',
      whatsapp: whatsapp || 'N/A',
      name: name || 'مشترك جديد',
      date: new Date().toISOString().split('T')[0],
    };
    setNewsletterSubscribers((prev) => [newSub, ...prev]);

    return {
      success: true,
      messageAr: 'تم تسجيل اشتراكك بنجاح في نشرة كنوز الأهرام وتنبيهات الواتساب!',
      messageEn: 'Successfully subscribed to Konooz Al-Ahram Newsletter & WhatsApp alerts!',
    };
  }, []);

  const openWhatsAppAlert = useCallback((messageText: string) => {
    const hospitalWhatsApp = HOSPITAL_CONTACTS.primaryWhatsApp.replace(/[^0-9]/g, '');
    const targetPhone = profile?.whatsappNumber?.replace(/[^0-9]/g, '') || hospitalWhatsApp;
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  }, [profile]);

  const value = useMemo(() => ({
    profile,
    currentPatient: profile,
    isLoggedIn: !!profile,
    serverUser,
    isServerAuthenticated: !!serverUser,
    sessionChecked,
    loginWithServer,
    registerWithServer,
    logoutServer,
    updateProfile,
    refreshProfile,
    toggleNotificationPref,
    toggleNewsletterTopic,
    sendLiveNotificationSimulation,
    sendNotification,
    newsletterSubscribers,
    subscribeNewsletter,
    openWhatsAppAlert,
  }), [
    profile,
    serverUser,
    sessionChecked,
    loginWithServer,
    registerWithServer,
    logoutServer,
    updateProfile,
    refreshProfile,
    toggleNotificationPref,
    toggleNewsletterTopic,
    sendLiveNotificationSimulation,
    sendNotification,
    newsletterSubscribers,
    subscribeNewsletter,
    openWhatsAppAlert,
  ]);

  return (
    <PatientAuthContext.Provider value={value}>
      {children}
    </PatientAuthContext.Provider>
  );
}

export function usePatientAuth() {
  const context = useContext(PatientAuthContext);
  if (!context) {
    throw new Error('usePatientAuth must be used within a PatientAuthProvider');
  }
  return context;
}
