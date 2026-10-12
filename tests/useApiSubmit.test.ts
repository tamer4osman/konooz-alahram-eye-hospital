// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiSubmit, type ApiEnvelope } from '@/hooks/useApiSubmit';
import type { HospitalStaff } from '@/data/dashboardData';

vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    lang: 'en',
    isRTL: false,
    t: (_ar: string, en: string) => en,
  }),
}));

const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const CREATED: HospitalStaff = {
  id: 'staff-1',
  nameAr: 'د. سارة',
  nameEn: 'Dr. Sara',
  roleAr: 'طبيبة',
  roleEn: 'Doctor',
  category: 'surgeon',
  departmentAr: 'قسم',
  departmentEn: 'Dept',
  status: 'on_duty',
  roomAssignedAr: 'غرفة',
  roomAssignedEn: 'Room',
  shift: '08:00 - 16:00',
  phone: '+218 91 000 0000',
  email: 'sara@konooz.test',
} as HospitalStaff;

const okResponse = (envelope: ApiEnvelope<HospitalStaff>) =>
  ({ ok: true, json: async () => envelope }) as Response;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useApiSubmit', () => {
  it('returns true and hands the created record to onSuccess', async () => {
    mockFetch.mockResolvedValue(okResponse({ data: CREATED }));
    const { result } = renderHook(() => useApiSubmit<HospitalStaff>());
    const onSuccess = vi.fn();

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.submit({
        url: '/api/staff/staff-members',
        payload: { nameAr: 'د. سارة' },
        onSuccess,
      });
    });

    expect(ok).toBe(true);
    expect(onSuccess).toHaveBeenCalledWith(CREATED);
    expect(result.current.error).toBeNull();
    expect(result.current.submitting).toBe(false);
  });

  it('does NOT surface success when the server rejects the write', async () => {
    // Matches apiError(): failures nest the message under `error`.
    mockFetch.mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: { code: 'CODE_TAKEN', messageAr: 'رمز الجناح مستخدم بالفعل', messageEn: 'Room code already exists' } }),
    } as Response);

    const { result } = renderHook(() => useApiSubmit<HospitalStaff>());
    const onSuccess = vi.fn();

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.submit({
        url: '/api/staff/staff-members',
        payload: {},
        onSuccess,
      });
    });

    expect(ok).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    // The server's specific reason must reach the operator, not the fallback.
    expect(result.current.error).toBe('Room code already exists');
  });

  it('falls back to the bilingual default when the server sends no message', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({ error: {} }) } as Response);

    const { result } = renderHook(() => useApiSubmit<HospitalStaff>());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.submit({ url: '/api/staff/staff-members', payload: {} });
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('Could not save, please retry');
  });

  it('treats a 2xx with no data as a failure rather than a silent success', async () => {
    mockFetch.mockResolvedValue(okResponse({}));

    const { result } = renderHook(() => useApiSubmit<HospitalStaff>());
    const onSuccess = vi.fn();

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.submit({ url: '/api/staff/staff-members', payload: {}, onSuccess });
    });

    expect(ok).toBe(false);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(result.current.error).toBe('The server did not confirm the save');
  });

  it('reports an unreachable server when fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useApiSubmit<HospitalStaff>());

    let ok: boolean | undefined;
    await act(async () => {
      ok = await result.current.submit({ url: '/api/staff/staff-members', payload: {} });
    });

    expect(ok).toBe(false);
    expect(result.current.error).toBe('Could not reach the server');
  });

  it('clears a previous error when clearError is called', async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, json: async () => ({}) } as Response);
    const { result } = renderHook(() => useApiSubmit<HospitalStaff>());

    await act(async () => {
      await result.current.submit({ url: '/api/staff/staff-members', payload: {} });
    });
    expect(result.current.error).not.toBeNull();

    act(() => result.current.clearError());
    expect(result.current.error).toBeNull();
  });

  it('sends the requested verb and JSON body', async () => {
    mockFetch.mockResolvedValue(okResponse({ data: CREATED }));
    const { result } = renderHook(() => useApiSubmit<HospitalStaff>());

    await act(async () => {
      await result.current.submit({
        url: '/api/staff/equipment/dev-1',
        method: 'PATCH',
        payload: { status: 'operational' },
      });
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/staff/equipment/dev-1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'operational' }),
    });
  });
});
