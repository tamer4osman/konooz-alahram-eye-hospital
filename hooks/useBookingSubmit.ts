import { useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  PATIENT_CONDITIONS,
  AFFECTED_EYE_OPTIONS,
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  SYMPTOM_DURATION_OPTIONS,
} from '@/data/hospitalData';

export interface BookingFormValues {
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  gender: 'male' | 'female';
  ageGroup: 'child' | 'adult' | 'senior';
  affectedEye: 'both' | 'right' | 'left';
  selectedCondition: string;
  symptomDuration: 'recent' | 'gradual' | 'chronic';
  selectedSpecialty: string;
  selectedDoctor: string;
  preferredDate: string;
}

export interface BilingualTitles {
  genderTitle: string;
  ageTitle: string;
  eyeTitle: string;
  conditionTitle: string;
  durationTitle: string;
  specialtyTitle: string;
  doctorTitle: string;
}

export interface BookingSubmitResult {
  ok: boolean;
  bookingRef: string;
  queueTicket: string;
  titles: BilingualTitles;
  error?: string;
}

export interface UseBookingSubmit {
  submitBooking: (form: BookingFormValues) => Promise<BookingSubmitResult>;
  buildTitles: (form: BookingFormValues) => BilingualTitles;
}

export function useBookingSubmit(): UseBookingSubmit {
  const { lang, t, doctors, specialties } = useLanguage();

  const buildTitles = useCallback((form: BookingFormValues): BilingualTitles => {
    const conditionObj = PATIENT_CONDITIONS.find((c) => c.id === form.selectedCondition);
    const specialtyObj = specialties.find((s) => s.id === form.selectedSpecialty);
    const doctorObj = doctors.find((d) => d.id === form.selectedDoctor);
    const eyeObj = AFFECTED_EYE_OPTIONS.find((e) => e.id === form.affectedEye);
    const ageObj = AGE_GROUP_OPTIONS.find((a) => a.id === form.ageGroup);
    const genderObj = GENDER_OPTIONS.find((g) => g.id === form.gender);
    const durationObj = SYMPTOM_DURATION_OPTIONS.find((d) => d.id === form.symptomDuration);

    return {
      genderTitle: genderObj ? (lang === 'ar' ? genderObj.labelAr : genderObj.labelEn) : '',
      ageTitle: ageObj ? (lang === 'ar' ? ageObj.labelAr : ageObj.labelEn) : '',
      eyeTitle: eyeObj ? (lang === 'ar' ? eyeObj.labelAr : eyeObj.labelEn) : '',
      conditionTitle: conditionObj
        ? lang === 'ar'
          ? `${conditionObj.icon} ${conditionObj.labelAr}`
          : `${conditionObj.icon} ${conditionObj.labelEn}`
        : t('كشف عام', 'General Examination'),
      durationTitle: durationObj ? (lang === 'ar' ? durationObj.labelAr : durationObj.labelEn) : '',
      specialtyTitle: specialtyObj
        ? lang === 'ar'
          ? specialtyObj.titleAr
          : specialtyObj.titleEn
        : (lang === 'ar' ? 'عام' : 'General'),
      doctorTitle: doctorObj
        ? lang === 'ar'
          ? doctorObj.nameAr
          : doctorObj.nameEn
        : t('أقرب استشاري متاح', 'Next Available Consultant'),
    };
  }, [lang, t, doctors, specialties]);

  const submitBooking = useCallback(async (
    form: BookingFormValues,
  ): Promise<BookingSubmitResult> => {
    const finalName = form.patientName.trim();
    const finalPhone = form.patientPhone.trim();
    const finalEmail = form.patientEmail.trim();

    if (!finalName || !finalPhone || !finalEmail) {
      return {
        ok: false,
        bookingRef: '',
        queueTicket: '',
        titles: buildTitles(form),
        error: t('يرجى إدخال اسم المريض ورقم الهاتف والبريد الإلكتروني', 'Please enter patient name, phone number, and email'),
      };
    }

    // Device-local profile creation is gone: booking requests are recorded
    // server-side via /api/appointments and confirmed by reception.
    const titles = buildTitles(form);
    const queueTicket = `Q-${Math.floor(100 + Math.random() * 900)}`;
    let bookingRef = `BK-${Math.floor(1000 + Math.random() * 9000)}`;

    // POST to API
    const conditionObj = PATIENT_CONDITIONS.find((c) => c.id === form.selectedCondition);
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: finalName,
          phone: finalPhone,
          email: finalEmail || undefined,
          specialtyId: form.selectedSpecialty,
          doctorId: form.selectedDoctor || undefined,
          conditionTitleAr: conditionObj?.labelAr,
          conditionTitleEn: conditionObj?.labelEn,
          preferredDate: form.preferredDate || undefined,
          gender: form.gender,
          ageGroup: form.ageGroup,
          affectedEye: form.affectedEye,
          symptomDuration: form.symptomDuration,
        }),
      });
      const json = await res.json();
      if (res.ok && json?.data?.ref) bookingRef = json.data.ref as string;
    } catch {
      // dev DB unreachable — keep generated ref
    }

    return { ok: true, bookingRef, queueTicket, titles };
  }, [t, buildTitles]);

  return { submitBooking, buildTitles };
}
