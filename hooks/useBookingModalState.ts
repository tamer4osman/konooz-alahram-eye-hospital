import { useState, useMemo, useCallback } from 'react';
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

export type Gender = 'male' | 'female';
export type AgeGroup = 'child' | 'adult' | 'senior';
export type AffectedEye = 'both' | 'right' | 'left';
export type SymptomDuration = 'recent' | 'gradual' | 'chronic';
export type DoctorTrack = 'visiting' | 'local';
export type PreferredSlot = 'morning' | 'evening';

export interface UseBookingModalStateParams {
  bookingSpecialtyId: string | null;
  bookingDoctorId: string | null;
}

export interface UseBookingModalState {
  gender: Gender;
  setGender: (v: Gender) => void;
  ageGroup: AgeGroup;
  setAgeGroup: (v: AgeGroup) => void;
  affectedEye: AffectedEye;
  setAffectedEye: (v: AffectedEye) => void;
  selectedCondition: string;
  setSelectedCondition: (v: string) => void;
  symptomDuration: SymptomDuration;
  setSymptomDuration: (v: SymptomDuration) => void;
  selectedSpecialty: string;
  setSelectedSpecialty: (v: string) => void;
  doctorTrack: DoctorTrack;
  setDoctorTrack: (v: DoctorTrack) => void;
  selectedDoctor: string;
  setSelectedDoctor: (v: string) => void;
  patientName: string;
  setPatientName: (v: string) => void;
  patientPhone: string;
  setPatientPhone: (v: string) => void;
  patientEmail: string;
  setPatientEmail: (v: string) => void;
  preferredDate: string;
  setPreferredDate: (v: string) => void;
  preferredSlot: PreferredSlot;
  setPreferredSlot: (v: PreferredSlot) => void;
  notes: string;
  setNotes: (v: string) => void;
  intakeData: Record<string, string>;
  setIntakeData: (v: Record<string, string>) => void;
  isSuccess: boolean;
  setIsSuccess: (v: boolean) => void;
  confirmedQueueTicket: string;
  setConfirmedQueueTicket: (v: string) => void;
  confirmedBookingRef: string;
  setConfirmedBookingRef: (v: string) => void;

  activeSpecialtyObj: ReturnType<typeof useLanguage>['specialties'][number] | undefined;
  activeDoctorObj: ReturnType<typeof useLanguage>['doctors'][number] | undefined;
  activeConditionObj: PatientCondition | undefined;
  eyeObj: { id: string; labelAr: string; labelEn: string } | undefined;
  ageObj: { id: string; labelAr: string; labelEn: string } | undefined;
  genderObj: { id: string; labelAr: string; labelEn: string } | undefined;
  durationObj: { id: string; labelAr: string; labelEn: string } | undefined;
  availableDoctors: ReturnType<typeof useLanguage>['doctors'];

  getPatientAgeGroup: (dob?: string) => AgeGroup;
  applyPatientProfile: () => void;
  handleConditionSelect: (cond: PatientCondition) => void;
}

export function useBookingModalState({
  bookingSpecialtyId,
  bookingDoctorId,
}: UseBookingModalStateParams): UseBookingModalState {
  const { doctors, specialties } = useLanguage();
  const { currentPatient } = usePatientAuth();

  const getPatientAgeGroup = useCallback((dob?: string): AgeGroup => {
    if (!dob) return 'adult';
    const birthYear = parseInt(dob.split('-')[0], 10);
    if (isNaN(birthYear)) return 'adult';
    const currentYear = new Date().getFullYear();
    const calculatedAge = currentYear - birthYear;
    if (calculatedAge >= 60) return 'senior';
    if (calculatedAge < 18) return 'child';
    return 'adult';
  }, []);

  // Patient info
  const [patientName, setPatientName] = useState<string>(
    currentPatient ? currentPatient.fullNameAr : ''
  );
  const [patientPhone, setPatientPhone] = useState<string>(
    currentPatient ? currentPatient.phone : ''
  );
  const [patientEmail, setPatientEmail] = useState<string>(
    currentPatient ? currentPatient.email : ''
  );

  // Triage
  const [gender, setGender] = useState<Gender>(
    currentPatient?.gender === 'female' ? 'female' : 'male'
  );
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(
    getPatientAgeGroup(currentPatient?.dateOfBirth)
  );
  const [affectedEye, setAffectedEye] = useState<AffectedEye>('both');
  const [selectedCondition, setSelectedCondition] = useState<string>('lasik');
  const [symptomDuration, setSymptomDuration] = useState<SymptomDuration>('recent');

  // Specialty & doctor
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    bookingSpecialtyId || (specialties.length > 0 ? specialties[0].id : '')
  );

  const initialSelectedDoc = doctors.find((d) => d.id === bookingDoctorId);
  const [doctorTrack, setDoctorTrack] = useState<DoctorTrack>(
    initialSelectedDoc?.doctorType || 'visiting'
  );
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    bookingDoctorId || ''
  );

  // Schedule & notes
  const [preferredDate, setPreferredDate] = useState<string>('');
  const [preferredSlot, setPreferredSlot] = useState<PreferredSlot>('morning');
  const [notes, setNotes] = useState<string>('');
  const [intakeData, setIntakeData] = useState<Record<string, string>>({});

  // Confirmation state
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedQueueTicket, setConfirmedQueueTicket] = useState<string>('Q-284');
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string>('BK-8492');

  // Derived lookups
  const activeSpecialtyObj = specialties.find((s) => s.id === selectedSpecialty);
  const activeDoctorObj = doctors.find((d) => d.id === selectedDoctor);
  const activeConditionObj = PATIENT_CONDITIONS.find((c) => c.id === selectedCondition);
  const eyeObj = AFFECTED_EYE_OPTIONS.find((e) => e.id === affectedEye);
  const ageObj = AGE_GROUP_OPTIONS.find((a) => a.id === ageGroup);
  const genderObj = GENDER_OPTIONS.find((g) => g.id === gender);
  const durationObj = SYMPTOM_DURATION_OPTIONS.find((d) => d.id === symptomDuration);

  // Filter doctors by specialty AND doctorTrack
  const availableDoctors = useMemo(() =>
    doctors.filter((d) => {
      const matchSpecialty = !selectedSpecialty || d.specialtyId === selectedSpecialty;
      const matchType = d.doctorType === doctorTrack;
      return matchSpecialty && matchType;
    }),
    [doctors, selectedSpecialty, doctorTrack]
  );

  const applyPatientProfile = useCallback(() => {
    if (!currentPatient) return;
    setPatientName(currentPatient.fullNameAr);
    setPatientPhone(currentPatient.phone);
    setPatientEmail(currentPatient.email);
    setGender(currentPatient.gender === 'female' ? 'female' : 'male');
    setAgeGroup(getPatientAgeGroup(currentPatient.dateOfBirth));
  }, [currentPatient, getPatientAgeGroup]);

  const handleConditionSelect = useCallback((cond: PatientCondition) => {
    setSelectedCondition(cond.id);
    if (cond.specialtyId) {
      setSelectedSpecialty(cond.specialtyId);
      setSelectedDoctor('');
    }
  }, []);

  return {
    gender, setGender,
    ageGroup, setAgeGroup,
    affectedEye, setAffectedEye,
    selectedCondition, setSelectedCondition,
    symptomDuration, setSymptomDuration,
    selectedSpecialty, setSelectedSpecialty,
    doctorTrack, setDoctorTrack,
    selectedDoctor, setSelectedDoctor,
    patientName, setPatientName,
    patientPhone, setPatientPhone,
    patientEmail, setPatientEmail,
    preferredDate, setPreferredDate,
    preferredSlot, setPreferredSlot,
    notes, setNotes,
    intakeData, setIntakeData,
    isSuccess, setIsSuccess,
    confirmedQueueTicket, setConfirmedQueueTicket,
    confirmedBookingRef, setConfirmedBookingRef,
    activeSpecialtyObj,
    activeDoctorObj,
    activeConditionObj,
    eyeObj,
    ageObj,
    genderObj,
    durationObj,
    availableDoctors,
    getPatientAgeGroup,
    applyPatientProfile,
    handleConditionSelect,
  };
}
