export type RoomStatus =
  | 'occupied_surgery'
  | 'in_consultation'
  | 'ready_clean'
  | 'sterilizing'
  | 'maintenance';

export type RoomType =
  | 'operating_theater'
  | 'outpatient_clinic'
  | 'diagnostic_suite'
  | 'recovery_ward'
  | 'laser_room';

export interface CreateRoomInput {
  code: string;
  nameAr?: string;
  nameEn?: string;
  type: RoomType;
  floorAr?: string;
  floorEn?: string;
  capacity?: number;
  tempCelsius?: number;
  humidityPercent?: number;
  mainDeviceAssignedAr?: string;
  mainDeviceAssignedEn?: string;
}

export interface RoomPatch {
  status?: RoomStatus;
  sterilizationStatus?: 'sterile_verified' | 'in_progress' | 'required';
  airPressureHepa?: 'positive_optimal' | 'standard' | 'warning';
  tempCelsius?: number;
  humidityPercent?: number;
  occupiedCount?: number;
  currentDoctorAr?: string | null;
  currentDoctorEn?: string | null;
  currentPatientId?: string | null;
  currentProcedureAr?: string | null;
  currentProcedureEn?: string | null;
  capacity?: number;
  mainDeviceAssignedAr?: string;
  mainDeviceAssignedEn?: string | null;
}

/** Fully-resolved create payload the adapter persists verbatim. */
export interface ResolvedRoomCreate {
  code: string;
  nameAr: string;
  nameEn: string | null;
  type: RoomType;
  floorAr: string;
  floorEn: string | null;
  capacity: number;
  tempCelsius: number;
  humidityPercent: number;
  mainDeviceAssignedAr: string;
  mainDeviceAssignedEn: string | null;
}

export class RoomNameRequiredError extends Error {
  constructor() {
    super('Room requires a name in at least one language');
    this.name = 'RoomNameRequiredError';
  }
}

export class RoomNotFoundError extends Error {
  constructor() {
    super('Room not found');
    this.name = 'RoomNotFoundError';
  }
}

export class RoomConflictError extends Error {
  constructor() {
    super('Room code already exists');
    this.name = 'RoomConflictError';
  }
}
