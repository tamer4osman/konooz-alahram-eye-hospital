import { PatientProfile } from '@/data/patientPortalData';

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function asEmergencyContact(value: unknown): PatientProfile['emergencyContact'] {
  const raw = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
  return {
    name: asString(raw.name),
    relationAr: asString(raw.relationAr),
    relationEn: asString(raw.relationEn),
    phone: asString(raw.phone),
  };
}

function asRefractiveData(value: unknown): PatientProfile['refractiveData'] {
  const raw = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
  return {
    odSphere: asString(raw.odSphere),
    odCyl: asString(raw.odCyl),
    odAxis: asString(raw.odAxis),
    osSphere: asString(raw.osSphere),
    osCyl: asString(raw.osCyl),
    osAxis: asString(raw.osAxis),
    lastChecked: asString(raw.lastChecked),
  };
}

function asCommunicationPreferences(value: unknown): PatientProfile['communicationPreferences'] {
  const raw = (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>;
  return {
    emailNotifications: raw.emailNotifications !== false,
    whatsappAlerts: raw.whatsappAlerts !== false,
    appointmentReminders: raw.appointmentReminders !== false,
    eyeDropScheduleAlerts: raw.eyeDropScheduleAlerts !== false,
    postOpCareGuides: raw.postOpCareGuides !== false,
    newsletterSubscribed: raw.newsletterSubscribed === true,
    newsletterTopics: asStringArray(raw.newsletterTopics),
  };
}

/**
 * Maps the patient DB row served by /api/patient/auth/me to the portal DTO.
 * Fields the server does not store yet (appointments, prescriptions,
 * notification history, clinical extras) fall back to safe empty values so
 * the tab components keep rendering without crashing.
 */
export function normalizeProfile(raw: Record<string, unknown> | null, email: string): PatientProfile {
  const row = raw ?? {};
  const fullNameAr = asString(row.fullNameAr);
  const phone = asString(row.phone);
  return {
    id: asString(row.id, email),
    nationalId: asString(row.nationalId),
    fullNameAr: fullNameAr || email,
    fullNameEn: asString(row.fullNameEn, fullNameAr || email),
    email: asString(row.email, email),
    phone,
    whatsappNumber: asString(row.whatsappNumber, phone),
    dateOfBirth: asString(row.dateOfBirth),
    gender: row.gender === 'female' ? 'female' : 'male',
    bloodGroup: asString(row.bloodGroup),
    cityAr: asString(row.cityAr, 'بنغازي'),
    cityEn: asString(row.cityEn, 'Benghazi'),
    insuranceProviderId: asString(row.insuranceProviderId),
    insuranceProviderName: asString(row.insuranceProviderName),
    insurancePolicyNo: asString(row.insurancePolicyNo),
    allergiesAr: asStringArray(row.allergiesAr),
    allergiesEn: asStringArray(row.allergiesEn),
    chronicConditionsAr: asStringArray(row.chronicConditionsAr),
    chronicConditionsEn: asStringArray(row.chronicConditionsEn),
    emergencyContact: asEmergencyContact(row.emergencyContact),
    refractiveData: asRefractiveData(row.refractiveData),
    communicationPreferences: asCommunicationPreferences(row.communicationPreferences),
    appointments: Array.isArray(row.appointments) ? (row.appointments as PatientProfile['appointments']) : [],
    prescriptions: Array.isArray(row.prescriptions) ? (row.prescriptions as PatientProfile['prescriptions']) : [],
    notificationHistory: Array.isArray(row.notificationHistory) ? (row.notificationHistory as PatientProfile['notificationHistory']) : [],
  };
}
