// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBookingSubmit } from '@/hooks/useBookingSubmit';
import type { Doctor, Specialty } from '@/data/hospitalData';

const mockSpecialties: Specialty[] = [
  { id: 'retina', iconName: '', titleAr: 'الشبكية', titleEn: 'Retina', shortDescAr: '', shortDescEn: '', fullDescAr: '', fullDescEn: '', badgeAr: '', badgeEn: '', proceduresAr: [], proceduresEn: [], technologiesAr: [], technologiesEn: [], durationAr: '', durationEn: '', recoveryAr: '', recoveryEn: '', suitableForAr: [], suitableForEn: [] },
];

const mockDoctors: Doctor[] = [
  { id: 'doc1', nameAr: 'د. أحمد', nameEn: 'Dr. Ahmed', titleAr: 'أستاذ', titleEn: 'Prof.', specialtyId: 'retina', doctorType: 'visiting', specialtyAr: '', specialtyEn: '', originAr: '', originEn: '', universityAr: '', universityEn: '', status: 'available_now', visitScheduleAr: '', visitScheduleEn: '', experienceYears: 10, surgeriesCount: '100', photoSeed: '', highlightsAr: [], highlightsEn: [] },
];

const mockFetch = vi.fn();

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
  }),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal('fetch', mockFetch);
  mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: { ref: 'BK-API-123' } }) });
  // Mock window.open
  vi.stubGlobal('open', vi.fn());
});

describe('useBookingSubmit', () => {
  const baseFormValues = {
    patientName: 'علي البرعصي',
    patientPhone: '0912345678',
    patientEmail: 'ali@test.com',
    gender: 'male' as const,
    ageGroup: 'adult' as const,
    affectedEye: 'both' as const,
    selectedCondition: 'lasik',
    symptomDuration: 'recent' as const,
    selectedSpecialty: 'retina',
    selectedDoctor: '',
    preferredDate: '2026-09-15',
  };

  it('returns a submitBooking function', () => {
    const { result } = renderHook(() => useBookingSubmit());
    expect(typeof result.current.submitBooking).toBe('function');
  });

  it('submitBooking returns { ok: false } when name is missing', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    let res: any;
    await act(async () => {
      res = await result.current.submitBooking({
        ...baseFormValues,
        patientName: '',
      });
    });
    expect(res.ok).toBe(false);
    expect(res.error).toContain('يرجى إدخال');
  });

  it('submitBooking returns { ok: false } when phone is missing', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    let res: any;
    await act(async () => {
      res = await result.current.submitBooking({
        ...baseFormValues,
        patientPhone: '',
      });
    });
    expect(res.ok).toBe(false);
  });

  it('submitBooking returns { ok: false } when email is missing', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    let res: any;
    await act(async () => {
      res = await result.current.submitBooking({
        ...baseFormValues,
        patientEmail: '',
      });
    });
    expect(res.ok).toBe(false);
  });

  it('creates local profile when no current patient', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    await act(async () => {
      await result.current.submitBooking(baseFormValues);
    });
    expect(mockFetch).toHaveBeenCalled();
  });

  it('submits a booking request without any patient profile', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    await act(async () => {
      await result.current.submitBooking(baseFormValues);
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/appointments', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('POSTs to /api/appointments', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    await act(async () => {
      await result.current.submitBooking(baseFormValues);
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/appointments', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }));
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.patientName).toBe('علي البرعصي');
    expect(body.phone).toBe('0912345678');
    expect(body.specialtyId).toBe('retina');
  });

  it('returns bookingRef from API when available', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve({ data: { ref: 'BK-API-789' } }) });
    const { result } = renderHook(() => useBookingSubmit());
    let res: any;
    await act(async () => {
      res = await result.current.submitBooking(baseFormValues);
    });
    expect(res.ok).toBe(true);
    expect(res.bookingRef).toBe('BK-API-789');
  });

  it('falls back to generated ref when API fails', async () => {
    mockFetch.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useBookingSubmit());
    let res: any;
    await act(async () => {
      res = await result.current.submitBooking(baseFormValues);
    });
    expect(res.ok).toBe(true);
    expect(res.bookingRef).toMatch(/^BK-\d+$/);
  });

  it('generates a queue ticket', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    let res: any;
    await act(async () => {
      res = await result.current.submitBooking(baseFormValues);
    });
    expect(res.queueTicket).toMatch(/^Q-\d+$/);
  });

  it('returns ok:true on successful submit', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    let res: any;
    await act(async () => {
      res = await result.current.submitBooking(baseFormValues);
    });
    expect(res.ok).toBe(true);
  });

  it('returns option titles for bilingual rendering', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    let res: any;
    await act(async () => {
      res = await result.current.submitBooking(baseFormValues);
    });
    expect(res.titles.genderTitle).toBeTruthy();
    expect(res.titles.ageTitle).toBeTruthy();
    expect(res.titles.eyeTitle).toBeTruthy();
    expect(res.titles.conditionTitle).toContain('ليزك'); // Arabic condition title for lasik
    expect(res.titles.specialtyTitle).toBe('الشبكية');
    expect(res.titles.durationTitle).toBeTruthy();
  });

  it('trims whitespace from patient values', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    await act(async () => {
      await result.current.submitBooking({
        ...baseFormValues,
        patientName: '  علي  ',
        patientPhone: '  0912345678  ',
        patientEmail: '  ali@test.com  ',
      });
    });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.patientName).toBe('علي');
    expect(body.phone).toBe('0912345678');
    expect(body.email).toBe('ali@test.com');
  });

  it('handles optional doctor selection', async () => {
    const { result } = renderHook(() => useBookingSubmit());
    let res: any;
    await act(async () => {
      res = await result.current.submitBooking({
        ...baseFormValues,
        selectedDoctor: 'doc1',
      });
    });
    expect(res.ok).toBe(true);
    expect(res.titles.doctorTitle).toContain('د. أحمد');
  });
});

