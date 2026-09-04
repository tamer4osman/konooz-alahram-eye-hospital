import type {
  CreateEquipmentInput,
  EquipmentPatch,
  ResolvedEquipmentCreate,
} from './types';
import { EquipmentNameRequiredError } from './types';

// Pure business rules.

/** Default device status for newly registered equipment. */
const DEFAULT_EQUIPMENT_STATUS: ResolvedEquipmentCreate['status'] = 'operational';

/**
 * Resolve equipment create: bilingual name required in at least one language
 * (fallback fills the other), default status operational, blank-string defaults.
 */
export function resolveEquipmentCreate(
  input: CreateEquipmentInput,
): ResolvedEquipmentCreate {
  const nameAr = input.nameAr ?? input.nameEn ?? null;
  const nameEn = input.nameEn ?? input.nameAr ?? null;
  if (!nameAr && !nameEn) {
    throw new EquipmentNameRequiredError();
  }
  return {
    nameAr: nameAr!,
    nameEn,
    brand: input.brand ?? '',
    modelNumber: input.model ?? null,
    serialNumber: input.serialNumber ?? '',
    departmentAr: input.departmentAr ?? '',
    departmentEn: input.departmentEn ?? null,
    roomCode: input.roomCode ?? '',
    status: input.status ?? DEFAULT_EQUIPMENT_STATUS,
    notesAr: input.notesAr ?? '',
    notesEn: input.notesEn ?? null,
  };
}

/**
 * Equipment patch carries no derived transitions today; maintenance dates are
 * entered by staff. Single place to add derivations (e.g. offline_alert
 * forces maintenance_scheduled).
 */
export function resolveEquipmentPatch(patch: EquipmentPatch): EquipmentPatch {
  return { ...patch };
}
