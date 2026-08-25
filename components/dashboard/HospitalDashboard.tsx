'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  HospitalStaff,
  HospitalRoom,
  HospitalEquipment,
  ScheduledSurgery,
  SurgicalConsumable,
  PatientFlowStage,
  StaffStatus,
  RoomStatus,
  DeviceStatus
} from '@/data/dashboardData';

import DashboardHeader from './DashboardHeader';
import OverviewTab from './OverviewTab';
import PersonnelTab from './PersonnelTab';
import RoomsTab from './RoomsTab';
import EquipmentTab from './EquipmentTab';
import SurgeriesScheduleTab from './SurgeriesScheduleTab';
import AnalyticsTab from './AnalyticsTab';
import ClinicalConsultationTab from './ClinicalConsultationTab';
import BedManagementTab from './BedManagementTab';
import BillingInsuranceTab from './BillingInsuranceTab';
import AddStaffModal from './modals/AddStaffModal';
import ScheduleSurgeryModal from './modals/ScheduleSurgeryModal';
import MaintenanceModal from './modals/MaintenanceModal';
import AddRoomModal from './modals/AddRoomModal';
import AddEquipmentModal from './modals/AddEquipmentModal';
import BroadcastModal, { type BroadcastLevel } from './modals/BroadcastModal';

import { Activity, Users, Building2, Cpu, Calendar, BarChart3, X, Radio, Stethoscope, Bed, Receipt } from 'lucide-react';

type DashboardTab = 'overview' | 'clinical' | 'surgeries' | 'rooms' | 'beds' | 'personnel' | 'equipment' | 'billing' | 'analytics';

export default function HospitalDashboard() {
  const { t } = useLanguage();

  // Navigation & User State
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('day');

  // Live Hospital Operational State — staff members are persisted via staff APIs.
  const [staffList, setStaffList] = useState<HospitalStaff[]>([]);
  // Rooms are persisted in the database via staff APIs (single source of truth).
  const [roomsList, setRoomsList] = useState<HospitalRoom[]>([]);
  const [equipmentList, setEquipmentList] = useState<HospitalEquipment[]>([]);
  const [surgeriesList, setSurgeriesList] = useState<ScheduledSurgery[]>([]);
  const [consumablesList, setConsumablesList] = useState<SurgicalConsumable[]>([]);
  const [patientFlowList, setPatientFlowList] = useState<PatientFlowStage[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/staff/rooms')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) setRoomsList(json.data as HospitalRoom[]);
      })
      .catch(() => {});
    fetch('/api/staff/equipment')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) setEquipmentList(json.data as HospitalEquipment[]);
      })
      .catch(() => {});
    fetch('/api/staff/surgeries')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) setSurgeriesList(json.data as ScheduledSurgery[]);
      })
      .catch(() => {});
    fetch('/api/staff/consumables')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) setConsumablesList(json.data as SurgicalConsumable[]);
      })
      .catch(() => {});
    fetch('/api/staff/patient-flow')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) setPatientFlowList(json.data as PatientFlowStage[]);
      })
      .catch(() => {});
    fetch('/api/staff/staff-members')
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && Array.isArray(json?.data)) setStaffList(json.data as HospitalStaff[]);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Modal Open States — forms and submissions live inside each modal component.
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [isScheduleSurgeryOpen, setIsScheduleSurgeryOpen] = useState(false);
  const [maintenanceDevice, setMaintenanceDevice] = useState<HospitalEquipment | null>(null);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [activeBroadcastBanner, setActiveBroadcastBanner] = useState<string | null>(null);

  // Quick State Updaters & Removers
  const handleUpdateStaffStatus = (staffId: string, newStatus: StaffStatus) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === staffId ? { ...s, status: newStatus } : s))
    );
    fetch('/api/staff/staff-members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: staffId, status: newStatus })
    }).catch(() => {});
  };

  const handleRemoveStaff = (staffId: string) => {
    setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    fetch(`/api/staff/staff-members?id=${encodeURIComponent(staffId)}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleUpdateRoomStatus = (roomId: string, newStatus: RoomStatus) => {
    setRoomsList((prev) =>
      prev.map((r) => (r.id === roomId ? { ...r, status: newStatus } : r))
    );
    fetch(`/api/staff/rooms/${roomId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  const handleRemoveRoom = (roomId: string) => {
    setRoomsList((prev) => prev.filter((r) => r.id !== roomId));
    fetch(`/api/staff/rooms/${roomId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleUpdateDeviceStatus = (deviceId: string, newStatus: DeviceStatus) => {
    setEquipmentList((prev) =>
      prev.map((e) => (e.id === deviceId ? { ...e, status: newStatus } : e))
    );
    fetch(`/api/staff/equipment/${deviceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  const handleRemoveEquipment = (deviceId: string) => {
    setEquipmentList((prev) => prev.filter((e) => e.id !== deviceId));
    fetch(`/api/staff/equipment/${deviceId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleUpdateSurgeryStatus = (surgeryId: string, newStatus: ScheduledSurgery['status']) => {
    setSurgeriesList((prev) =>
      prev.map((s) => (s.id === surgeryId ? { ...s, status: newStatus } : s))
    );
    fetch(`/api/staff/surgeries/${surgeryId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  };

  const handleRemoveSurgery = (surgeryId: string) => {
    setSurgeriesList((prev) => prev.filter((s) => s.id !== surgeryId));
    fetch(`/api/staff/surgeries/${surgeryId}`, { method: 'DELETE' }).catch(() => {});
  };

  const handleDeviceCertified = (deviceId: string, updates: Partial<HospitalEquipment>) => {
    setEquipmentList((prev) =>
      prev.map((dev) => (dev.id === deviceId ? { ...dev, ...updates } : dev))
    );
  };

  const handleBroadcast = (message: string, _level: BroadcastLevel) => {
    setActiveBroadcastBanner(message);
  };

  const navTabs = [
    {
      id: 'overview',
      labelAr: 'لوحة التحكم والعمليات',
      labelEn: 'Live Command Hub',
      icon: Activity,
      count: null
    },
    {
      id: 'clinical',
      labelAr: 'الكشف السريري والملف الطبي',
      labelEn: 'Clinical Consultation Pad',
      icon: Stethoscope,
      count: null
    },
    {
      id: 'surgeries',
      labelAr: 'جدول العمليات والجراحات',
      labelEn: 'Surgical Pipeline',
      icon: Calendar,
      count: surgeriesList.filter((s) => s.status !== 'completed').length
    },
    {
      id: 'rooms',
      labelAr: 'غرف العمليات والعيادات',
      labelEn: 'Theaters & Suites',
      icon: Building2,
      count: roomsList.filter((r) => r.status === 'occupied_surgery').length
    },
    {
      id: 'beds',
      labelAr: 'خريطة الأسرّة والإفاقة',
      labelEn: 'PACU & Beds Matrix',
      icon: Bed,
      count: null
    },
    {
      id: 'personnel',
      labelAr: 'الكوادر والأطباء والمناوبات',
      labelEn: 'Personnel & Roster',
      icon: Users,
      count: staffList.filter((s) => s.status === 'on_duty' || s.status === 'in_surgery').length
    },
    {
      id: 'equipment',
      labelAr: 'الأجهزة والليزك والمعايرة',
      labelEn: 'Biomedical Fleet',
      icon: Cpu,
      count: equipmentList.filter((e) => e.status === 'operational').length
    },
    {
      id: 'billing',
      labelAr: 'الفوترة والتأمين والأشعة',
      labelEn: 'Billing, Claims & PACS',
      icon: Receipt,
      count: null
    },
    {
      id: 'analytics',
      labelAr: 'التحليلات والمؤشرات الإحصائية',
      labelEn: 'Advanced Analytics',
      icon: BarChart3,
      count: null
    }
  ];

  return (
    <div className="min-h-screen bg-bone-100 text-ink-900 pb-16">
      
      {/* Broadcast Alert Banner if Active */}
      {activeBroadcastBanner && (
        <div className="bg-gradient-to-r from-rose-600 to-brass-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
            <Radio className="w-4 h-4 text-brass-600 flex-shrink-0 animate-spin" />
            <span>{t('تنبيه وإشعار إداري عاجل لكافة الأجنحة: ', 'URGENT COMPLEX-WIDE BROADCAST: ')}</span>
            <span className="font-extrabold underline">{activeBroadcastBanner}</span>
          </div>
          <button
            onClick={() => setActiveBroadcastBanner(null)}
            className="p-1 hover:bg-white/20 rounded-md cursor-pointer transition-colors"
            aria-label={t('إغلاق التنبيه', 'Dismiss broadcast')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Sticky Dashboard Header */}
      <DashboardHeader
        timeframe={timeframe}
        onChangeTimeframe={setTimeframe}
        onOpenAddModal={(type) => {
          if (type === 'staff') setIsAddStaffOpen(true);
          if (type === 'surgery') setIsScheduleSurgeryOpen(true);
          if (type === 'room') setIsAddRoomOpen(true);
          if (type === 'equipment') setIsAddEquipmentOpen(true);
          if (type === 'broadcast') setIsBroadcastOpen(true);
        }}
      />

      {/* Main Body Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        
        {/* Navigation Tabs Bar */}
        <nav className="bg-white rounded-2xl p-2 border border-pine-200 shadow-sm flex items-center gap-1.5 overflow-x-auto" aria-label={t('أقسام لوحة التحكم', 'Dashboard sections')}>
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as DashboardTab)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0B3D33] text-white shadow-md'
                    : 'text-ink-500 hover:text-ink-900 hover:bg-bone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-brass-400' : 'text-ink-400'}`} />
                <span>{t(tab.labelAr, tab.labelEn)}</span>
                {tab.count !== null && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive ? 'bg-pine-500 text-white' : 'bg-pine-200 text-ink-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Tab Content Render */}
        <div className="transition-opacity duration-200">
          {activeTab === 'overview' && (
            <OverviewTab
              timeframe={timeframe}
              staffList={staffList}
              roomsList={roomsList}
              equipmentList={equipmentList}
              surgeriesList={surgeriesList}
              onSelectTab={(tabId) => setActiveTab(tabId as DashboardTab)}
              onUpdateSurgeryStatus={handleUpdateSurgeryStatus}
              onUpdateRoomStatus={handleUpdateRoomStatus}
            />
          )}

          {activeTab === 'clinical' && (
            <ClinicalConsultationTab
              onReferToSurgery={(_patientName, _procedure) => {
                setActiveTab('surgeries');
                setIsScheduleSurgeryOpen(true);
              }}
            />
          )}

          {activeTab === 'surgeries' && (
            <SurgeriesScheduleTab
              surgeriesList={surgeriesList}
              onUpdateSurgeryStatus={handleUpdateSurgeryStatus}
              onOpenScheduleModal={() => setIsScheduleSurgeryOpen(true)}
              onRemoveSurgery={handleRemoveSurgery}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsTab
              roomsList={roomsList}
              onUpdateRoomStatus={handleUpdateRoomStatus}
              onOpenRoomModal={() => {}}
              onOpenAddRoomModal={() => setIsAddRoomOpen(true)}
              onRemoveRoom={handleRemoveRoom}
            />
          )}

          {activeTab === 'beds' && (
            <BedManagementTab />
          )}

          {activeTab === 'personnel' && (
            <PersonnelTab
              staffList={staffList}
              onUpdateStaffStatus={handleUpdateStaffStatus}
              onOpenAddStaffModal={() => setIsAddStaffOpen(true)}
              onRemoveStaff={handleRemoveStaff}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentTab
              equipmentList={equipmentList}
              onUpdateDeviceStatus={handleUpdateDeviceStatus}
              onOpenMaintenanceModal={(device) => {
                setMaintenanceDevice(device);
                setIsMaintenanceOpen(true);
              }}
              onOpenAddEquipmentModal={() => setIsAddEquipmentOpen(true)}
              onRemoveEquipment={handleRemoveEquipment}
            />
          )}

          {activeTab === 'billing' && (
            <BillingInsuranceTab />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              timeframe={timeframe}
              onChangeTimeframe={setTimeframe}
              staffList={staffList}
              roomsList={roomsList}
              equipmentList={equipmentList}
              surgeriesList={surgeriesList}
              consumablesList={consumablesList}
              patientFlowList={patientFlowList}
            />
          )}
        </div>

      </div>

      {/* Dialogs — each owns its form state and submission; the dashboard only
          receives created/updated entities to merge into its live lists. */}
      <AddStaffModal
        open={isAddStaffOpen}
        onClose={() => setIsAddStaffOpen(false)}
        onCreated={(member) => setStaffList((prev) => [member, ...prev])}
      />
      <ScheduleSurgeryModal
        open={isScheduleSurgeryOpen}
        onClose={() => setIsScheduleSurgeryOpen(false)}
        onScheduled={(surgery) => setSurgeriesList((prev) => [surgery, ...prev])}
      />
      <AddRoomModal
        open={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
        onCreated={(room) => setRoomsList((prev) => [room, ...prev])}
      />
      <AddEquipmentModal
        open={isAddEquipmentOpen}
        rooms={roomsList}
        onClose={() => setIsAddEquipmentOpen(false)}
        onCreated={(device) => setEquipmentList((prev) => [device, ...prev])}
      />
      <MaintenanceModal
        device={maintenanceDevice}
        open={isMaintenanceOpen}
        onClose={() => {
          setIsMaintenanceOpen(false);
          setMaintenanceDevice(null);
        }}
        onCertified={handleDeviceCertified}
      />
      <BroadcastModal
        open={isBroadcastOpen}
        onClose={() => setIsBroadcastOpen(false)}
        onBroadcast={handleBroadcast}
      />

    </div>
  );
}
