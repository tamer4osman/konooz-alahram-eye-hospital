'use client';

import React, { createContext, useContext, useState, useMemo, useEffect, useSyncExternalStore } from 'react';
import { PatientProfile } from '@/data/patientPortalData';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';
import { AUTH_MESSAGES } from '@/data/authMessages';

type PortalTab = 'profile' | 'appointments' | 'prescriptions' | 'notifications' | 'newsletter' | 'auth';

const EMPTY_SNAPSHOT = 'null';

function subscribePatientStorage(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener('konooz_patient_profile_changed', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('konooz_patient_profile_changed', callback);
  };
}

function getPatientSnapshot(): string {
  if (typeof window === 'undefined') return EMPTY_SNAPSHOT;
  try {
    const saved = localStorage.getItem('konooz_patient_profile');
    if (saved !== null) {
      return saved;
    }
  } catch {
    // ignore
  }
  return EMPTY_SNAPSHOT;
}

function getPatientServerSnapshot(): string {
  return EMPTY_SNAPSHOT;
}

interface PatientAuthContextType {
  currentPatient: PatientProfile | null;
  isLoggedIn: boolean;

  // Server account (email + password, httpOnly session cookie)
  serverUser: { id: string; email: string; role: 'PATIENT' | 'STAFF' | 'ADMIN' } | null;
  isServerAuthenticated: boolean;
  loginWithServer: (email: string, password: string) => Promise<{ success: boolean; messageAr: string; messageEn: string }>;
  registerWithServer: (params: { fullNameAr: string; email: string; password: string; phone?: string; gender?: 'male' | 'female' }) => Promise<{ success: boolean; messageAr: string; messageEn: string }>;
  logoutServer: () => Promise<void>;

  // Device-local profile: no server round-trip. Complements the server account.
  createLocalProfile: (params: {
    fullNameAr: string;
    email: string;
    phone: string;
    cityAr?: string;
    gender?: 'male' | 'female';
  }) => { success: boolean; messageAr?: string; messageEn?: string; errorAr?: string; errorEn?: string };

  logout: () => void;
  updateProfile: (updates: Partial<PatientProfile>) => void;
  toggleNotificationPref: (key: keyof PatientProfile['communicationPreferences']) => void;
  toggleNewsletterTopic: (topicId: string) => void;

  // Logs a prepared alert locally and opens WhatsApp with a pre-filled draft.
  sendLiveNotificationSimulation: (channel: 'whatsapp' | 'email', titleAr: string, titleEn: string, bodyAr: string, bodyEn: string) => void;
  sendNotification: (channel: 'whatsapp' | 'email', titleAr: string, titleEn: string, body: string) => void;

  addAppointmentToCurrentPatient: (appointmentData: {
    doctorNameAr: string;
    doctorNameEn: string;
    specialtyAr: string;
    specialtyEn: string;
    date: string;
    time: string;
    status: 'scheduled' | 'confirmed' | 'in_queue' | 'completed';
    locationAr?: string;
    locationEn?: string;
    queueNumber?: string;
  }) => void;

  // Modal UI state
  isPatientPortalOpen: boolean;
  openPatientPortal: (tab?: PortalTab) => void;
  closePatientPortal: () => void;
  activePortalTab: PortalTab;
  setActivePortalTab: (tab: PortalTab) => void;

  // General Newsletter Subscribers
  newsletterSubscribers: Array<{ email: string; whatsapp: string; name: string; date: string }>;
  subscribeNewsletter: (email: string, whatsapp: string, name: string) => { success: boolean; messageAr: string; messageEn: string };

  // Quick WhatsApp Trigger Helper
  openWhatsAppAlert: (messageText: string) => void;
}

const PatientAuthContext = createContext<PatientAuthContextType | undefined>(undefined);

function buildLocalProfile(params: {
  fullNameAr: string;
  email: string;
  phone: string;
  cityAr?: string;
  gender?: 'male' | 'female';
}): PatientProfile {
  const cleanName = params.fullNameAr.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPhone = params.phone.trim();

  return {
    id: `local-${Date.now()}`,
    nationalId: '',
    fullNameAr: cleanName,
    fullNameEn: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    whatsappNumber: cleanPhone,
    dateOfBirth: '',
    gender: params.gender || 'male',
    bloodGroup: '',
    cityAr: params.cityAr?.trim() || 'بنغازي',
    cityEn: 'Benghazi',
    insuranceProviderId: '',
    insuranceProviderName: '',
    insurancePolicyNo: '',
    allergiesAr: [],
    allergiesEn: [],
    chronicConditionsAr: [],
    chronicConditionsEn: [],
    emergencyContact: {
      name: '',
      relationAr: '',
      relationEn: '',
      phone: ''
    },
    refractiveData: {
      odSphere: '',
      odCyl: '',
      odAxis: '',
      osSphere: '',
      osCyl: '',
      osAxis: '',
      lastChecked: ''
    },
    communicationPreferences: {
      emailNotifications: true,
      whatsappAlerts: true,
      appointmentReminders: true,
      eyeDropScheduleAlerts: true,
      postOpCareGuides: true,
      queueTurnAlerts: true,
      newsletterSubscribed: false,
      newsletterTopics: []
    },
    appointments: [],
    prescriptions: [],
    notificationHistory: []
  };
}

export function PatientAuthProvider({ children }: { children: React.ReactNode }) {
  // Synchronized external store for client/server hydration stability
  const currentPatientRaw = useSyncExternalStore(
    subscribePatientStorage,
    getPatientSnapshot,
    getPatientServerSnapshot
  );

  const currentPatient = useMemo<PatientProfile | null>(() => {
    try {
      if (!currentPatientRaw || currentPatientRaw === EMPTY_SNAPSHOT) return null;
      return JSON.parse(currentPatientRaw) as PatientProfile;
    } catch {
      return null;
    }
  }, [currentPatientRaw]);

  const [isPatientPortalOpen, setIsPatientPortalOpen] = useState<boolean>(false);
  const [activePortalTab, setActivePortalTab] = useState<PortalTab>('profile');
  const [newsletterSubscribers, setNewsletterSubscribers] = useState<Array<{ email: string; whatsapp: string; name: string; date: string }>>([]);
  const [serverUser, setServerUser] = useState<{ id: string; email: string; role: 'PATIENT' | 'STAFF' | 'ADMIN' } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const hasSession = document.cookie.split(';').some((c) => c.trim().startsWith('konooz_auth='));
    if (!hasSession) return;
    fetch('/api/auth/me')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.data?.user) setServerUser({ id: json.data.user.id, email: json.data.user.email, role: json.data.user.role });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const loginWithServer = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const json = await res.json();
      if (res.ok && json?.data?.user) {
        setServerUser({ id: json.data.user.id, email: json.data.user.email, role: json.data.user.role });
        return { success: true, messageAr: AUTH_MESSAGES.loginSuccess.ar, messageEn: AUTH_MESSAGES.loginSuccess.en };
      }
      const err = json?.error;
      return { success: false, messageAr: err?.messageAr ?? AUTH_MESSAGES.invalidCredentials.ar, messageEn: err?.messageEn ?? AUTH_MESSAGES.invalidCredentials.en };
    } catch {
      return { success: false, messageAr: 'تعذر الاتصال بالخادم، حاول مجدداً', messageEn: 'Could not reach the server, please retry' };
    }
  };

  const registerWithServer = async ({ fullNameAr, email, password, phone, gender }: { fullNameAr: string; email: string; password: string; phone?: string; gender?: 'male' | 'female' }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullNameAr: fullNameAr.trim(), email: email.trim().toLowerCase(), password, phone: phone || undefined, gender, consent: true })
      });
      const json = await res.json();
      if (res.ok && json?.data?.user) {
        setServerUser({ id: json.data.user.id, email: json.data.user.email, role: 'PATIENT' });
        return { success: true, messageAr: AUTH_MESSAGES.registerSuccess.ar, messageEn: AUTH_MESSAGES.registerSuccess.en };
      }
      const err = json?.error;
      return { success: false, messageAr: err?.messageAr ?? 'تعذر إنشاء الحساب', messageEn: err?.messageEn ?? 'Could not create account' };
    } catch {
      return { success: false, messageAr: 'تعذر الاتصال بالخادم، حاول مجدداً', messageEn: 'Could not reach the server, please retry' };
    }
  };

  const logoutServer = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // cookie cleared client-side regardless
    }
    setServerUser(null);
  };

  const savePatient = (patient: PatientProfile | null) => {
    try {
      if (typeof window !== 'undefined') {
        if (patient) {
          localStorage.setItem('konooz_patient_profile', JSON.stringify(patient));
        } else {
          localStorage.removeItem('konooz_patient_profile');
        }
        window.dispatchEvent(new Event('konooz_patient_profile_changed'));
      }
    } catch {
      // ignore
    }
  };

  const createLocalProfile = ({
    fullNameAr,
    email,
    phone,
    cityAr,
    gender
  }: {
    fullNameAr: string;
    email: string;
    phone: string;
    cityAr?: string;
    gender?: 'male' | 'female';
  }) => {
    const cleanName = fullNameAr.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      return {
        success: false,
        errorAr: 'الاسم الكامل مطلوب لفتح الملف الطبي.',
        errorEn: 'Full patient name is required.'
      };
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return {
        success: false,
        errorAr: 'يرجى إدخال بريد إلكتروني صالح لاستلام التقارير مستقبلاً.',
        errorEn: 'Please provide a valid email address for future reports.'
      };
    }

    if (!cleanPhone) {
      return {
        success: false,
        errorAr: 'رقم الهاتف والواتساب مطلوب لتأكيد المواعيد.',
        errorEn: 'Phone / WhatsApp number is required for appointment alerts.'
      };
    }

    savePatient(buildLocalProfile({ fullNameAr: cleanName, email: cleanEmail, phone: cleanPhone, cityAr, gender }));

    setNewsletterSubscribers((prev) => [
      { email: cleanEmail, whatsapp: cleanPhone, name: cleanName, date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);

    return {
      success: true,
      messageAr: 'تم إنشاء ملفك المحلي على هذا الجهاز. يمكنك أيضاً إنشاء حساب سحابي بكلمة مرور من تبويب الحساب.',
      messageEn: 'Local profile created on this device. You can also create a password-protected cloud account from the Account tab.'
    };
  };

  const logout = () => {
    savePatient(null);
    setActivePortalTab('auth');
  };

  const updateProfile = (updates: Partial<PatientProfile>) => {
    if (!currentPatient) return;
    const updated = { ...currentPatient, ...updates };
    savePatient(updated);
  };

  const toggleNotificationPref = (key: keyof PatientProfile['communicationPreferences']) => {
    if (!currentPatient) return;
    const currentVal = currentPatient.communicationPreferences[key];
    const updatedPreferences = {
      ...currentPatient.communicationPreferences,
      [key]: !currentVal
    };
    updateProfile({ communicationPreferences: updatedPreferences });
  };

  const toggleNewsletterTopic = (topicId: string) => {
    if (!currentPatient) return;
    const existing = currentPatient.communicationPreferences.newsletterTopics || [];
    const updatedTopics = existing.includes(topicId)
      ? existing.filter((t) => t !== topicId)
      : [...existing, topicId];

    const updatedPreferences = {
      ...currentPatient.communicationPreferences,
      newsletterTopics: updatedTopics,
      newsletterSubscribed: updatedTopics.length > 0
    };
    updateProfile({ communicationPreferences: updatedPreferences });
  };

  // Records the prepared alert in the local history log and opens WhatsApp with
  // a pre-filled draft when the channel is WhatsApp. No message is delivered
  // automatically — automated delivery arrives with backend integration.
  const sendLiveNotificationSimulation = (
    channel: 'whatsapp' | 'email',
    titleAr: string,
    titleEn: string,
    bodyAr: string,
    bodyEn: string
  ) => {
    if (!currentPatient) return;
    const newNotif = {
      id: `notif-${Date.now()}`,
      channel,
      titleAr,
      titleEn,
      bodyAr,
      bodyEn,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent' as const
    };

    const updatedHistory = [newNotif, ...(currentPatient.notificationHistory || [])];
    updateProfile({ notificationHistory: updatedHistory });
  };

  const sendNotification = (channel: 'whatsapp' | 'email', titleAr: string, titleEn: string, body: string) => {
    sendLiveNotificationSimulation(channel, titleAr, titleEn, body, body);
  };

  const addAppointmentToCurrentPatient = (appointmentData: {
    doctorNameAr: string;
    doctorNameEn: string;
    specialtyAr: string;
    specialtyEn: string;
    date: string;
    time: string;
    status: 'scheduled' | 'confirmed' | 'in_queue' | 'completed';
    locationAr?: string;
    locationEn?: string;
    queueNumber?: string;
  }) => {
    if (!currentPatient) return;
    const newApt = {
      id: `apt-${Date.now()}`,
      ticketNumber: appointmentData.queueNumber || `KZ-${Math.floor(1000 + Math.random() * 9000)}`,
      doctorNameAr: appointmentData.doctorNameAr,
      doctorNameEn: appointmentData.doctorNameEn,
      specialtyAr: appointmentData.specialtyAr,
      specialtyEn: appointmentData.specialtyEn,
      date: appointmentData.date,
      time: appointmentData.time,
      status: appointmentData.status,
      room: appointmentData.locationAr || 'عيادات العيون التخصصية - الدور الأرضي',
      instructionsAr: 'تم تسجيل طلب الحجز محلياً. سيتم تأكيده عبر الواتساب بعد مراجعة الاستقبال.',
      instructionsEn: 'Booking request recorded locally. Reception will confirm via WhatsApp.'
    };

    const updatedApts = [newApt, ...(currentPatient.appointments || [])];
    updateProfile({ appointments: updatedApts });
  };

  const openPatientPortal = (tab?: PortalTab) => {
    const requested: PortalTab = tab || 'profile';
    // Patient-data tabs require a local profile; fall back to the auth view otherwise.
    if (!currentPatient && requested !== 'newsletter') {
      setActivePortalTab('auth');
    } else {
      setActivePortalTab(requested);
    }
    setIsPatientPortalOpen(true);
  };

  const closePatientPortal = () => {
    setIsPatientPortalOpen(false);
  };

  const subscribeNewsletter = (email: string, whatsapp: string, name: string) => {
    if (!email && !whatsapp) {
      return {
        success: false,
        messageAr: 'يرجى إدخال البريد الإلكتروني أو رقم الواتساب للاشتراك',
        messageEn: 'Please provide either an email or WhatsApp number to subscribe'
      };
    }

    const newSub = {
      email: email || 'N/A',
      whatsapp: whatsapp || 'N/A',
      name: name || 'مشترك جديد',
      date: new Date().toISOString().split('T')[0]
    };

    setNewsletterSubscribers((prev) => [newSub, ...prev]);

    if (currentPatient) {
      updateProfile({
        communicationPreferences: {
          ...currentPatient.communicationPreferences,
          newsletterSubscribed: true,
          emailNotifications: email ? true : currentPatient.communicationPreferences.emailNotifications,
          whatsappAlerts: whatsapp ? true : currentPatient.communicationPreferences.whatsappAlerts
        }
      });
    }

    return {
      success: true,
      messageAr: 'تم تسجيل اشتراكك بنجاح في نشرة كنوز الأهرام وتنبيهات الواتساب!',
      messageEn: 'Successfully subscribed to Konooz Al-Ahram Newsletter & WhatsApp alerts!'
    };
  };

  const openWhatsAppAlert = (messageText: string) => {
    const hospitalWhatsApp = HOSPITAL_CONTACTS.primaryWhatsApp.replace(/[^0-9]/g, '');
    const targetPhone = currentPatient?.whatsappNumber?.replace(/[^0-9]/g, '') || hospitalWhatsApp;
    const url = `https://wa.me/${targetPhone}?text=${encodeURIComponent(messageText)}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <PatientAuthContext.Provider
      value={{
        currentPatient,
        isLoggedIn: !!currentPatient,
        serverUser,
        isServerAuthenticated: !!serverUser,
        loginWithServer,
        registerWithServer,
        logoutServer,
        createLocalProfile,
        logout,
        updateProfile,
        toggleNotificationPref,
        toggleNewsletterTopic,
        sendLiveNotificationSimulation,
        sendNotification,
        addAppointmentToCurrentPatient,
        isPatientPortalOpen,
        openPatientPortal,
        closePatientPortal,
        activePortalTab,
        setActivePortalTab,
        newsletterSubscribers,
        subscribeNewsletter,
        openWhatsAppAlert
      }}
    >
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
