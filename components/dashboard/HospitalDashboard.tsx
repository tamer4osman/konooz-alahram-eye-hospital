'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/context/LanguageContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardModals } from '@/hooks/useDashboardModals';
import { useDashboardMutations } from '@/hooks/useDashboardMutations';

import DashboardHeader from './DashboardHeader';

const TabSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-10 bg-bone-200 rounded-xl w-64" />
    <div className="h-64 bg-bone-200 rounded-2xl" />
  </div>
);

const PersonnelTab = dynamic(() => import('./PersonnelTab'), { ssr: false, loading: TabSkeleton });
const AppointmentsTab = dynamic(() => import('./AppointmentsTab'), { ssr: false, loading: TabSkeleton });
const FlowTab = dynamic(() => import('./FlowTab'), { ssr: false, loading: TabSkeleton });
const RoomsTab = dynamic(() => import('./RoomsTab'), { ssr: false, loading: TabSkeleton });
const EquipmentTab = dynamic(() => import('./EquipmentTab'), { ssr: false, loading: TabSkeleton });
const SurgeriesScheduleTab = dynamic(() => import('./SurgeriesScheduleTab'), { ssr: false, loading: TabSkeleton });
const ClinicalConsultationTab = dynamic(() => import('./ClinicalConsultationTab'), { ssr: false, loading: TabSkeleton });
const BedManagementTab = dynamic(() => import('./BedManagementTab'), { ssr: false, loading: TabSkeleton });
const BillingInsuranceTab = dynamic(() => import('./BillingInsuranceTab'), { ssr: false, loading: TabSkeleton });

const AddStaffModal = dynamic(() => import('./modals/AddStaffModal'), { ssr: false });
const ScheduleSurgeryModal = dynamic(() => import('./modals/ScheduleSurgeryModal'), { ssr: false });
const MaintenanceModal = dynamic(() => import('./modals/MaintenanceModal'), { ssr: false });
const AddRoomModal = dynamic(() => import('./modals/AddRoomModal'), { ssr: false });
const AddEquipmentModal = dynamic(() => import('./modals/AddEquipmentModal'), { ssr: false });
const BroadcastModal = dynamic(() => import('./modals/BroadcastModal'), { ssr: false });

const OverviewTab = dynamic(() => import('./OverviewTab'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-bone-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-64 bg-bone-200 rounded-2xl" />
    </div>
  ),
});

const AnalyticsTab = dynamic(() => import('./AnalyticsTab'), {
  ssr: false,
  loading: () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-bone-200 rounded-xl w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-bone-200 rounded-2xl" />
        ))}
      </div>
      <div className="h-80 bg-bone-200 rounded-2xl" />
    </div>
  ),
});

import { Activity, Users, Building2, Cpu, Calendar, CalendarCheck, BarChart3, X, Radio, Stethoscope, Bed, Receipt, GitBranch } from 'lucide-react';
import { hasModuleAccess, type DashboardModule } from '@/lib/permissions';

type DashboardTab = 'overview' | 'appointments' | 'patient_flow' | 'clinical' | 'surgeries' | 'rooms' | 'beds' | 'personnel' | 'equipment' | 'billing' | 'analytics';

export default function HospitalDashboard() {
  const { t } = useLanguage();
  const { userRole, userPermissions, staffList, roomsList, equipmentList, surgeriesList, consumablesList, patientFlowList, setStaffList, setRoomsList, setEquipmentList, setSurgeriesList } = useDashboardData();

  const modals = useDashboardModals();

  const mutations = useDashboardMutations({
    setStaffList,
    setRoomsList,
    setEquipmentList,
    setSurgeriesList,
  });

  // Navigation & User State
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('day');

  const allNavTabs = [
    {
      id: 'overview',
      labelAr: 'لوحة التحكم والعمليات',
      labelEn: 'Live Command Hub',
      icon: Activity,
      count: null
    },
    {
      id: 'appointments',
      labelAr: 'مواعيد المرضى',
      labelEn: 'Patient Appointments',
      icon: CalendarCheck,
      count: null
    },
    {
      id: 'patient_flow',
      labelAr: 'تدفق المرضى',
      labelEn: 'Patient Flow',
      icon: GitBranch,
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

  // Filter tabs based on user permissions (ADMIN sees all)
  const navTabs = allNavTabs.filter((tab) =>
    hasModuleAccess(userRole, userPermissions, tab.id as DashboardModule)
  );

  return (
    <div className="min-h-screen bg-bone-100 text-ink-900 pb-16">
      
      {/* Broadcast Alert Banner if Active */}
      {modals.activeBroadcastBanner && (
        <div className="bg-gradient-to-r from-rose-600 to-brass-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs font-bold animate-pulse">
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
            <Radio className="w-4 h-4 text-brass-600 flex-shrink-0 animate-spin" />
            <span>{t('تنبيه وإشعار إداري عاجل لكافة الأجنحة: ', 'URGENT COMPLEX-WIDE BROADCAST: ')}</span>
            <span className="font-extrabold underline">{modals.activeBroadcastBanner}</span>
          </div>
          <button
            onClick={() => modals.setActiveBroadcastBanner(null)}
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
        onOpenAddModal={modals.handleOpenAddModal}
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
              onUpdateSurgeryStatus={mutations.handleUpdateSurgeryStatus}
              onUpdateRoomStatus={mutations.handleUpdateRoomStatus}
            />
          )}

          {activeTab === 'appointments' && (
            <AppointmentsTab />
          )}

          {activeTab === 'patient_flow' && (
            <FlowTab />
          )}

          {activeTab === 'clinical' && (
            <ClinicalConsultationTab
              onReferToSurgery={(_patientName, _procedure) => {
                setActiveTab('surgeries');
                modals.openScheduleSurgery();
              }}
            />
          )}

          {activeTab === 'surgeries' && (
            <SurgeriesScheduleTab
              surgeriesList={surgeriesList}
              onUpdateSurgeryStatus={mutations.handleUpdateSurgeryStatus}
              onOpenScheduleModal={modals.openScheduleSurgery}
              onRemoveSurgery={mutations.handleRemoveSurgery}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsTab
              roomsList={roomsList}
              onUpdateRoomStatus={mutations.handleUpdateRoomStatus}
              onOpenRoomModal={() => {}}
              onOpenAddRoomModal={modals.openAddRoom}
              onRemoveRoom={mutations.handleRemoveRoom}
            />
          )}

          {activeTab === 'beds' && (
            <BedManagementTab />
          )}

          {activeTab === 'personnel' && (
            <PersonnelTab
              staffList={staffList}
              onUpdateStaffStatus={mutations.handleUpdateStaffStatus}
              onOpenAddStaffModal={modals.openAddStaff}
              onRemoveStaff={mutations.handleRemoveStaff}
            />
          )}

          {activeTab === 'equipment' && (
            <EquipmentTab
              equipmentList={equipmentList}
              onUpdateDeviceStatus={mutations.handleUpdateDeviceStatus}
              onOpenMaintenanceModal={modals.openMaintenance}
              onOpenAddEquipmentModal={modals.openAddEquipment}
              onRemoveEquipment={mutations.handleRemoveEquipment}
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
        open={modals.isAddStaffOpen}
        onClose={modals.closeAddStaff}
        onCreated={(member) => setStaffList((prev) => [member, ...prev])}
      />
      <ScheduleSurgeryModal
        open={modals.isScheduleSurgeryOpen}
        onClose={modals.closeScheduleSurgery}
        onScheduled={(surgery) => setSurgeriesList((prev) => [surgery, ...prev])}
      />
      <AddRoomModal
        open={modals.isAddRoomOpen}
        onClose={modals.closeAddRoom}
        onCreated={(room) => setRoomsList((prev) => [room, ...prev])}
      />
      <AddEquipmentModal
        open={modals.isAddEquipmentOpen}
        rooms={roomsList}
        onClose={modals.closeAddEquipment}
        onCreated={(device) => setEquipmentList((prev) => [device, ...prev])}
      />
      <MaintenanceModal
        device={modals.maintenanceDevice}
        open={modals.isMaintenanceOpen}
        onClose={modals.closeMaintenance}
        onCertified={mutations.handleDeviceCertified}
      />
      <BroadcastModal
        open={modals.isBroadcastOpen}
        onClose={modals.closeBroadcast}
        onBroadcast={modals.handleBroadcast}
      />

    </div>
  );
}
