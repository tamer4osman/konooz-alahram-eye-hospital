import { useState, useCallback } from 'react';
import type { HospitalEquipment } from '@/data/dashboardData';
import type { BroadcastLevel } from '@/components/dashboard/modals/BroadcastModal';

export interface UseDashboardModals {
  // Add Staff modal
  isAddStaffOpen: boolean;
  openAddStaff: () => void;
  closeAddStaff: () => void;

  // Add Room modal
  isAddRoomOpen: boolean;
  openAddRoom: () => void;
  closeAddRoom: () => void;

  // Add Equipment modal
  isAddEquipmentOpen: boolean;
  openAddEquipment: () => void;
  closeAddEquipment: () => void;

  // Schedule Surgery modal
  isScheduleSurgeryOpen: boolean;
  openScheduleSurgery: () => void;
  closeScheduleSurgery: () => void;

  // Maintenance modal
  maintenanceDevice: HospitalEquipment | null;
  isMaintenanceOpen: boolean;
  openMaintenance: (device: HospitalEquipment) => void;
  closeMaintenance: () => void;

  // Broadcast modal + banner
  isBroadcastOpen: boolean;
  openBroadcast: () => void;
  closeBroadcast: () => void;
  activeBroadcastBanner: string | null;
  setActiveBroadcastBanner: (message: string | null) => void;
  handleBroadcast: (message: string, level: BroadcastLevel) => void;

  // Unified handler for DashboardHeader's onOpenAddModal callback
  handleOpenAddModal: (type: 'staff' | 'surgery' | 'room' | 'equipment' | 'broadcast') => void;
}

export function useDashboardModals(): UseDashboardModals {
  // Add Staff modal
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const openAddStaff = useCallback(() => setIsAddStaffOpen(true), []);
  const closeAddStaff = useCallback(() => setIsAddStaffOpen(false), []);

  // Add Room modal
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const openAddRoom = useCallback(() => setIsAddRoomOpen(true), []);
  const closeAddRoom = useCallback(() => setIsAddRoomOpen(false), []);

  // Add Equipment modal
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const openAddEquipment = useCallback(() => setIsAddEquipmentOpen(true), []);
  const closeAddEquipment = useCallback(() => setIsAddEquipmentOpen(false), []);

  // Schedule Surgery modal
  const [isScheduleSurgeryOpen, setIsScheduleSurgeryOpen] = useState(false);
  const openScheduleSurgery = useCallback(() => setIsScheduleSurgeryOpen(true), []);
  const closeScheduleSurgery = useCallback(() => setIsScheduleSurgeryOpen(false), []);

  // Maintenance modal
  const [maintenanceDevice, setMaintenanceDevice] = useState<HospitalEquipment | null>(null);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const openMaintenance = useCallback((device: HospitalEquipment) => {
    setMaintenanceDevice(device);
    setIsMaintenanceOpen(true);
  }, []);
  const closeMaintenance = useCallback(() => {
    setIsMaintenanceOpen(false);
    setMaintenanceDevice(null);
  }, []);

  // Broadcast modal + banner
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const openBroadcast = useCallback(() => setIsBroadcastOpen(true), []);
  const closeBroadcast = useCallback(() => setIsBroadcastOpen(false), []);
  const [activeBroadcastBanner, setActiveBroadcastBanner] = useState<string | null>(null);

  const handleBroadcast = useCallback((message: string, _level: BroadcastLevel) => {
    setActiveBroadcastBanner(message);
  }, []);

  // Unified routing for DashboardHeader's onOpenAddModal
  const handleOpenAddModal = useCallback((type: 'staff' | 'surgery' | 'room' | 'equipment' | 'broadcast') => {
    switch (type) {
      case 'staff':
        setIsAddStaffOpen(true);
        break;
      case 'surgery':
        setIsScheduleSurgeryOpen(true);
        break;
      case 'room':
        setIsAddRoomOpen(true);
        break;
      case 'equipment':
        setIsAddEquipmentOpen(true);
        break;
      case 'broadcast':
        setIsBroadcastOpen(true);
        break;
    }
  }, []);

  return {
    isAddStaffOpen,
    openAddStaff,
    closeAddStaff,
    isAddRoomOpen,
    openAddRoom,
    closeAddRoom,
    isAddEquipmentOpen,
    openAddEquipment,
    closeAddEquipment,
    isScheduleSurgeryOpen,
    openScheduleSurgery,
    closeScheduleSurgery,
    maintenanceDevice,
    isMaintenanceOpen,
    openMaintenance,
    closeMaintenance,
    isBroadcastOpen,
    openBroadcast,
    closeBroadcast,
    activeBroadcastBanner,
    setActiveBroadcastBanner,
    handleBroadcast,
    handleOpenAddModal,
  };
}
