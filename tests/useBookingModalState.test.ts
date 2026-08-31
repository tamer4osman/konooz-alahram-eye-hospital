// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookingModalState } from '@/hooks/useBookingModalState';
import type { Doctor, Specialty } from '@/data/hospitalData';
import { PATIENT_CONDITIONS } from '@/data/hospitalData';

const mockSpecialties: Specialty[] = [
  { id: 'retina', iconName: '', titleAr: 'الشبكية', titleEn: 'Retina', shortDescAr: '', shortDescEn: '', fullDescAr: '', fullDescEn: '', badgeAr: '', badgeEn: '', proceduresAr: [], proceduresEn: [], technologiesAr: [], technologiesEn: [], durationAr: '', durationEn: '', recoveryAr: '', recoveryEn: '', suitableForAr: [], suitableForEn: [] },
  { id: 'cornea', iconName: '', titleAr: 'القرنية', titleEn: 'Cornea', shortDescAr: '', shortDescEn: '', fullDescAr: '', fullDescEn: '', badgeAr: '', badgeEn: '', proceduresAr: [], proceduresEn: [], technologiesAr: [], technologiesEn: [], durationAr: '', durationEn: '', recoveryAr: '', recoveryEn: '', suitableForAr: [], suitableForEn: [] },
];

const mockDoctors: Doctor[] = [
  { id: 'doc1', nameAr: 'د. أحمد', nameEn: 'Dr. Ahmed', titleAr: 'أستاذ', titleEn: 'Prof.', specialtyId: 'retina', doctorType: 'visiting', specialtyAr: '', specialtyEn: '', originAr: '', originEn: '', universityAr: '', universityEn: '', status: 'available_now', visitScheduleAr: '', visitScheduleEn: '', experienceYears: 10, surgeriesCount: '100', photoSeed: '', highlightsAr: [], highlightsEn: [] },
  { id: 'doc2', nameAr: 'د. سعيد', nameEn: 'Dr. Said', titleAr: 'استشاري', titleEn: 'Consultant', specialtyId: 'retina', doctorType: 'local', specialtyAr: '', specialtyEn: '', originAr: '', originEn: '', universityAr: '', universityEn: '', status: 'available_now', visitScheduleAr: '', visitScheduleEn: '', experienceYears: 8, surgeriesCount: '80', photoSeed: '', highlightsAr: [], highlightsEn: [] },
  { id: 'doc3', nameAr: 'د. محمد', nameEn: 'Dr. Mohamed', titleAr: '', titleEn: '', specialtyId: 'cornea', doctorType: 'visiting', specialtyAr: '', specialtyEn: '', originAr: '', originEn: '', universityAr: '', universityEn: '', status: 'available_now', visitScheduleAr: '', visitScheduleEn: '', experienceYears: 12, surgeriesCount: '120', photoSeed: '', highlightsAr: [], highlightsEn: [] },
];

let mockCurrentPatient: Record<string, any> | null = null;

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
    currentPatient: mockCurrentPatient,
    createLocalProfile: vi.fn(),
    logout: vi.fn(),
    addAppointmentToCurrentPatient: vi.fn(),
    openPatientPortal: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockCurrentPatient = null;
});

describe('useBookingModalState', () => {
  const defaultParams = {
    bookingSpecialtyId: null as string | null,
    bookingDoctorId: null as string | null,
  };

  it('initializes with default values when no booking params', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    expect(result.current.gender).toBe('male');
    expect(result.current.ageGroup).toBe('adult');
    expect(result.current.affectedEye).toBe('both');
    expect(result.current.selectedCondition).toBe('lasik');
    expect(result.current.symptomDuration).toBe('recent');
    expect(result.current.selectedSpecialty).toBe('retina');
    expect(result.current.doctorTrack).toBe('visiting');
    expect(result.current.selectedDoctor).toBe('');
    expect(result.current.patientName).toBe('');
    expect(result.current.patientPhone).toBe('');
    expect(result.current.patientEmail).toBe('');
    expect(result.current.preferredDate).toBe('');
    expect(result.current.preferredSlot).toBe('morning');
    expect(result.current.notes).toBe('');
    expect(result.current.intakeData).toEqual({});
    expect(result.current.isSuccess).toBe(false);
  });

  it('initializes specialty from bookingSpecialtyId', () => {
    const { result } = renderHook(() =>
      useBookingModalState({ ...defaultParams, bookingSpecialtyId: 'cornea' })
    );
    expect(result.current.selectedSpecialty).toBe('cornea');
  });

  it('initializes doctor and track from bookingDoctorId', () => {
    const { result } = renderHook(() =>
      useBookingModalState({ ...defaultParams, bookingDoctorId: 'doc2' })
    );
    expect(result.current.selectedDoctor).toBe('doc2');
    expect(result.current.doctorTrack).toBe('local');
  });

  it('derives lookups from current state', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    expect(result.current.activeSpecialtyObj?.id).toBe('retina');
    expect(result.current.activeConditionObj?.id).toBe('lasik');
    expect(result.current.eyeObj?.id).toBe('both');
    expect(result.current.ageObj?.id).toBe('adult');
    expect(result.current.genderObj?.id).toBe('male');
    expect(result.current.durationObj?.id).toBe('recent');
  });

  it('filters availableDoctors by specialty and doctorTrack', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    // retina + visiting
    expect(result.current.availableDoctors).toHaveLength(1);
    expect(result.current.availableDoctors[0].id).toBe('doc1');

    // Switch to local
    act(() => result.current.setDoctorTrack('local'));
    expect(result.current.availableDoctors).toHaveLength(1);
    expect(result.current.availableDoctors[0].id).toBe('doc2');

    // Switch specialty
    act(() => result.current.setSelectedSpecialty('cornea'));
    expect(result.current.availableDoctors).toHaveLength(0);

    // Visiting cornea
    act(() => result.current.setDoctorTrack('visiting'));
    expect(result.current.availableDoctors).toHaveLength(1);
    expect(result.current.availableDoctors[0].id).toBe('doc3');
  });

  it('handleConditionSelect sets condition and auto-matches specialty', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    const lasikCondition = PATIENT_CONDITIONS.find((c) => c.id === 'lasik');
    if (lasikCondition?.specialtyId) {
      act(() => result.current.handleConditionSelect(lasikCondition));
      expect(result.current.selectedCondition).toBe(lasikCondition.id);
      expect(result.current.selectedSpecialty).toBe(lasikCondition.specialtyId);
      expect(result.current.selectedDoctor).toBe('');
    }
  });

  it('handleConditionSelect clears doctor when condition changes specialty', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    act(() => result.current.setSelectedDoctor('doc1'));
    expect(result.current.selectedDoctor).toBe('doc1');

    const cataractCondition = PATIENT_CONDITIONS.find((c) => c.id === 'cataract');
    if (cataractCondition?.specialtyId) {
      act(() => result.current.handleConditionSelect(cataractCondition));
      expect(result.current.selectedDoctor).toBe('');
    }
  });

  it('handleConditionSelect does not clear doctor if condition has no specialtyId', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    act(() => result.current.setSelectedDoctor('doc1'));
    const noSpecialtyCondition = PATIENT_CONDITIONS.find((c) => !c.specialtyId);
    if (noSpecialtyCondition) {
      act(() => result.current.handleConditionSelect(noSpecialtyCondition));
      expect(result.current.selectedDoctor).toBe('doc1');
    }
  });

  it('applyPatientProfile populates form from patient data', () => {
    mockCurrentPatient = {
      fullNameAr: 'علي البرعصي',
      fullNameEn: 'Ali Al-Baraasi',
      phone: '0912345678',
      email: 'ali@test.com',
      gender: 'female',
      dateOfBirth: '1990-01-01',
    };

    const { result } = renderHook(() => useBookingModalState(defaultParams));

    act(() => result.current.applyPatientProfile());
    expect(result.current.patientName).toBe('علي البرعصي');
    expect(result.current.patientPhone).toBe('0912345678');
    expect(result.current.patientEmail).toBe('ali@test.com');
    expect(result.current.gender).toBe('female');
    expect(result.current.ageGroup).toBe('adult');
  });

  it('applyPatientProfile handles senior patient', () => {
    mockCurrentPatient = {
      fullNameAr: 'الشيخ أحمد',
      fullNameEn: 'Sheikh Ahmed',
      phone: '0911111111',
      email: 'senior@test.com',
      gender: 'male',
      dateOfBirth: '1960-01-01',
    };

    const { result } = renderHook(() => useBookingModalState(defaultParams));
    act(() => result.current.applyPatientProfile());
    expect(result.current.ageGroup).toBe('senior');
  });

  it('applyPatientProfile handles child patient', () => {
    mockCurrentPatient = {
      fullNameAr: 'الطفل سعيد',
      fullNameEn: 'Child Said',
      phone: '0922222222',
      email: 'child@test.com',
      gender: 'male',
      dateOfBirth: '2015-01-01',
    };

    const { result } = renderHook(() => useBookingModalState(defaultParams));
    act(() => result.current.applyPatientProfile());
    expect(result.current.ageGroup).toBe('child');
  });

  it('applyPatientProfile is no-op when no current patient', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    act(() => result.current.applyPatientProfile());
    expect(result.current.patientName).toBe('');
  });

  it('setters update individual fields', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

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

    act(() => result.current.setPreferredDate('2026-09-15'));
    expect(result.current.preferredDate).toBe('2026-09-15');

    act(() => result.current.setPreferredSlot('evening'));
    expect(result.current.preferredSlot).toBe('evening');

    act(() => result.current.setNotes('Some notes'));
    expect(result.current.notes).toBe('Some notes');

    act(() => result.current.setIntakeData({ field1: 'value1' }));
    expect(result.current.intakeData).toEqual({ field1: 'value1' });
  });

  it('setSelectedSpecialty is a raw setter (component clears doctor in onChange)', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    act(() => result.current.setSelectedDoctor('doc1'));
    expect(result.current.selectedDoctor).toBe('doc1');

    // Raw setter — clearing doctor is the component's responsibility
    act(() => result.current.setSelectedSpecialty('cornea'));
    expect(result.current.selectedSpecialty).toBe('cornea');
    expect(result.current.selectedDoctor).toBe('doc1'); // not cleared by hook
  });

  it('setDoctorTrack is a raw setter (component clears doctor in onClick)', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    act(() => result.current.setSelectedDoctor('doc1'));
    act(() => result.current.setDoctorTrack('local'));
    expect(result.current.selectedDoctor).toBe('doc1'); // not cleared by hook
  });

  it('isSuccess and confirmation state managed by setIsSuccess/setConfirmedQueueTicket/setConfirmedBookingRef', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    expect(result.current.isSuccess).toBe(false);
    expect(result.current.confirmedQueueTicket).toBe('Q-284');
    expect(result.current.confirmedBookingRef).toBe('BK-8492');

    act(() => result.current.setIsSuccess(true));
    expect(result.current.isSuccess).toBe(true);

    act(() => result.current.setConfirmedQueueTicket('Q-999'));
    expect(result.current.confirmedQueueTicket).toBe('Q-999');

    act(() => result.current.setConfirmedBookingRef('BK-1234'));
    expect(result.current.confirmedBookingRef).toBe('BK-1234');
  });

  it('activeDoctorObj derives from selectedDoctor', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));

    expect(result.current.activeDoctorObj).toBeUndefined();

    act(() => result.current.setSelectedDoctor('doc1'));
    expect(result.current.activeDoctorObj?.id).toBe('doc1');
    expect(result.current.activeDoctorObj?.nameAr).toBe('د. أحمد');
  });

  it('getPatientAgeGroup returns adult for no DOB', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));
    expect(result.current.getPatientAgeGroup(undefined)).toBe('adult');
    expect(result.current.getPatientAgeGroup('')).toBe('adult');
  });

  it('getPatientAgeGroup returns correct age group from DOB', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));
    expect(result.current.getPatientAgeGroup('1960-01-01')).toBe('senior');
    expect(result.current.getPatientAgeGroup('1990-01-01')).toBe('adult');
    expect(result.current.getPatientAgeGroup('2015-01-01')).toBe('child');
  });

  it('getPatientAgeGroup handles invalid DOB gracefully', () => {
    const { result } = renderHook(() => useBookingModalState(defaultParams));
    expect(result.current.getPatientAgeGroup('invalid')).toBe('adult');
  });
});
