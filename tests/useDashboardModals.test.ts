// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDashboardModals } from '@/hooks/useDashboardModals';

describe('useDashboardModals', () => {
  describe('Add Staff modal', () => {
    it('is closed by default', () => {
      const { result } = renderHook(() => useDashboardModals());
      expect(result.current.isAddStaffOpen).toBe(false);
    });

    it('opens when openAddStaff is called', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.openAddStaff());
      expect(result.current.isAddStaffOpen).toBe(true);
    });

    it('closes when closeAddStaff is called', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.openAddStaff());
      act(() => result.current.closeAddStaff());
      expect(result.current.isAddStaffOpen).toBe(false);
    });
  });

  describe('Add Room modal', () => {
    it('is closed by default', () => {
      const { result } = renderHook(() => useDashboardModals());
      expect(result.current.isAddRoomOpen).toBe(false);
    });

    it('opens and closes', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.openAddRoom());
      expect(result.current.isAddRoomOpen).toBe(true);
      act(() => result.current.closeAddRoom());
      expect(result.current.isAddRoomOpen).toBe(false);
    });
  });

  describe('Add Equipment modal', () => {
    it('is closed by default', () => {
      const { result } = renderHook(() => useDashboardModals());
      expect(result.current.isAddEquipmentOpen).toBe(false);
    });

    it('opens and closes', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.openAddEquipment());
      expect(result.current.isAddEquipmentOpen).toBe(true);
      act(() => result.current.closeAddEquipment());
      expect(result.current.isAddEquipmentOpen).toBe(false);
    });
  });

  describe('Schedule Surgery modal', () => {
    it('is closed by default', () => {
      const { result } = renderHook(() => useDashboardModals());
      expect(result.current.isScheduleSurgeryOpen).toBe(false);
    });

    it('opens and closes', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.openScheduleSurgery());
      expect(result.current.isScheduleSurgeryOpen).toBe(true);
      act(() => result.current.closeScheduleSurgery());
      expect(result.current.isScheduleSurgeryOpen).toBe(false);
    });
  });

  describe('Maintenance modal', () => {
    it('is closed by default with null device', () => {
      const { result } = renderHook(() => useDashboardModals());
      expect(result.current.isMaintenanceOpen).toBe(false);
      expect(result.current.maintenanceDevice).toBeNull();
    });

    it('opens with device reference', () => {
      const { result } = renderHook(() => useDashboardModals());
      const mockDevice = { id: 'dev-1', name: 'LASIK Unit' } as any;
      act(() => result.current.openMaintenance(mockDevice));
      expect(result.current.isMaintenanceOpen).toBe(true);
      expect(result.current.maintenanceDevice).toBe(mockDevice);
    });

    it('closes and clears device', () => {
      const { result } = renderHook(() => useDashboardModals());
      const mockDevice = { id: 'dev-1', name: 'LASIK Unit' } as any;
      act(() => result.current.openMaintenance(mockDevice));
      act(() => result.current.closeMaintenance());
      expect(result.current.isMaintenanceOpen).toBe(false);
      expect(result.current.maintenanceDevice).toBeNull();
    });
  });

  describe('Broadcast modal', () => {
    it('is closed by default', () => {
      const { result } = renderHook(() => useDashboardModals());
      expect(result.current.isBroadcastOpen).toBe(false);
    });

    it('opens and closes', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.openBroadcast());
      expect(result.current.isBroadcastOpen).toBe(true);
      act(() => result.current.closeBroadcast());
      expect(result.current.isBroadcastOpen).toBe(false);
    });
  });

  describe('Broadcast banner', () => {
    it('is null by default', () => {
      const { result } = renderHook(() => useDashboardModals());
      expect(result.current.activeBroadcastBanner).toBeNull();
    });

    it('sets banner via setActiveBroadcastBanner', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.setActiveBroadcastBanner('Fire alarm activated'));
      expect(result.current.activeBroadcastBanner).toBe('Fire alarm activated');
    });

    it('clears banner', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.setActiveBroadcastBanner('Alert'));
      act(() => result.current.setActiveBroadcastBanner(null));
      expect(result.current.activeBroadcastBanner).toBeNull();
    });
  });

  describe('handleOpenAddModal routing', () => {
    it('routes staff type to openAddStaff', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.handleOpenAddModal('staff'));
      expect(result.current.isAddStaffOpen).toBe(true);
    });

    it('routes surgery type to openScheduleSurgery', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.handleOpenAddModal('surgery'));
      expect(result.current.isScheduleSurgeryOpen).toBe(true);
    });

    it('routes room type to openAddRoom', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.handleOpenAddModal('room'));
      expect(result.current.isAddRoomOpen).toBe(true);
    });

    it('routes equipment type to openAddEquipment', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.handleOpenAddModal('equipment'));
      expect(result.current.isAddEquipmentOpen).toBe(true);
    });

    it('routes broadcast type to openBroadcast', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.handleOpenAddModal('broadcast'));
      expect(result.current.isBroadcastOpen).toBe(true);
    });
  });

  describe('modal isolation', () => {
    it('opening one modal does not affect others', () => {
      const { result } = renderHook(() => useDashboardModals());
      act(() => result.current.openAddStaff());
      expect(result.current.isAddStaffOpen).toBe(true);
      expect(result.current.isAddRoomOpen).toBe(false);
      expect(result.current.isAddEquipmentOpen).toBe(false);
      expect(result.current.isScheduleSurgeryOpen).toBe(false);
      expect(result.current.isMaintenanceOpen).toBe(false);
      expect(result.current.isBroadcastOpen).toBe(false);
    });
  });
});
