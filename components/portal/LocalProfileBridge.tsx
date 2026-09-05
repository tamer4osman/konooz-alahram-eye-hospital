'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import { ArchiveRestore, CheckCircle2, Loader2 } from 'lucide-react';

/** One-time device-to-server migration window; past this date the bridge is a dead feature. */
const BRIDGE_SUNSET_ISO = '2026-12-31T00:00:00Z';

const STORAGE_PROFILE_KEY = 'konooz_patient_profile';
const STORAGE_DONE_KEY = 'konooz_local_import_done';
const STORAGE_DISMISSED_KEY = 'konooz_local_import_dismissed';

interface ImportEmergencyContact {
  name: string;
  relationAr: string;
  relationEn: string;
  phone: string;
}

interface ImportCommunicationPreferences {
  emailNotifications: boolean;
  whatsappAlerts: boolean;
  appointmentReminders: boolean;
  eyeDropScheduleAlerts: boolean;
  postOpCareGuides: boolean;
  newsletterSubscribed: boolean;
  newsletterTopics: string[];
}

interface LocalImportPayload {
  allergiesAr?: string[];
  allergiesEn?: string[];
  chronicConditionsAr?: string[];
  chronicConditionsEn?: string[];
  cityAr?: string;
  cityEn?: string;
  whatsappNumber?: string;
  emergencyContact?: ImportEmergencyContact;
  communicationPreferences?: ImportCommunicationPreferences;
}

interface ImportErrorResponse {
  error?: { messageAr?: string; messageEn?: string };
}

const asTrimmedString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;

const asStringArray = (value: unknown): string[] | undefined =>
  Array.isArray(value) && value.every((item): item is string => typeof item === 'string') ? value : undefined;

const asBoolean = (value: unknown): boolean | undefined => (typeof value === 'boolean' ? value : undefined);

function parseEmergencyContact(value: unknown): ImportEmergencyContact | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  const contact = value as Record<string, unknown>;
  const name = typeof contact.name === 'string' ? contact.name : undefined;
  const relationAr = typeof contact.relationAr === 'string' ? contact.relationAr : undefined;
  const relationEn = typeof contact.relationEn === 'string' ? contact.relationEn : undefined;
  const phone = typeof contact.phone === 'string' ? contact.phone : undefined;
  if (name === undefined || relationAr === undefined || relationEn === undefined || phone === undefined) return undefined;
  if (!name.trim() && !phone.trim()) return undefined;
  return { name, relationAr, relationEn, phone };
}

function parseCommunicationPreferences(value: unknown): ImportCommunicationPreferences | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return undefined;
  const prefs = value as Record<string, unknown>;
  const emailNotifications = asBoolean(prefs.emailNotifications);
  const whatsappAlerts = asBoolean(prefs.whatsappAlerts);
  const appointmentReminders = asBoolean(prefs.appointmentReminders);
  const eyeDropScheduleAlerts = asBoolean(prefs.eyeDropScheduleAlerts);
  const postOpCareGuides = asBoolean(prefs.postOpCareGuides);
  const newsletterSubscribed = asBoolean(prefs.newsletterSubscribed);
  const newsletterTopics = asStringArray(prefs.newsletterTopics);
  if (
    emailNotifications === undefined ||
    whatsappAlerts === undefined ||
    appointmentReminders === undefined ||
    eyeDropScheduleAlerts === undefined ||
    postOpCareGuides === undefined ||
    newsletterSubscribed === undefined ||
    newsletterTopics === undefined
  ) {
    return undefined;
  }
  return {
    emailNotifications,
    whatsappAlerts,
    appointmentReminders,
    eyeDropScheduleAlerts,
    postOpCareGuides,
    newsletterSubscribed,
    newsletterTopics,
  };
}

// Only self-authored fields are eligible — appointments/prescriptions saved on
// the device were never hospital records and must not be imported.
function buildImportPayload(raw: Record<string, unknown>): LocalImportPayload {
  const allergiesAr = asStringArray(raw.allergiesAr)?.filter((item) => item.trim().length > 0);
  const allergiesEn = asStringArray(raw.allergiesEn)?.filter((item) => item.trim().length > 0);
  const chronicConditionsAr = asStringArray(raw.chronicConditionsAr)?.filter((item) => item.trim().length > 0);
  const chronicConditionsEn = asStringArray(raw.chronicConditionsEn)?.filter((item) => item.trim().length > 0);
  const emergencyContact = parseEmergencyContact(raw.emergencyContact);
  const communicationPreferences = parseCommunicationPreferences(raw.communicationPreferences);

  return {
    ...(allergiesAr && allergiesAr.length > 0 ? { allergiesAr } : {}),
    ...(allergiesEn && allergiesEn.length > 0 ? { allergiesEn } : {}),
    ...(chronicConditionsAr && chronicConditionsAr.length > 0 ? { chronicConditionsAr } : {}),
    ...(chronicConditionsEn && chronicConditionsEn.length > 0 ? { chronicConditionsEn } : {}),
    ...asTrimmedString(raw.cityAr) !== undefined ? { cityAr: asTrimmedString(raw.cityAr) } : {},
    ...asTrimmedString(raw.cityEn) !== undefined ? { cityEn: asTrimmedString(raw.cityEn) } : {},
    ...asTrimmedString(raw.whatsappNumber) !== undefined ? { whatsappNumber: asTrimmedString(raw.whatsappNumber) } : {},
    ...(emergencyContact ? { emergencyContact } : {}),
    ...(communicationPreferences ? { communicationPreferences } : {}),
  };
}

type BridgeStatus = 'checking' | 'ready' | 'importing' | 'failed' | 'success' | 'done';

export default function LocalProfileBridge() {
  const { t } = useLanguage();
  const { isServerAuthenticated, sessionChecked, refreshProfile } = usePatientAuth();
  const [status, setStatus] = useState<BridgeStatus>('checking');
  const [errorLine, setErrorLine] = useState<string | null>(null);
  const payloadRef = useRef<LocalImportPayload | null>(null);
  const successTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!sessionChecked || !isServerAuthenticated) return;
    if (Date.now() >= new Date(BRIDGE_SUNSET_ISO).getTime()) return;
    try {
      if (localStorage.getItem(STORAGE_DONE_KEY) || localStorage.getItem(STORAGE_DISMISSED_KEY)) return;
      const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
      if (!raw) return;
      const parsed: unknown = JSON.parse(raw);
      if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return;
      const payload = buildImportPayload(parsed as Record<string, unknown>);
      // A local file with nothing importable gets no prompt: an "Import" button
      // that sends an empty payload would promise what it cannot deliver.
      if (Object.keys(payload).length === 0) return;
      payloadRef.current = payload;
      setStatus('ready');
    } catch {
      return; // private browsing or corrupt JSON — never block the portal
    }
  }, [sessionChecked, isServerAuthenticated]);

  useEffect(
    () => () => {
      if (successTimerRef.current !== null) window.clearTimeout(successTimerRef.current);
    },
    []
  );

  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(STORAGE_DISMISSED_KEY, '1');
    } catch {
      // storage write failed (private mode) — unmount for this session only
    }
    setStatus('done');
  }, []);

  const handleImport = useCallback(async () => {
    const payload = payloadRef.current;
    if (!payload) return;
    setStatus('importing');
    setErrorLine(null);
    try {
      const res = await fetch('/api/patient/profile/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const json = (await res.json().catch(() => null)) as ImportErrorResponse | null;
        setErrorLine(
          json?.error?.messageAr && json.error.messageEn
            ? t(json.error.messageAr, json.error.messageEn)
            : t('تعذر استيراد البيانات الآن.', 'The import could not be completed right now.')
        );
        setStatus('failed');
        return;
      }
      try {
        localStorage.setItem(STORAGE_DONE_KEY, '1');
        localStorage.removeItem(STORAGE_PROFILE_KEY);
      } catch {
        // storage write failed — the server copy is authoritative, so the import still stands
      }
      await refreshProfile();
      setStatus('success');
      successTimerRef.current = window.setTimeout(() => setStatus('done'), 5000);
    } catch {
      setErrorLine(t('تعذر الاتصال بالخادم.', 'Could not reach the server.'));
      setStatus('failed');
    }
  }, [refreshProfile, t]);

  if (status === 'checking' || status === 'done') return null;

  if (status === 'success') {
    return (
      <div
        className="bg-pine-50 border border-pine-200 rounded-2xl px-4 py-3 flex items-center gap-2 text-pine-900 text-xs font-bold"
        role="status"
      >
        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
        <span>
          {t(
            'تم استيراد بياناتك وتم حذف النسخة المحلية من هذا الجهاز',
            'Your data was imported and the local copy was deleted from this device'
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-pine-50 border border-pine-200 rounded-2xl p-4 sm:p-5 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-pine-100 border border-pine-200 flex items-center justify-center flex-shrink-0">
          <ArchiveRestore className="w-4 h-4 text-pine-800" />
        </div>
        <div className="space-y-1 min-w-0">
          <h3 className="text-sm font-extrabold text-ink-900">
            {t('وجدنا ملفاً محفوظاً على هذا الجهاز', 'We found a profile saved on this device')}
          </h3>
          <p className="text-xs text-ink-600 leading-relaxed">
            {t(
              'يمكن استيراد بياناتك الشخصية فقط: الحساسيات والأمراض المزمنة وجهة الاتصال في الطوارئ وتفضيلات التواصل. لن تُستورد المواعيد والوصفات المحفوظة على الجهاز لأنها لم تكن سجلات مستشفى.',
              'Only your personal details can be imported: allergies, chronic conditions, emergency contact, and communication preferences. Appointments and prescriptions saved on this device will not be imported because they were never hospital records.'
            )}
          </p>
        </div>
      </div>

      {errorLine && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700 space-y-1" role="alert">
          <p className="font-bold">{errorLine}</p>
          <p>
            {t(
              'بقيت نسختك المحلية محفوظة على هذا الجهاز ويمكنك المحاولة مجدداً.',
              'Your local copy is still saved on this device and you can try again.'
            )}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={handleImport}
          disabled={status === 'importing'}
          className="px-4 py-2 rounded-lg bg-pine-700 hover:bg-pine-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-extrabold flex items-center gap-2 transition-colors cursor-pointer"
        >
          {status === 'importing' ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ArchiveRestore className="w-3.5 h-3.5" />
          )}
          <span>{t('استيراد بياناتي', 'Import my data')}</span>
        </button>
        <button
          onClick={handleDismiss}
          disabled={status === 'importing'}
          className="px-4 py-2 rounded-lg text-ink-600 hover:bg-pine-100 text-xs font-bold transition-colors cursor-pointer"
        >
          {t('تجاهل', 'Dismiss')}
        </button>
      </div>
    </div>
  );
}
