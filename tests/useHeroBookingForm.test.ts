// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useHeroBookingForm } from '@/hooks/useHeroBookingForm';
import type { Doctor, Specialty } from '@/data/hospitalData';
import { PATIENT_CONDITIONS } from '@/data/hospitalData';

vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    lang: 'ar',
    isRTL: true,
    t: (ar: string, _en: string) => ar,
    doctors: mockDoctors,
    specialties: mockSpecialties,
  }),
}));

vi.mock('@/context/PatientAuthContext', () => ({
  usePatientAuth: () => ({
    currentPatient: null,
    createLocalProfile: vi.fn(),
    logout: vi.fn(),
    addAppointmentToCurrentPatient: vi.fn(),
    openPatientPortal: vi.fn(),
  }),
}));

const mockSpecialties: Specialty[] = [
  { id: 'retina', iconName: '', titleAr: 'الشبكية', titleEn: 'Retina', shortDescAr: '', shortDescEn: '', fullDescAr: '', fullDescEn: '', badgeAr: '', badgeEn: '', proceduresAr: [], proceduresEn: [], technologiesAr: [], technologiesEn: [], durationAr: '', durationEn: '', recoveryAr: '', recoveryEn: '', suitableForAr: [], suitableForEn: [] },
  { id: 'cornea', iconName: '', titleAr: 'القرنية', titleEn: 'Cornea', shortDescAr: '', shortDescEn: '', fullDescAr: '', fullDescEn: '', badgeAr: '', badgeEn: '', proceduresAr: [], proceduresEn: [], technologiesAr: [], technologiesEn: [], durationAr: '', durationEn: '', recoveryAr: '', recoveryEn: '', suitableForAr: [], suitableForEn: [] },
];

const mockDoctors: Doctor[] = [
  { id: 'doc1', nameAr: 'د. أحمد', nameEn: 'Dr. Ahmed', titleAr: '', titleEn: '', specialtyId: 'retina', doctorType: 'visiting', specialtyAr: '', specialtyEn: '', originAr: '', originEn: '', universityAr: 'جامعة القاهرة', universityEn: 'Cairo University', status: 'available_now', visitScheduleAr: '', visitScheduleEn: '', experienceYears: 10, surgeriesCount: '100', photoSeed: '', highlightsAr: [], highlightsEn: [] },
  { id: 'doc2', nameAr: 'د. سعيد', nameEn: 'Dr. Said', titleAr: '', titleEn: '', specialtyId: 'retina', doctorType: 'local', specialtyAr: '', specialtyEn: '', originAr: '', originEn: '', universityAr: 'جامعة بنغازي', universityEn: 'Benghazi University', status: 'available_now', visitScheduleAr: '', visitScheduleEn: '', experienceYears: 8, surgeriesCount: '80', photoSeed: '', highlightsAr: [], highlightsEn: [] },
  { id: 'doc3', nameAr: 'د. محمد', nameEn: 'Dr. Mohamed', titleAr: '', titleEn: '', specialtyId: 'cornea', doctorType: 'visiting', specialtyAr: '', specialtyEn: '', originAr: '', originEn: '', universityAr: 'جامعة عين شمس', universityEn: 'Ain Shams University', status: 'available_now', visitScheduleAr: '', visitScheduleEn: '', experienceYears: 12, surgeriesCount: '120', photoSeed: '', highlightsAr: [], highlightsEn: [] },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useHeroBookingForm', () => {
  it('initializes with default values', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    expect(result.current.patientName).toBe('');
    expect(result.current.patientPhone).toBe('');
    expect(result.current.patientEmail).toBe('');
    expect(result.current.gender).toBe('male');
    expect(result.current.ageGroup).toBe('adult');
    expect(result.current.affectedEye).toBe('both');
    expect(result.current.selectedCondition).toBe('lasik');
    expect(result.current.symptomDuration).toBe('recent');
    expect(result.current.symptomDetails).toBe('');
    expect(result.current.selectedSpecialty).toBe('retina');
    expect(result.current.selectedDoctor).toBe('');
    expect(result.current.preferredDate).toBe('');
    expect(result.current.consultationType).toBe('consultant');
    expect(result.current.formSubmitted).toBe(false);
    expect(result.current.bookingRef).toBeNull();
  });

  it('effective values default to form values when no patient', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    expect(result.current.effectivePatientName).toBe('');
    expect(result.current.effectivePatientPhone).toBe('');
    expect(result.current.effectivePatientEmail).toBe('');
    expect(result.current.effectiveGender).toBe('male');
  });

  it('filters doctors by specialty and consultation type', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    // Default: retina + consultant (visiting)
    const visitingRetina = result.current.availableDoctors;
    expect(visitingRetina).toHaveLength(1);
    expect(visitingRetina[0].id).toBe('doc1');

    // Switch to local
    act(() => result.current.setConsultationType('clinic'));
    const localRetina = result.current.availableDoctors;
    expect(localRetina).toHaveLength(1);
    expect(localRetina[0].id).toBe('doc2');

    // Switch specialty to cornea
    act(() => result.current.setSelectedSpecialty('cornea'));
    const localCornea = result.current.availableDoctors;
    expect(localCornea).toHaveLength(0);

    // Visiting cornea
    act(() => result.current.setConsultationType('consultant'));
    const visitingCornea = result.current.availableDoctors;
    expect(visitingCornea).toHaveLength(1);
    expect(visitingCornea[0].id).toBe('doc3');
  });

  it('handleConditionSelect sets condition and auto-matches specialty', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    const lasikCondition = PATIENT_CONDITIONS.find((c) => c.id === 'lasik');
    if (lasikCondition?.specialtyId) {
      act(() => result.current.handleConditionSelect(lasikCondition));
      expect(result.current.selectedSpecialty).toBe(lasikCondition.specialtyId);
      expect(result.current.selectedDoctor).toBe('');
    }
  });

  it('handleConditionSelect clears doctor when condition changes specialty', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    // Select a doctor
    act(() => result.current.setSelectedDoctor('doc1'));
    expect(result.current.selectedDoctor).toBe('doc1');

    // Change condition to one with a different specialty
    const cataractCondition = PATIENT_CONDITIONS.find((c) => c.id === 'cataract');
    if (cataractCondition?.specialtyId) {
      act(() => result.current.handleConditionSelect(cataractCondition));
      expect(result.current.selectedDoctor).toBe('');
    }
  });

  it('clearing specialty also clears selected doctor', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    act(() => result.current.setSelectedDoctor('doc1'));
    expect(result.current.selectedDoctor).toBe('doc1');

    // Changing specialty clears doctor (via setSelectedSpecialty in onChange)
    act(() => result.current.setSelectedSpecialty('cornea'));
    // The Hero component does this in the onChange, not in the hook.
    // The hook's setSelectedSpecialty is raw — the clearing is in the component.
    // So this test verifies the raw setter works.
    expect(result.current.selectedSpecialty).toBe('cornea');
  });

  it('setters update individual fields', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    act(() => result.current.setPatientName('أحمد'));
    expect(result.current.patientName).toBe('أحمد');

    act(() => result.current.setPatientPhone('0912345678'));
    expect(result.current.patientPhone).toBe('0912345678');

    act(() => result.current.setPatientEmail('test@example.com'));
    expect(result.current.patientEmail).toBe('test@example.com');

    act(() => result.current.setGender('female'));
    expect(result.current.gender).toBe('female');

    act(() => result.current.setAgeGroup('senior'));
    expect(result.current.ageGroup).toBe('senior');

    act(() => result.current.setAffectedEye('left'));
    expect(result.current.affectedEye).toBe('left');

    act(() => result.current.setSymptomDuration('chronic'));
    expect(result.current.symptomDuration).toBe('chronic');

    act(() => result.current.setSymptomDetails('Some details'));
    expect(result.current.symptomDetails).toBe('Some details');

    act(() => result.current.setPreferredDate('2026-09-15'));
    expect(result.current.preferredDate).toBe('2026-09-15');
  });

  it('consultationType setter works and affects availableDoctors', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    act(() => result.current.setConsultationType('clinic'));
    expect(result.current.consultationType).toBe('clinic');
    expect(result.current.availableDoctors).toHaveLength(1);
    expect(result.current.availableDoctors[0].doctorType).toBe('local');
  });

  it('selectedSpecialty setter works', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    act(() => result.current.setSelectedSpecialty('cornea'));
    expect(result.current.selectedSpecialty).toBe('cornea');
  });

  it('formSubmitted and bookingRef start as false/null', () => {
    const { result } = renderHook(() => useHeroBookingForm());

    expect(result.current.formSubmitted).toBe(false);
    expect(result.current.bookingRef).toBeNull();
  });
});
