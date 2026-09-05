'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AUTH_MESSAGES } from '@/data/authMessages';

interface StaffUser {
  id: string;
  email: string;
  role: 'STAFF' | 'ADMIN';
  permissions?: string[];
}

interface StaffAuthContextType {
  serverUser: StaffUser | null;
  isServerAuthenticated: boolean;
  /** True once the mount-time /me check has resolved — guards against a login-form flash. */
  sessionChecked: boolean;
  loginWithServer: (email: string, password: string) => Promise<{ success: boolean; messageAr: string; messageEn: string }>;
  logoutServer: () => Promise<void>;
}

const StaffAuthContext = createContext<StaffAuthContextType | undefined>(undefined);

export function StaffAuthProvider({ children }: { children: React.ReactNode }) {
  const [serverUser, setServerUser] = useState<StaffUser | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    // Always resolve through the server: konooz_staff_session is httpOnly, so
    // document.cookie can never see it — the /me fetch is the only honest check.
    fetch('/api/staff/auth/me')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json?.data?.user) {
          setServerUser({
            id: json.data.user.id,
            email: json.data.user.email,
            role: json.data.user.role,
            permissions: json.data.user.permissions,
          });
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

  const loginWithServer = useCallback(async (email: string, password: string) => {
    try {
      const res = await fetch('/api/staff/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password })
      });
      const json = await res.json();
      if (res.ok && json?.data?.user) {
        setServerUser({
          id: json.data.user.id,
          email: json.data.user.email,
          role: json.data.user.role,
        });
        return { success: true, messageAr: AUTH_MESSAGES.loginSuccess.ar, messageEn: AUTH_MESSAGES.loginSuccess.en };
      }
      const err = json?.error;
      return { success: false, messageAr: err?.messageAr ?? AUTH_MESSAGES.invalidCredentials.ar, messageEn: err?.messageEn ?? AUTH_MESSAGES.invalidCredentials.en };
    } catch {
      return { success: false, messageAr: 'تعذر الاتصال بالخادم، حاول مجدداً', messageEn: 'Could not reach the server, please retry' };
    }
  }, []);

  const logoutServer = useCallback(async () => {
    try {
      await fetch('/api/staff/auth/logout', { method: 'POST' });
    } catch {
      // cookie cleared server-side regardless
    }
    setServerUser(null);
  }, []);

  return (
    <StaffAuthContext.Provider
      value={{
        serverUser,
        isServerAuthenticated: !!serverUser,
        sessionChecked,
        loginWithServer,
        logoutServer,
      }}
    >
      {children}
    </StaffAuthContext.Provider>
  );
}

export function useStaffAuth() {
  const context = useContext(StaffAuthContext);
  if (!context) {
    throw new Error('useStaffAuth must be used within a StaffAuthProvider');
  }
  return context;
}
