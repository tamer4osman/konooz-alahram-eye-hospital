import React, { useState, useMemo, useCallback } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { usePatientAuth } from '@/context/PatientAuthContext';
import {
  PATIENT_CONDITIONS,
  AFFECTED_EYE_OPTIONS,
  AGE_GROUP_OPTIONS,
  GENDER_OPTIONS,
  SYMPTOM_DURATION_OPTIONS,
  PatientCondition,
} from '@/data/hospitalData';
import { buildHeroBookingMessage, buildWhatsAppUrl } from '@/lib/whatsapp-message-builder';
import { HOSPITAL_CONTACTS } from '@/data/hospitalData';

export type Gender = 'male' | 'female';
export type AgeGroup = 'child' | 'adult' | 'senior';
export type AffectedEye = 'both' | 'right' | 'left';
export type SymptomDuration = 'recent' | 'gradual' | 'chronic';
export type ConsultationType = 'consultant' | 'clinic';

export interface UseHeroBookingForm {
  // Patient info
  patientName: string;
  setPatientName: (v: string) => void;
  patientPhone: string;
  setPatientPhone: (v: string) => void;
  patientEmail: string;
  setPatientEmail: (v: string) => void;

  // Triage
  gender: Gender;
  setGender: (v: Gender) => void;
  ageGroup: AgeGroup;
  setAgeGroup: (v: AgeGroup) => void;
  affectedEye: AffectedEye;
  setAffectedEye: (v: AffectedEye) => void;
  selectedCondition: string;
  setSelectedCondition: (v: string) => void;
  handleConditionSelect: (condition: PatientCondition) => void;
  symptomDuration: SymptomDuration;
  setSymptomDuration: (v: SymptomDuration) => void;
  symptomDetails: string;
  setSymptomDetails: (v: string) => void;

  // Booking
  selectedSpecialty: string;
  setSelectedSpecialty: (v: string) => void;
  selectedDoctor: string;
  setSelectedDoctor: (v: string) => void;
  preferredDate: string;
  setPreferredDate: (v: string) => void;
  consultationType: ConsultationType;
  setConsultationType: (v: ConsultationType) => void;

  // Derived
  availableDoctors: ReturnType<typeof useLanguage>['doctors'];
  effectivePatientName: string;
  effectivePatientPhone: string;
  effectivePatientEmail: string;
  effectiveGender: Gender;
  effectiveAgeGroup: AgeGroup;

  // Submit state
  formSubmitted: boolean;
  setFormSubmitted: (v: boolean) => void;
  bookingRef: string | null;
  handleHeroSubmit: (e: React.FormEvent) => Promise<void>;
}

export function useHeroBookingForm(): UseHeroBookingForm {
  const { lang, t, doctors, specialties } = useLanguage();
  const { currentPatient } = usePatientAuth();

  // Patient info
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  // Triage
  const [gender, setGender] = useState<Gender>('male');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult');
  const [affectedEye, setAffectedEye] = useState<AffectedEye>('both');
  const [selectedCondition, setSelectedCondition] = useState('lasik');
  const [symptomDuration, setSymptomDuration] = useState<SymptomDuration>('recent');
  const [symptomDetails, setSymptomDetails] = useState('');

  // Booking
  const [selectedSpecialty, setSelectedSpecialty] = useState(specialties[0]?.id ?? '');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [consultationType, setConsultationType] = useState<ConsultationType>('consultant');

  // Submit state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Effective values
  const effectivePatientName = currentPatient ? (currentPatient.fullNameAr || currentPatient.fullNameEn) : patientName;
  const effectivePatientPhone = currentPatient ? (currentPatient.phone || '') : patientPhone;
  const effectivePatientEmail = currentPatient ? (currentPatient.email || '') : patientEmail;
  const effectiveGender = currentPatient ? (currentPatient.gender || gender) : gender;
  const effectiveAgeGroup = ageGroup;

  // Doctors matching selected specialty and consultation track
  const availableDoctors = useMemo(() =>
    doctors.filter((doc) => {
      const matchSpecialty = !selectedSpecialty || doc.specialtyId === selectedSpecialty;
      const matchType = consultationType === 'consultant' ? doc.doctorType === 'visiting' : doc.doctorType === 'local';
      return matchSpecialty && matchType;
    }),
    [doctors, selectedSpecialty, consultationType]
  );

  const handleConditionSelect = useCallback((condition: PatientCondition) => {
    setSelectedCondition(condition.id);
    if (condition.specialtyId) {
      setSelectedSpecialty(condition.specialtyId);
      setSelectedDoctor('');
    }
  }, []);

  const handleHeroSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = effectivePatientName.trim();
    const finalPhone = effectivePatientPhone.trim();
    const finalEmail = effectivePatientEmail.trim();

    if (!finalName || !finalPhone || !finalEmail) {
      alert(t('يرجى كتابة اسم المريض ورقم الهاتف والبريد الإلكتروني', 'Please enter patient name, phone number, and email'));
      return;
    }

    // Device-local profile creation is gone: booking requests are recorded
    // server-side via /api/appointments and confirmed by reception.

    const conditionObj = PATIENT_CONDITIONS.find((c) => c.id === selectedCondition);
    const specialtyObj = specialties.find((s) => s.id === selectedSpecialty);
    const doctorObj = doctors.find((d) => d.id === selectedDoctor);
    const eyeObj = AFFECTED_EYE_OPTIONS.find((e) => e.id === affectedEye);
    const ageObj = AGE_GROUP_OPTIONS.find((a) => a.id === effectiveAgeGroup);
    const genderObj = GENDER_OPTIONS.find((g) => g.id === effectiveGender);
    const durationObj = SYMPTOM_DURATION_OPTIONS.find((d) => d.id === symptomDuration);

    const conditionTitle = conditionObj
      ? lang === 'ar'
        ? `${conditionObj.icon} ${conditionObj.labelAr}`
        : `${conditionObj.icon} ${conditionObj.labelEn}`
      : t('كشف عام', 'General Examination');

    const eyeTitle = eyeObj ? (lang === 'ar' ? eyeObj.labelAr : eyeObj.labelEn) : '';
    const ageTitle = ageObj ? (lang === 'ar' ? ageObj.labelAr : ageObj.labelEn) : '';
    const genderTitle = genderObj ? (lang === 'ar' ? genderObj.labelAr : genderObj.labelEn) : '';
    const durationTitle = durationObj ? (lang === 'ar' ? durationObj.labelAr : durationObj.labelEn) : '';
    const specialtyTitle = specialtyObj ? (lang === 'ar' ? specialtyObj.titleAr : specialtyObj.titleEn) : (lang === 'ar' ? 'عام' : 'General');
    const doctorTitle = doctorObj ? (lang === 'ar' ? doctorObj.nameAr : doctorObj.nameEn) : t('أقرب استشاري متاح', 'Next Available Consultant');

    const msg = buildHeroBookingMessage({
      lang,
      patientName: finalName,
      phone: finalPhone,
      email: finalEmail,
      genderTitle,
      ageTitle,
      eyeTitle,
      conditionTitle,
      durationTitle,
      symptomDetails,
      specialtyTitle,
      doctorTitle,
      preferredDate,
      consultationType,
    });

    const whatsappUrl = buildWhatsAppUrl(HOSPITAL_CONTACTS.primaryWhatsApp, msg);
    window.open(whatsappUrl, '_blank');

    let ref = `BK-${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientName: effectivePatientName.trim(),
          phone: effectivePatientPhone.trim(),
          email: effectivePatientEmail.trim() || undefined,
          specialtyId: selectedSpecialty,
          doctorId: selectedDoctor || undefined,
          conditionTitleAr: conditionObj?.labelAr,
          conditionTitleEn: conditionObj?.labelEn,
          preferredDate: preferredDate || undefined,
          preferredTime: consultationType === 'consultant' ? '09:00' : '16:00',
          gender: effectiveGender,
          ageGroup: effectiveAgeGroup,
          affectedEye,
          symptomDuration,
          notes: symptomDetails.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (res.ok && json?.data?.ref) ref = json.data.ref as string;
    } catch {
      // dev DB unreachable — keep generated ref
    }
    setBookingRef(ref);
    setFormSubmitted(true);
  }, [
    effectivePatientName, effectivePatientPhone, effectivePatientEmail, effectiveGender,
    effectiveAgeGroup, selectedCondition,
    selectedSpecialty, selectedDoctor, affectedEye, symptomDuration, symptomDetails,
    preferredDate, consultationType, lang, t, doctors, specialties,
  ]);

  return {
    patientName, setPatientName,
    patientPhone, setPatientPhone,
    patientEmail, setPatientEmail,
    gender, setGender,
    ageGroup, setAgeGroup,
    affectedEye, setAffectedEye,
    selectedCondition, setSelectedCondition, handleConditionSelect,
    symptomDuration, setSymptomDuration,
    symptomDetails, setSymptomDetails,
    selectedSpecialty, setSelectedSpecialty,
    selectedDoctor, setSelectedDoctor,
    preferredDate, setPreferredDate,
    consultationType, setConsultationType,
    availableDoctors,
    effectivePatientName, effectivePatientPhone, effectivePatientEmail,
    effectiveGender, effectiveAgeGroup,
    formSubmitted, setFormSubmitted, bookingRef, handleHeroSubmit,
  };
}
