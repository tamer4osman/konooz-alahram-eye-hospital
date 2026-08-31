import { useCallback, type SetStateAction, type Dispatch } from 'react';
import type { HospitalStaff, HospitalRoom, HospitalEquipment, ScheduledSurgery, StaffStatus, RoomStatus, DeviceStatus } from '@/data/dashboardData';

type SetState<T> = Dispatch<SetStateAction<T[]>>;

export interface UseDashboardMutationsArgs {
  setStaffList: SetState<HospitalStaff>;
  setRoomsList: SetState<HospitalRoom>;
  setEquipmentList: SetState<HospitalEquipment>;
  setSurgeriesList: SetState<ScheduledSurgery>;
}

export interface UseDashboardMutations {
  handleUpdateStaffStatus: (staffId: string, newStatus: StaffStatus) => void;
  handleRemoveStaff: (staffId: string) => void;
  handleUpdateRoomStatus: (roomId: string, newStatus: RoomStatus) => void;
  handleRemoveRoom: (roomId: string) => void;
  handleUpdateDeviceStatus: (deviceId: string, newStatus: DeviceStatus) => void;
  handleRemoveEquipment: (deviceId: string) => void;
  handleUpdateSurgeryStatus: (surgeryId: string, newStatus: ScheduledSurgery['status']) => void;
  handleRemoveSurgery: (surgeryId: string) => void;
  handleDeviceCertified: (deviceId: string, updates: Partial<HospitalEquipment>) => void;
}

export function useDashboardMutations({
  setStaffList,
  setRoomsList,
  setEquipmentList,
  setSurgeriesList,
}: UseDashboardMutationsArgs): UseDashboardMutations {
  // ── Staff ───────────────────────────────────────────────────────────
  const handleUpdateStaffStatus = useCallback(
    (staffId: string, newStatus: StaffStatus) => {
      setStaffList((prev) =>
        prev.map((s) => (s.id === staffId ? { ...s, status: newStatus } : s))
      );
      fetch('/api/staff/staff-members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: staffId, status: newStatus }),
      }).catch(() => {});
    },
    [setStaffList]
  );

  const handleRemoveStaff = useCallback(
    (staffId: string) => {
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      fetch(`/api/staff/staff-members?id=${encodeURIComponent(staffId)}`, {
        method: 'DELETE',
      }).catch(() => {});
    },
    [setStaffList]
  );

  // ── Rooms ───────────────────────────────────────────────────────────
  const handleUpdateRoomStatus = useCallback(
    (roomId: string, newStatus: RoomStatus) => {
      setRoomsList((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
      );
      fetch(`/api/staff/rooms/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});
    },
    [setRoomsList]
  );

  const handleRemoveRoom = useCallback(
    (roomId: string) => {
      setRoomsList((prev) => prev.filter((r) => r.id !== roomId));
      fetch(`/api/staff/rooms/${roomId}`, { method: 'DELETE' }).catch(() => {});
    },
    [setRoomsList]
  );

  // ── Equipment ───────────────────────────────────────────────────────
  const handleUpdateDeviceStatus = useCallback(
    (deviceId: string, newStatus: DeviceStatus) => {
      setEquipmentList((prev) =>
        prev.map((e) => (e.id === deviceId ? { ...e, status: newStatus } : e))
      );
      fetch(`/api/staff/equipment/${deviceId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});
    },
    [setEquipmentList]
  );

  const handleRemoveEquipment = useCallback(
    (deviceId: string) => {
      setEquipmentList((prev) => prev.filter((e) => e.id !== deviceId));
      fetch(`/api/staff/equipment/${deviceId}`, { method: 'DELETE' }).catch(() => {});
    },
    [setEquipmentList]
  );

  const handleDeviceCertified = useCallback(
    (deviceId: string, updates: Partial<HospitalEquipment>) => {
      setEquipmentList((prev) =>
        prev.map((dev) => (dev.id === deviceId ? { ...dev, ...updates } : dev))
      );
    },
    [setEquipmentList]
  );

  // ── Surgeries ───────────────────────────────────────────────────────
  const handleUpdateSurgeryStatus = useCallback(
    (surgeryId: string, newStatus: ScheduledSurgery['status']) => {
      setSurgeriesList((prev) =>
        prev.map((s) => (s.id === surgeryId ? { ...s, status: newStatus } : s))
      );
      fetch(`/api/staff/surgeries/${surgeryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      }).catch(() => {});
    },
    [setSurgeriesList]
  );

  const handleRemoveSurgery = useCallback(
    (surgeryId: string) => {
      setSurgeriesList((prev) => prev.filter((s) => s.id !== surgeryId));
      fetch(`/api/staff/surgeries/${surgeryId}`, { method: 'DELETE' }).catch(() => {});
    },
    [setSurgeriesList]
  );

  return {
    handleUpdateStaffStatus,
    handleRemoveStaff,
    handleUpdateRoomStatus,
    handleRemoveRoom,
    handleUpdateDeviceStatus,
    handleRemoveEquipment,
    handleUpdateSurgeryStatus,
    handleRemoveSurgery,
    handleDeviceCertified,
  };
}
