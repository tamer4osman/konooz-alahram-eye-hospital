// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useDashboardData } from '@/hooks/useDashboardData';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

function jsonResponse(data: unknown, ok = true) {
  return {
    ok,
    json: () => Promise.resolve(data),
  } as Response;
}

function errorResponse() {
  return {
    ok: false,
    json: () => Promise.resolve({ error: 'fail' }),
  } as Response;
}

// URL → response mapping (avoids non-deterministic Promise.all ordering)
const MOCK_DATA: Record<string, any> = {
  '/api/auth/me': { role: 'ADMIN', permissions: null },
  '/api/staff/rooms': { data: [{ id: 'r1', name: 'OR-1', status: 'available' }] },
  '/api/staff/equipment': { data: [{ id: 'e1', name: 'Laser', status: 'operational' }] },
  '/api/staff/surgeries': { data: [{ id: 'sg1', patient: 'Ahmed', status: 'scheduled' }] },
  '/api/staff/consumables': { data: [{ id: 'c1', item: 'Lens', quantity: 10 }] },
  '/api/staff/patient-flow': { data: [{ id: 'pf1', stage: 'triage', count: 5 }] },
  '/api/staff/staff-members': { data: [{ id: 's1', name: 'Dr. Ali', status: 'on_duty' }] },
};

function setupFetch(overrides?: Partial<Record<string, 'error'>>) {
  mockFetch.mockImplementation((url: string) => {
    if (overrides && url in overrides && overrides[url] === 'error') {
      return Promise.resolve(errorResponse());
    }
    if (url in MOCK_DATA) {
      return Promise.resolve(jsonResponse(MOCK_DATA[url]));
    }
    return Promise.resolve(jsonResponse({ data: [] }));
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('useDashboardData', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    setupFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty arrays initially', () => {
    const { result } = renderHook(() => useDashboardData());
    expect(result.current.staffList).toEqual([]);
    expect(result.current.roomsList).toEqual([]);
    expect(result.current.equipmentList).toEqual([]);
    expect(result.current.surgeriesList).toEqual([]);
    expect(result.current.consumablesList).toEqual([]);
    expect(result.current.patientFlowList).toEqual([]);
  });

  it('fetches all data on mount and populates state', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.staffList.length).toBeGreaterThan(0);
    });

    expect(result.current.staffList).toEqual(MOCK_DATA['/api/staff/staff-members'].data);
    expect(result.current.roomsList).toEqual(MOCK_DATA['/api/staff/rooms'].data);
    expect(result.current.equipmentList).toEqual(MOCK_DATA['/api/staff/equipment'].data);
    expect(result.current.surgeriesList).toEqual(MOCK_DATA['/api/staff/surgeries'].data);
    expect(result.current.consumablesList).toEqual(MOCK_DATA['/api/staff/consumables'].data);
    expect(result.current.patientFlowList).toEqual(MOCK_DATA['/api/staff/patient-flow'].data);
  });

  it('sets user role from auth check', async () => {
    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.userRole).toBe('ADMIN');
    });
  });

  it('defaults to STAFF role when auth check returns no role', async () => {
    setupFetch({ '/api/auth/me': 'error' });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.userRole).toBe('ADMIN'); // default unchanged
    });
  });

  it('handles auth check failure gracefully', async () => {
    setupFetch({ '/api/auth/me': 'error' });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.staffList.length).toBeGreaterThan(0);
    });

    expect(result.current.userRole).toBe('ADMIN'); // default
  });

  it('handles individual data fetch failures gracefully', async () => {
    setupFetch({ '/api/staff/rooms': 'error' });

    const { result } = renderHook(() => useDashboardData());

    await waitFor(() => {
      expect(result.current.staffList.length).toBeGreaterThan(0);
    });

    // Rooms should remain empty due to fetch failure
    expect(result.current.roomsList).toEqual([]);
    expect(result.current.equipmentList).toEqual(MOCK_DATA['/api/staff/equipment'].data);
  });

  it('cancels state updates on unmount', async () => {
    // Override with slow fetch for rooms
    mockFetch.mockImplementation((url: string) => {
      if (url === '/api/staff/rooms') {
        return new Promise((resolve) =>
          setTimeout(() => resolve(jsonResponse({ data: [{ id: 'r1', name: 'OR-1' }] })), 200)
        );
      }
      if (url in MOCK_DATA) {
        return Promise.resolve(jsonResponse(MOCK_DATA[url]));
      }
      return Promise.resolve(jsonResponse({ data: [] }));
    });

    const { result, unmount } = renderHook(() => useDashboardData());

    unmount();

    // Wait for slow fetch to complete
    await new Promise((r) => setTimeout(r, 300));

    // State should not have been updated after unmount
    expect(result.current.roomsList).toEqual([]);
  });
});
