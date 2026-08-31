// @vitest-environment jsdom
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardMutations } from '@/hooks/useDashboardMutations';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

const mockSetStaffList = vi.fn();
const mockSetRoomsList = vi.fn();
const mockSetEquipmentList = vi.fn();
const mockSetSurgeriesList = vi.fn();

const defaultArgs = {
  setStaffList: mockSetStaffList,
  setRoomsList: mockSetRoomsList,
  setEquipmentList: mockSetEquipmentList,
  setSurgeriesList: mockSetSurgeriesList,
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFetch.mockResolvedValue({ ok: true });
});

// ---------------------------------------------------------------------------
// Staff mutations
// ---------------------------------------------------------------------------
describe('useDashboardMutations', () => {
  describe('handleUpdateStaffStatus', () => {
    it('updates local state optimistically', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleUpdateStaffStatus('s1', 'on_duty'));

      expect(mockSetStaffList).toHaveBeenCalledTimes(1);
      const updater = mockSetStaffList.mock.calls[0][0];
      const prev = [{ id: 's1', status: 'off_duty' }, { id: 's2', status: 'on_duty' }];
      const next = updater(prev);
      expect(next[0].status).toBe('on_duty');
      expect(next[1].status).toBe('on_duty');
    });

    it('sends PATCH to API', async () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleUpdateStaffStatus('s1', 'in_surgery'));

      expect(mockFetch).toHaveBeenCalledWith('/api/staff/staff-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 's1', status: 'in_surgery' }),
      });
    });
  });

  describe('handleRemoveStaff', () => {
    it('removes from local state optimistically', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleRemoveStaff('s1'));

      expect(mockSetStaffList).toHaveBeenCalledTimes(1);
      const updater = mockSetStaffList.mock.calls[0][0];
      const prev = [{ id: 's1' }, { id: 's2' }];
      const next = updater(prev);
      expect(next).toHaveLength(1);
      expect(next[0].id).toBe('s2');
    });

    it('sends DELETE to API', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleRemoveStaff('s1'));

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/staff/staff-members?id=s1',
        { method: 'DELETE' }
      );
    });
  });

  // ---------------------------------------------------------------------------
  // Room mutations
  // ---------------------------------------------------------------------------
  describe('handleUpdateRoomStatus', () => {
    it('updates local state and sends PATCH', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleUpdateRoomStatus('r1', 'ready_clean'));

      expect(mockSetRoomsList).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/staff/rooms/r1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ready_clean' }),
      });
    });
  });

  describe('handleRemoveRoom', () => {
    it('removes from local state and sends DELETE', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleRemoveRoom('r1'));

      expect(mockSetRoomsList).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/staff/rooms/r1', { method: 'DELETE' });
    });
  });

  // ---------------------------------------------------------------------------
  // Equipment mutations
  // ---------------------------------------------------------------------------
  describe('handleUpdateDeviceStatus', () => {
    it('updates local state and sends PATCH', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleUpdateDeviceStatus('d1', 'maintenance_scheduled'));

      expect(mockSetEquipmentList).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/staff/equipment/d1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'maintenance_scheduled' }),
      });
    });
  });

  describe('handleRemoveEquipment', () => {
    it('removes from local state and sends DELETE', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleRemoveEquipment('d1'));

      expect(mockSetEquipmentList).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/staff/equipment/d1', { method: 'DELETE' });
    });
  });

  describe('handleDeviceCertified', () => {
    it('merges updates into equipment list (no API call)', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleDeviceCertified('d1', { firmwareVersion: '3.2.1' }));

      expect(mockSetEquipmentList).toHaveBeenCalledTimes(1);
      expect(mockFetch).not.toHaveBeenCalled();
      const updater = mockSetEquipmentList.mock.calls[0][0];
      const prev = [{ id: 'd1', firmwareVersion: '3.2.0' }, { id: 'd2', firmwareVersion: '2.1.0' }];
      const next = updater(prev);
      expect(next[0].firmwareVersion).toBe('3.2.1');
      expect(next[1].firmwareVersion).toBe('2.1.0');
    });
  });

  // ---------------------------------------------------------------------------
  // Surgery mutations
  // ---------------------------------------------------------------------------
  describe('handleUpdateSurgeryStatus', () => {
    it('updates local state and sends PATCH', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleUpdateSurgeryStatus('sg1', 'completed'));

      expect(mockSetSurgeriesList).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/staff/surgeries/sg1', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
    });
  });

  describe('handleRemoveSurgery', () => {
    it('removes from local state and sends DELETE', () => {
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));
      act(() => result.current.handleRemoveSurgery('sg1'));

      expect(mockSetSurgeriesList).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/api/staff/surgeries/sg1', { method: 'DELETE' });
    });
  });

  // ---------------------------------------------------------------------------
  // Error handling
  // ---------------------------------------------------------------------------
  describe('error handling', () => {
    it('does not throw on failed PATCH', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network'));
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));

      await act(async () => {
        result.current.handleUpdateStaffStatus('s1', 'on_duty');
      });

      expect(mockSetStaffList).toHaveBeenCalledTimes(1);
    });

    it('does not throw on failed DELETE', async () => {
      mockFetch.mockRejectedValueOnce(new Error('network'));
      const { result } = renderHook(() => useDashboardMutations(defaultArgs));

      await act(async () => {
        result.current.handleRemoveStaff('s1');
      });

      expect(mockSetStaffList).toHaveBeenCalledTimes(1);
    });
  });
});
