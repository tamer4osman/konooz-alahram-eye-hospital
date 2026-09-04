export type EquipmentStatus =
  | 'operational'
  | 'in_use'
  | 'under_calibration'
  | 'maintenance_scheduled'
  | 'offline_alert';

export interface CreateEquipmentInput {
  nameAr?: string;
  nameEn?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  departmentAr?: string;
  departmentEn?: string;
  roomCode?: string;
  status?: EquipmentStatus;
  notesAr?: string;
  notesEn?: string;
}

export interface EquipmentPatch {
  status?: EquipmentStatus;
  healthScore?: number;
  uptimePercentage?: number;
  totalProceduresRun?: number;
  lastMaintenanceDate?: string | null;
  nextServiceDue?: string | null;
  technicianInChargeAr?: string;
  technicianInChargeEn?: string | null;
  roomCode?: string;
  notesAr?: string;
  notesEn?: string | null;
}

export class EquipmentNotFoundError extends Error {
  constructor() {
    super('Equipment not found');
    this.name = 'EquipmentNotFoundError';
  }
}

export class EquipmentNameRequiredError extends Error {
  constructor() {
    super('Equipment requires a name in at least one language');
    this.name = 'EquipmentNameRequiredError';
  }
}

/** Fully-resolved create payload the adapter persists verbatim. */
export interface ResolvedEquipmentCreate {
  nameAr: string;
  nameEn: string | null;
  brand: string;
  modelNumber: string | null;
  serialNumber: string;
  departmentAr: string;
  departmentEn: string | null;
  roomCode: string;
  status: EquipmentStatus;
  notesAr: string;
  notesEn: string | null;
}
