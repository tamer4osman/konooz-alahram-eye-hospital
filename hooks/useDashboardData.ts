'use client';

import { useState, useEffect, type Dispatch, type SetStateAction } from 'react';
import type {
  HospitalStaff,
  HospitalRoom,
  HospitalEquipment,
  ScheduledSurgery,
  SurgicalConsumable,
  PatientFlowStage,
} from '@/data/dashboardData';

interface DashboardDataState {
  userRole: string;
  userPermissions: unknown;
  staffList: HospitalStaff[];
  roomsList: HospitalRoom[];
  equipmentList: HospitalEquipment[];
  surgeriesList: ScheduledSurgery[];
  consumablesList: SurgicalConsumable[];
  patientFlowList: PatientFlowStage[];
}

interface DashboardDataActions {
  setStaffList: Dispatch<SetStateAction<HospitalStaff[]>>;
  setRoomsList: Dispatch<SetStateAction<HospitalRoom[]>>;
  setEquipmentList: Dispatch<SetStateAction<HospitalEquipment[]>>;
  setSurgeriesList: Dispatch<SetStateAction<ScheduledSurgery[]>>;
}

export interface UseDashboardData extends DashboardDataState, DashboardDataActions {}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json?.data) ? (json.data as T) : null;
  } catch {
    return null;
  }
}

export function useDashboardData(): UseDashboardData {
  const [userRole, setUserRole] = useState<string>('ADMIN');
  const [userPermissions, setUserPermissions] = useState<unknown>(null);
  const [staffList, setStaffList] = useState<HospitalStaff[]>([]);
  const [roomsList, setRoomsList] = useState<HospitalRoom[]>([]);
  const [equipmentList, setEquipmentList] = useState<HospitalEquipment[]>([]);
  const [surgeriesList, setSurgeriesList] = useState<ScheduledSurgery[]>([]);
  const [consumablesList, setConsumablesList] = useState<SurgicalConsumable[]>([]);
  const [patientFlowList, setPatientFlowList] = useState<PatientFlowStage[]>([]);

  useEffect(() => {
    let cancelled = false;

    // Auth check
    const hasSession = document.cookie.split(';').some((c) => c.trim().startsWith('konooz_auth='));
    if (hasSession) {
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((json) => {
          if (!cancelled && json?.data) {
            setUserRole(json.data.role ?? 'STAFF');
            setUserPermissions(json.data.permissions ?? null);
          }
        })
        .catch(() => {});
    }

    // Parallel data fetches
    Promise.all([
      fetchJson<HospitalRoom[]>('/api/staff/rooms'),
      fetchJson<HospitalEquipment[]>('/api/staff/equipment'),
      fetchJson<ScheduledSurgery[]>('/api/staff/surgeries'),
      fetchJson<SurgicalConsumable[]>('/api/staff/consumables'),
      fetchJson<PatientFlowStage[]>('/api/staff/patient-flow'),
      fetchJson<HospitalStaff[]>('/api/staff/staff-members'),
    ]).then(([rooms, equipment, surgeries, consumables, patientFlow, staff]) => {
      if (cancelled) return;
      if (rooms) setRoomsList(rooms);
      if (equipment) setEquipmentList(equipment);
      if (surgeries) setSurgeriesList(surgeries);
      if (consumables) setConsumablesList(consumables);
      if (patientFlow) setPatientFlowList(patientFlow);
      if (staff) setStaffList(staff);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    userRole,
    userPermissions,
    staffList,
    roomsList,
    equipmentList,
    surgeriesList,
    consumablesList,
    patientFlowList,
    setStaffList,
    setRoomsList,
    setEquipmentList,
    setSurgeriesList,
  };
}
