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
  RoomType,
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

import { Activity, Users, Building2, Cpu, Calendar, BarChart3, Plus, X, CheckCircle2, Radio, Wrench, Send, Stethoscope, Bed, Receipt } from 'lucide-react';

export default function HospitalDashboard() {
  const { lang, t } = useLanguage();

  // Navigation & User State
  const [activeTab, setActiveTab] = useState<'overview' | 'clinical' | 'surgeries' | 'rooms' | 'beds' | 'personnel' | 'equipment' | 'billing' | 'analytics'>('overview');
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

  // Modal States
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddEquipmentOpen, setIsAddEquipmentOpen] = useState(false);
  const [isScheduleSurgeryOpen, setIsScheduleSurgeryOpen] = useState(false);
  const [isMaintenanceOpen, setIsMaintenanceOpen] = useState(false);
  const [selectedDeviceForMaintenance, setSelectedDeviceForMaintenance] = useState<HospitalEquipment | null>(null);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastLevel, setBroadcastLevel] = useState<'info' | 'urgent' | 'alert'>('info');
  const [activeBroadcastBanner, setActiveBroadcastBanner] = useState<string | null>(null);

  // New Staff Form State
  const [newStaffForm, setNewStaffForm] = useState({
    nameAr: '', nameEn: '', roleAr: '', roleEn: '', category: 'resident', departmentAr: 'قسم العيادات الخارجية وطب العيون العام', departmentEn: 'Outpatient Ophthalmology Clinic', roomAssignedAr: 'عيادة 105', roomAssignedEn: 'Clinic 105', shift: '08:00 - 16:00', phone: '+218 91 000 0000', email: '' });

  // New Room Form State
  const [newRoomForm, setNewRoomForm] = useState({
    code: 'OR-103', nameAr: 'جناح العمليات 3 (جراحات الشبكية والفاكو المتقدمة)', nameEn: 'Operating Theater 3 (Advanced VR & Phaco Suite)', type: 'operating_theater' as RoomType, floorAr: 'الطابق الثاني - المجمع الجراحي المعقم', floorEn: '2nd Floor - Sterile Surgical Complex', capacity: 1, mainDeviceAssignedAr: 'Carl Zeiss OPMI Lumera 700 + Alcon Centurion', mainDeviceAssignedEn: 'Carl Zeiss OPMI Lumera 700 + Alcon Centurion', tempCelsius: 19.5, humidityPercent: 45 });

  // New Equipment Form State
  const [newEquipmentForm, setNewEquipmentForm] = useState({
    nameAr: 'جهاز تصوير مقطعي عالي الدقة للقرنية والشبكية', nameEn: 'Ultra-High-Resolution HD Corneal & Retinal Diagnostic System', brand: 'Carl Zeiss Meditec (Germany)', model: 'CIRRUS HD-OCT 6000 Premium', serialNumber: 'CZ-OCT-2026-9912', roomCode: 'DIAG-OCT-1', departmentAr: 'مركز التشخيص والأشعة العينية', departmentEn: 'Diagnostic & Retinal Imaging Unit', technicianInChargeAr: 'م. سالم المجبري', technicianInChargeEn: 'Eng. Salem Al-Majbari', nextServiceDue: '2026-12-01', notesAr: 'جهاز جديد تم تدشينه وفحص كافة حساسات التصوير الطبقي بدقة 100%', notesEn: 'New device commissioned with 100% optical calibration pass' });

  // New Surgery Form State
  const [newSurgeryForm, setNewSurgeryForm] = useState({
    patientNameAr: '', patientNameEn: '', patientPhone: '091-000-0000', patientAge: 45, gender: 'male' as 'male' | 'female', procedureAr: 'عملية إزالة المياه البيضاء بالموجات فوق الصوتية (الفاكو) وزراعة عدسة مطوية', procedureEn: 'Phacoemulsification with Foldable Monofocal IOL Implantation', specialtyId: 'cataract', surgeonAr: 'أ.د. محمود الحسيني', surgeonEn: 'Prof. Dr. Mahmoud Al-Husseini', roomCode: 'OR-101', time: '14:30', estimatedDurationMin: 35, priority: 'elective' as 'urgent' | 'elective' | 'high_priority', anesthesiaTypeAr: 'تخدير موضعي قطرات (Topical)', anesthesiaTypeEn: 'Topical Anesthesia Drops'
  });

  // Maintenance Log Form State
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [nextServiceDue, setNextServiceDue] = useState('2026-11-15');

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

  // Add New Staff Handler — persisted via POST /api/staff/staff-members
  const handleAddStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.nameAr && !newStaffForm.nameEn) return;

    const payload = {
      nameAr: newStaffForm.nameAr || newStaffForm.nameEn,
      nameEn: newStaffForm.nameEn || newStaffForm.nameAr,
      roleAr: newStaffForm.roleAr || 'طبيب عيون ممارس',
      roleEn: newStaffForm.roleEn || 'Ophthalmology Practitioner',
      category: newStaffForm.category,
      departmentAr: newStaffForm.departmentAr,
      departmentEn: newStaffForm.departmentEn,
      status: 'on_duty',
      roomAssignedAr: newStaffForm.roomAssignedAr,
      roomAssignedEn: newStaffForm.roomAssignedEn,
      shift: newStaffForm.shift,
      phone: newStaffForm.phone,
      email: newStaffForm.email || 'staff@konooz-hospital.ly'
    };

    fetch('/api/staff/staff-members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) setStaffList((prev) => [json.data as HospitalStaff, ...prev]);
      })
      .catch(() => {});

    setIsAddStaffOpen(false);
    setNewStaffForm({
      nameAr: '',
      nameEn: '',
      roleAr: '',
      roleEn: '',
      category: 'resident',
      departmentAr: 'قسم العيادات الخارجية وطب العيون العام',
      departmentEn: 'Outpatient Ophthalmology Clinic',
      roomAssignedAr: 'عيادة 105',
      roomAssignedEn: 'Clinic 105',
      shift: '08:00 - 16:00',
      phone: '+218 91 000 0000',
      email: ''
    });
  };

  // Add Surgery Case Handler
  const handleScheduleSurgerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurgeryForm.patientNameAr && !newSurgeryForm.patientNameEn) return;

    const payload = {
      patientNameAr: newSurgeryForm.patientNameAr || undefined,
      patientNameEn: newSurgeryForm.patientNameEn || undefined,
      patientPhone: newSurgeryForm.patientPhone || '091-000-0000',
      patientAge: newSurgeryForm.patientAge,
      gender: newSurgeryForm.gender,
      procedureAr: newSurgeryForm.procedureAr,
      procedureEn: newSurgeryForm.procedureEn,
      specialtyId: newSurgeryForm.specialtyId || 'cataract',
      surgeonAr: newSurgeryForm.surgeonAr,
      surgeonEn: newSurgeryForm.surgeonEn,
      roomCode: newSurgeryForm.roomCode,
      time: newSurgeryForm.time,
      estimatedDurationMin: newSurgeryForm.estimatedDurationMin,
      priority: newSurgeryForm.priority,
      anesthesiaTypeAr: newSurgeryForm.anesthesiaTypeAr,
      anesthesiaTypeEn: newSurgeryForm.anesthesiaTypeEn
    };

    fetch('/api/staff/surgeries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) setSurgeriesList((prev) => [json.data as ScheduledSurgery, ...prev]);
      })
      .catch(() => {});

    setIsScheduleSurgeryOpen(false);
    setNewSurgeryForm({
      patientNameAr: '',
      patientNameEn: '',
      patientPhone: '091-000-0000',
      patientAge: 45,
      gender: 'male',
      procedureAr: 'عملية إزالة المياه البيضاء بالموجات فوق الصوتية (الفاكو) وزراعة عدسة مطوية',
      procedureEn: 'Phacoemulsification with Foldable Monofocal IOL Implantation',
      specialtyId: 'cataract',
      surgeonAr: 'أ.د. محمود الحسيني',
      surgeonEn: 'Prof. Dr. Mahmoud Al-Husseini',
      roomCode: 'OR-101',
      time: '14:30',
      estimatedDurationMin: 35,
      priority: 'elective',
      anesthesiaTypeAr: 'تخدير موضعي قطرات (Topical)',
      anesthesiaTypeEn: 'Topical Anesthesia Drops'
    });
  };

  // Add Room Handler
  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomForm.nameAr && !newRoomForm.nameEn) return;

    const payload = {
      code: newRoomForm.code || `OR-${Math.floor(100 + Math.random() * 900)}`,
      nameAr: newRoomForm.nameAr || undefined,
      nameEn: newRoomForm.nameEn || undefined,
      type: newRoomForm.type as HospitalRoom['type'],
      floorAr: newRoomForm.floorAr,
      floorEn: newRoomForm.floorEn,
      tempCelsius: Number(newRoomForm.tempCelsius) || 20,
      humidityPercent: Number(newRoomForm.humidityPercent) || 45,
      capacity: Number(newRoomForm.capacity) || 1,
      mainDeviceAssignedAr: newRoomForm.mainDeviceAssignedAr || 'طاقم جراحي متكامل',
      mainDeviceAssignedEn: newRoomForm.mainDeviceAssignedEn || 'Complete Surgical Setup'
    };

    fetch('/api/staff/rooms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) setRoomsList((prev) => [json.data as HospitalRoom, ...prev]);
      })
      .catch(() => {});

    setIsAddRoomOpen(false);
  };

  // Add Equipment Handler
  const handleAddEquipmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEquipmentForm.nameAr && !newEquipmentForm.nameEn) return;

    const payload = {
      nameAr: newEquipmentForm.nameAr || undefined,
      nameEn: newEquipmentForm.nameEn || undefined,
      brand: newEquipmentForm.brand || 'Carl Zeiss (Germany)',
      model: newEquipmentForm.model || 'Advanced Medical Suite',
      serialNumber: newEquipmentForm.serialNumber || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
      departmentAr: newEquipmentForm.departmentAr,
      departmentEn: newEquipmentForm.departmentEn,
      roomCode: newEquipmentForm.roomCode,
      nextServiceDue: newEquipmentForm.nextServiceDue || '2026-12-01',
      notesAr: newEquipmentForm.notesAr,
      notesEn: newEquipmentForm.notesEn
    };

    fetch('/api/staff/equipment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(async (res) => {
        if (!res.ok) return;
        const json = await res.json();
        if (json?.data) setEquipmentList((prev) => [json.data as HospitalEquipment, ...prev]);
      })
      .catch(() => {});

    setIsAddEquipmentOpen(false);
  };

  // Maintenance Submit Handler
  const handleMaintenanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDeviceForMaintenance) return;

    const deviceId = selectedDeviceForMaintenance.id;
    const today = new Date().toISOString().split('T')[0];

    setEquipmentList((prev) =>
      prev.map((dev) =>
        dev.id === deviceId
          ? {
              ...dev,
              status: 'operational',
              lastMaintenanceDate: today,
              nextServiceDue: nextServiceDue,
              notesAr: maintenanceNotes ? `تمت المعايرة: ${maintenanceNotes}` : dev.notesAr,
              healthScore: 100,
              uptimePercentage: 99.9
            }
          : dev
      )
    );

    fetch(`/api/staff/equipment/${deviceId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status: 'operational',
        lastMaintenanceDate: today,
        nextServiceDue: nextServiceDue,
        notesAr: maintenanceNotes ? `تمت المعايرة: ${maintenanceNotes}` : undefined,
        healthScore: 100,
        uptimePercentage: 99.9
      })
    }).catch(() => {});

    setIsMaintenanceOpen(false);
    setSelectedDeviceForMaintenance(null);
    setMaintenanceNotes('');
  };

  // Broadcast Handler
  const handleBroadcastSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;

    setActiveBroadcastBanner(broadcastMessage);
    setIsBroadcastOpen(false);
    setBroadcastMessage('');
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
        <div className="bg-white rounded-2xl p-2 border border-pine-200 shadow-sm flex items-center gap-1.5 overflow-x-auto">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
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
        </div>

        {/* Tab Content Render */}
        <div className="transition-opacity duration-200">
          {activeTab === 'overview' && (
            <OverviewTab
              timeframe={timeframe}
              staffList={staffList}
              roomsList={roomsList}
              equipmentList={equipmentList}
              surgeriesList={surgeriesList}
              onSelectTab={(tabId) => setActiveTab(tabId as any)}
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
                setSelectedDeviceForMaintenance(device);
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

      {/* ========================================================================= */}
      {/* MODAL 1: ADD NEW STAFF MEMBER */}
      {/* ========================================================================= */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <button
              onClick={() => setIsAddStaffOpen(false)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
                <Users className="w-5 h-5 text-pine-700" />
                <span>{t('إضافة عضو كادر طبي / فني جديد', 'Register New Medical Staff Member')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t('تعيين الطبيب أو الممرض أو الأخصائي وتخصيص المناوبة والموقع', 'Assign role, shift timings, and active clinic/theater')}
              </p>
            </div>

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الاسم بالعربية *', 'Full Name (Arabic) *')}</label>
                  <input
                    type="text"
                    required
                    value={newStaffForm.nameAr}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, nameAr: e.target.value })}
                    placeholder="د. محمد الساعدي"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الاسم بالإنجليزية', 'Full Name (English)')}</label>
                  <input
                    type="text"
                    value={newStaffForm.nameEn}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, nameEn: e.target.value })}
                    placeholder="Dr. Mohammed Al-Saadi"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('المسمى الوظيفي والتخصص *', 'Specialty Title *')}</label>
                  <input
                    type="text"
                    required
                    value={newStaffForm.roleAr}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, roleAr: e.target.value })}
                    placeholder="أخصائي جراحة عيون ومياه بيضاء"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الفئة الوظيفية', 'Staff Category')}</label>
                  <select
                    value={newStaffForm.category}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, category: e.target.value })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  >
                    <option value="surgeon">{t('جراح استشاري', 'Surgeon / Consultant')}</option>
                    <option value="consultant">{t('استشاري زائر', 'Visiting Professor')}</option>
                    <option value="resident">{t('طبيب مقيم', 'Resident Doctor')}</option>
                    <option value="nurse">{t('تمريض عمليات ورعاية', 'Surgical Nurse')}</option>
                    <option value="technician">{t('أخصائي بصريات وأجهزة', 'Optometrist / Tech')}</option>
                    <option value="admin">{t('إدارة واستقبال', 'Admin / Reception')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الموقع المخصص / الغرفة', 'Assigned Room')}</label>
                  <input
                    type="text"
                    value={newStaffForm.roomAssignedAr}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, roomAssignedAr: e.target.value })}
                    placeholder="عيادة 105"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('مواعيد المناوبة', 'Shift Timings')}</label>
                  <input
                    type="text"
                    value={newStaffForm.shift}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, shift: e.target.value })}
                    placeholder="08:00 - 16:00"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('رقم الهاتف للتواصل المباشر', 'Direct Phone')}</label>
                  <input
                    type="text"
                    value={newStaffForm.phone}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, phone: e.target.value })}
                    placeholder="+218 91 000 0000"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('البريد الإلكتروني المؤسسي', 'Hospital Email')}</label>
                  <input
                    type="email"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    placeholder="doctor@konooz-hospital.ly"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-bone-100 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-pine-900 hover:bg-pine-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-brass-400" />
                  <span>{t('تأكيد وحفظ الكادر', 'Confirm & Add Staff')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SCHEDULE NEW SURGERY CASE */}
      {/* ========================================================================= */}
      {isScheduleSurgeryOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <button
              onClick={() => setIsScheduleSurgeryOpen(false)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pine-700" />
                <span>{t('حجز وتنسيق موعد جراحة عيون عاجلة / مجدولة', 'Schedule New Ophthalmic Surgery Case')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t('ربط المريض بالجراح، الجناح المعقم، ونوع التخدير المطلوب', 'Connect patient to surgeon, theater suite, and anesthesia team')}
              </p>
            </div>

            <form onSubmit={handleScheduleSurgerySubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('اسم المريض بالعربية *', 'Patient Name (Arabic) *')}</label>
                  <input
                    type="text"
                    required
                    value={newSurgeryForm.patientNameAr}
                    onChange={(e) => setNewSurgeryForm({ ...newSurgeryForm, patientNameAr: e.target.value })}
                    placeholder="سليمان عبد القادر"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-ink-700 block mb-1">{t('العمر', 'Age')}</label>
                    <input
                      type="number"
                      value={newSurgeryForm.patientAge}
                      onChange={(e) => setNewSurgeryForm({ ...newSurgeryForm, patientAge: Number(e.target.value) })}
                      className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-ink-700 block mb-1">{t('الجنس', 'Gender')}</label>
                    <select
                      value={newSurgeryForm.gender}
                      onChange={(e) => setNewSurgeryForm({ ...newSurgeryForm, gender: e.target.value as any })}
                      className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                    >
                      <option value="male">{t('ذكر', 'Male')}</option>
                      <option value="female">{t('أنثى', 'Female')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('نوع الإجراء الجراحي *', 'Surgical Procedure *')}</label>
                <select
                  value={newSurgeryForm.procedureAr}
                  onChange={(e) => setNewSurgeryForm({ ...newSurgeryForm, procedureAr: e.target.value })}
                  className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                >
                  <option value="عملية إزالة المياه البيضاء بالموجات فوق الصوتية (الفاكو) وزراعة عدسة مطوية">
                    {t('إزالة المياه البيضاء (الفاكو) + عدسة مطوية', 'Phacoemulsification + Foldable IOL')}
                  </option>
                  <option value="استئصال جسم زجاجي وإصلاح انفصال شبكية مع حقن غاز / زيت سيليكون">
                    {t('استئصال الجسم الزجاجي وإصلاح انفصال الشبكية (Vitrectomy)', 'Pars Plana Vitrectomy & Retinal Repair')}
                  </option>
                  <option value="تصحيح قصر النظر والاستجماتيزم بالفيمتو ليزك المخصص Custom-Q">
                    {t('تصحيح الإبصار بالفيمتو ليزك (Femto-LASIK)', 'Wavefront Femto-LASIK')}
                  </option>
                  <option value="تثبيت القرنية المخروطية بالأشعة فوق البنفسجية والريبوفلافين (Cross-Linking)">
                    {t('تثبيت القرنية المخروطية (Corneal Cross-Linking)', 'Corneal Cross-Linking (CXL)')}
                  </option>
                  <option value="جراحة تصحيح الحول الدقيقة للأطفال">
                    {t('جراحة تصحيح الحول للأطفال (Strabismus Surgery)', 'Pediatric Strabismus Surgery')}
                  </option>
                  <option value="عملية تعديل ارتخاء الجفون وشد عضلات الجفن (Blepharoplasty)">
                    {t('تجميل وشد الجفون (Blepharoplasty)', 'Blepharoplasty & Oculoplastics')}
                  </option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الجراح المسؤول *', 'Surgeon In Charge *')}</label>
                  <select
                    value={newSurgeryForm.surgeonAr}
                    onChange={(e) => setNewSurgeryForm({ ...newSurgeryForm, surgeonAr: e.target.value })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  >
                    <option value="أ.د. محمود الحسيني">أ.د. محمود الحسيني (الشبكية قصر العيني)</option>
                    <option value="أ.د. طارق قطامش">أ.د. طارق قطامش (القرنية والليزك قصر العيني)</option>
                    <option value="أ.د. حسام زيادة">أ.د. حسام زيادة (عيون الأطفال والحول قصر العيني)</option>
                    <option value="أ.د. طارق عبد الرازق">أ.د. طارق عبد الرازق (تجميل العيون عين شمس)</option>
                    <option value="د. يوسف العقوري">د. يوسف العقوري (مقيم جراحة العيون)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الجناح الجراحي المخصص', 'Surgical Theater')}</label>
                  <select
                    value={newSurgeryForm.roomCode}
                    onChange={(e) => setNewSurgeryForm({ ...newSurgeryForm, roomCode: e.target.value })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  >
                    <option value="OR-101">OR-101 (جناح الشبكية - Lumera & Constellation)</option>
                    <option value="OR-102">OR-102 (جناح الفاكو والعدسات - Centurion)</option>
                    <option value="LASIK-OR-3">LASIK-OR-3 (جناح الفيمتوليزك - Schwind & VisuMax)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('وقت الدخول', 'Time Slot')}</label>
                  <input
                    type="time"
                    value={newSurgeryForm.time}
                    onChange={(e) => setNewSurgeryForm({ ...newSurgeryForm, time: e.target.value })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('المدة المتوقعة (دقيقة)', 'Est. Duration')}</label>
                  <input
                    type="number"
                    value={newSurgeryForm.estimatedDurationMin}
                    onChange={(e) => setNewSurgeryForm({ ...newSurgeryForm, estimatedDurationMin: Number(e.target.value) })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('مستوى الأولوية', 'Priority Level')}</label>
                  <select
                    value={newSurgeryForm.priority}
                    onChange={(e) => setNewSurgeryForm({ ...newSurgeryForm, priority: e.target.value as any })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  >
                    <option value="elective">{t('عادية مجدولة', 'Elective / Standard')}</option>
                    <option value="high_priority">{t('أولوية متقدمة', 'High Priority')}</option>
                    <option value="urgent">{t('عاجلة وطارئة', 'Urgent / Emergency')}</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsScheduleSurgeryOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-bone-100 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-pine-900 hover:bg-pine-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-brass-400" />
                  <span>{t('تثبيت وإدراج الحالة في الجدول', 'Schedule Surgery Case')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BIOMEDICAL MAINTENANCE LOG */}
      {/* ========================================================================= */}
      {isMaintenanceOpen && selectedDeviceForMaintenance && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <button
              onClick={() => setIsMaintenanceOpen(false)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] font-mono font-extrabold text-pine-800 bg-pine-50 px-2 py-0.5 rounded uppercase">
                {selectedDeviceForMaintenance.brand} - {selectedDeviceForMaintenance.serialNumber}
              </span>
              <h3 className="text-base font-extrabold text-pine-900 mt-1 flex items-center gap-2">
                <Wrench className="w-5 h-5 text-pine-700" />
                <span>{t('توثيق صيانة ومعايرة جهاز طبي', 'Biomedical Service & Optical Calibration Log')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {lang === 'ar' ? selectedDeviceForMaintenance.nameAr : selectedDeviceForMaintenance.nameEn}
              </p>
            </div>

            <form onSubmit={handleMaintenanceSubmit} className="space-y-3 text-xs">
              <div className="p-3 bg-bone-50 rounded-xl border border-bone-100 space-y-1">
                <div className="flex justify-between">
                  <span className="text-ink-500">{t('الموقع الحالي:', 'Location:')}</span>
                  <strong className="text-ink-900">{selectedDeviceForMaintenance.roomCode}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">{t('المهندس المسؤول:', 'Engineer:')}</span>
                  <strong className="text-ink-900">
                    {lang === 'ar' ? selectedDeviceForMaintenance.technicianInChargeAr : selectedDeviceForMaintenance.technicianInChargeEn}
                  </strong>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('ملاحظات الفحص والمعايرة *', 'Calibration & Inspection Notes *')}</label>
                <textarea
                  rows={3}
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  placeholder={t('تم فحص طاقة الليزر، معايرة المسافة البؤرية، واختبار حساسات الضغط بنجاح...', 'Energy level verified, beam centering tested, full self-diagnostic passed...')}
                  className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('تاريخ المعايرة الدورية القادمة', 'Next Due Date')}</label>
                <input
                  type="date"
                  value={nextServiceDue}
                  onChange={(e) => setNextServiceDue(e.target.value)}
                  className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsMaintenanceOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-bone-100 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-pine-800 hover:bg-pine-800 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-brass-300" />
                  <span>{t('اعتماد المعايرة وإعادة للخدمة', 'Certify & Set Operational')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW ROOM / OPERATING THEATER */}
      {/* ========================================================================= */}
      {isAddRoomOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <button
              onClick={() => setIsAddRoomOpen(false)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-pine-700" />
                <span>{t('إضافة غرفة عمليات / جناح سريري جديد', 'Register New Surgical Suite / Clinic Room')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t('تعريف الجناح الجراحي أو العيادة وتحديد الأجهزة المجهزة ونظام التعقيم', 'Define suite specs, climate controls, and biomedical equipment')}
              </p>
            </div>

            <form onSubmit={handleAddRoomSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('رمز الجناح / الغرفة *', 'Room Code *')}</label>
                  <input
                    type="text"
                    required
                    value={newRoomForm.code}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, code: e.target.value })}
                    placeholder="OR-104"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold uppercase font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('نوع الجناح / القسم *', 'Room Category *')}</label>
                  <select
                    value={newRoomForm.type}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, type: e.target.value as RoomType })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-bold"
                  >
                    <option value="operating_theater">{t('جناح عمليات جراحية رئيسي', 'Major Operating Theater')}</option>
                    <option value="laser_room">{t('جناح عمليات الليزك وتصحيح الإبصار', 'Refractive LASIK Suite')}</option>
                    <option value="outpatient_clinic">{t('عيادة فحص واستشارة عيون', 'Outpatient Eye Clinic')}</option>
                    <option value="diagnostic_suite">{t('مختبر الفحوصات والأشعة التشخيصية', 'Diagnostic Imaging Suite')}</option>
                    <option value="recovery_ward">{t('وحدة الإفاقة ورعاية ما بعد الجراحة', 'PACU Recovery Ward')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('اسم الجناح بالعربية *', 'Room Name (Arabic) *')}</label>
                  <input
                    type="text"
                    required
                    value={newRoomForm.nameAr}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, nameAr: e.target.value })}
                    placeholder="جناح العمليات 4 (جراحات الليزر والفاكو)"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('اسم الجناح بالإنجليزية', 'Room Name (English)')}</label>
                  <input
                    type="text"
                    value={newRoomForm.nameEn}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, nameEn: e.target.value })}
                    placeholder="Operating Theater 4 (Laser & Phaco Suite)"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الموقع / الطابق بالعربية', 'Floor Location (Arabic)')}</label>
                  <input
                    type="text"
                    value={newRoomForm.floorAr}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, floorAr: e.target.value })}
                    placeholder="الطابق الثاني - المجمع الجراحي"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الجهاز الرئيسي المجهز بالجناح', 'Primary Biomedical Device')}</label>
                  <input
                    type="text"
                    value={newRoomForm.mainDeviceAssignedAr}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, mainDeviceAssignedAr: e.target.value })}
                    placeholder="Zeiss Lumera 700 + Alcon Centurion"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('درجة الحرارة المعيارية (°C)', 'Target Temp (°C)')}</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newRoomForm.tempCelsius}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, tempCelsius: Number(e.target.value) })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('نسبة الرطوبة المثالية (%)', 'Target Humidity (%)')}</label>
                  <input
                    type="number"
                    value={newRoomForm.humidityPercent}
                    onChange={(e) => setNewRoomForm({ ...newRoomForm, humidityPercent: Number(e.target.value) })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsAddRoomOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-bone-100 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-pine-700 hover:bg-pine-800 text-white rounded-xl font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('تسجيل وتدشين الجناح', 'Register Room')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD NEW MEDICAL DEVICE / EQUIPMENT */}
      {/* ========================================================================= */}
      {isAddEquipmentOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <button
              onClick={() => setIsAddEquipmentOpen(false)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5">
              <h3 className="text-base sm:text-lg font-extrabold text-pine-900 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-pine-700" />
                <span>{t('إضافة جهاز طبي ونظام ليزر جديد', 'Add Biomedical Equipment / Laser')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t('تسجيل بيانات الجهاز الطبي، الرقم التسلسلي، موقع التشغيل، وتعيين مهندس الصيانة', 'Register serial number, operating suite, calibration interval, and lead bio-engineer')}
              </p>
            </div>

            <form onSubmit={handleAddEquipmentSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('اسم الجهاز بالعربية *', 'Device Name (Arabic) *')}</label>
                  <input
                    type="text"
                    required
                    value={newEquipmentForm.nameAr}
                    onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, nameAr: e.target.value })}
                    placeholder="جهاز ليزر الفيمتو ثانية المتطور"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('اسم الجهاز بالإنجليزية', 'Device Name (English)')}</label>
                  <input
                    type="text"
                    value={newEquipmentForm.nameEn}
                    onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, nameEn: e.target.value })}
                    placeholder="Femtosecond Laser Surgical System"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الشركة المصنعة *', 'Manufacturer Brand *')}</label>
                  <input
                    type="text"
                    required
                    value={newEquipmentForm.brand}
                    onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, brand: e.target.value })}
                    placeholder="Carl Zeiss Meditec"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الموديل / الطراز *', 'Model *')}</label>
                  <input
                    type="text"
                    required
                    value={newEquipmentForm.model}
                    onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, model: e.target.value })}
                    placeholder="VisuMax 800"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الرقم التسلسلي (SN) *', 'Serial Number *')}</label>
                  <input
                    type="text"
                    required
                    value={newEquipmentForm.serialNumber}
                    onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, serialNumber: e.target.value })}
                    placeholder="CZ-VM-800-4491"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('الغرفة أو الجناح المخصص له *', 'Assigned Room *')}</label>
                  <select
                    value={newEquipmentForm.roomCode}
                    onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, roomCode: e.target.value })}
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-bold"
                  >
                    {roomsList.map((room) => (
                      <option key={room.id} value={room.code}>
                        {room.code} - {lang === 'ar' ? room.nameAr : room.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink-700 block mb-1">{t('المهندس الحيوي المسؤول', 'Lead Bio-Engineer')}</label>
                  <input
                    type="text"
                    value={newEquipmentForm.technicianInChargeAr}
                    onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, technicianInChargeAr: e.target.value })}
                    placeholder="م. سالم المجبري"
                    className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('ملاحظات التشغيل والمعايرة الأولية', 'Initial Calibration Notes')}</label>
                <textarea
                  rows={2}
                  value={newEquipmentForm.notesAr}
                  onChange={(e) => setNewEquipmentForm({ ...newEquipmentForm, notesAr: e.target.value })}
                  placeholder="تم فحص ومطابقة الليزر واختبار الأمان البصري بنجاح..."
                  className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-pine-500 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsAddEquipmentOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-bone-100 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-pine-700 hover:bg-pine-800 text-white rounded-xl font-extrabold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('إضافة الجهاز للأسطول', 'Register Equipment')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: EMERGENCY / SYSTEM BROADCAST */}
      {/* ========================================================================= */}
      {isBroadcastOpen && (
        <div className="fixed inset-0 z-50 bg-ink-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-pine-200 relative animate-scaleUp">
            <button
              onClick={() => setIsBroadcastOpen(false)}
              className="absolute top-5 left-5 rtl:left-auto rtl:right-5 p-2 text-ink-400 hover:text-ink-700 rounded-full hover:bg-bone-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-base font-extrabold text-rose-700 flex items-center gap-2">
                <Radio className="w-5 h-5 text-rose-600 animate-pulse" />
                <span>{t('إرسال تعميم وإشعار لحظي لكافة أجنحة المستشفى', 'Complex-Wide Audio & Visual Broadcast')}</span>
              </h3>
              <p className="text-xs text-ink-500 mt-0.5">
                {t('يظهر هذا الإشعار فورا في جميع شاشات غرف العمليات والعيادات والاستقبال', 'Instantly displayed on all live screens in theaters, clinics, and nurse stations')}
              </p>
            </div>

            <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('مستوى الأهمية والإنذار', 'Alert Severity Level')}</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setBroadcastLevel('info')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      broadcastLevel === 'info' ? 'bg-pine-50 border-pine-700 text-pine-800' : 'bg-bone-50 text-ink-500'
                    }`}
                  >
                    {t('إشعار إداري عام', 'General Info')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastLevel('urgent')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      broadcastLevel === 'urgent' ? 'bg-brass-50 ring-1 ring-brass-400 text-brass-600' : 'bg-bone-50 text-ink-500'
                    }`}
                  >
                    {t('تنبيه هام', 'High Priority')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastLevel('alert')}
                    className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                      broadcastLevel === 'alert' ? 'bg-rose-50 border-rose-600 text-rose-800' : 'bg-bone-50 text-ink-500'
                    }`}
                  >
                    {t('طوارئ عاجلة (Code)', 'Urgent Emergency')}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink-700 block mb-1">{t('نص الإشعار / التعميم *', 'Broadcast Message *')}</label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder={t('يرجى من فريق التمريض تجهيز جناح العمليات 2 لجراحة مياه بيضاء طارئة...', 'All teams note: Visiting Professor Dr. Katamish starting refractive laser schedule in OR-3...')}
                  className="w-full p-2.5 bg-bone-50 border border-pine-200 rounded-xl focus:ring-2 focus:ring-rose-500 font-semibold"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-bone-100">
                <button
                  type="button"
                  onClick={() => setIsBroadcastOpen(false)}
                  className="px-4 py-2 text-ink-500 hover:bg-bone-100 rounded-xl font-bold transition-colors cursor-pointer"
                >
                  {t('إلغاء', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('بث الإشعار الآن', 'Broadcast Now')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
