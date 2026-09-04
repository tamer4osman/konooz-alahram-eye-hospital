import type { CreateRoomInput, ResolvedRoomCreate, RoomPatch } from './types';
import { RoomNameRequiredError } from './types';

// Pure business rules.

/**
 * Resolve room create: bilingual fallback (one language fills the other),
 * environment defaults (20°C / 45%), empty device assignment.
 * @throws RoomNameRequiredError when neither language supplies a name.
 */
export function resolveRoomCreate(input: CreateRoomInput): ResolvedRoomCreate {
  const nameAr = input.nameAr ?? input.nameEn ?? null;
  const nameEn = input.nameEn ?? input.nameAr ?? null;
  if (!nameAr && !nameEn) {
    throw new RoomNameRequiredError();
  }
  return {
    code: input.code,
    nameAr: nameAr!,
    nameEn,
    type: input.type,
    floorAr: input.floorAr ?? '',
    floorEn: input.floorEn ?? null,
    capacity: input.capacity ?? 1,
    tempCelsius: input.tempCelsius ?? 20,
    humidityPercent: input.humidityPercent ?? 45,
    mainDeviceAssignedAr: input.mainDeviceAssignedAr ?? '',
    mainDeviceAssignedEn: input.mainDeviceAssignedEn ?? null,
  };
}

/**
 * Room status transitions carry no side effects today (unlike beds), but the
 * rule exists as the single place to add them (e.g. sterilizing → timer).
 */
export function resolveRoomPatch(patch: RoomPatch): RoomPatch {
  return { ...patch };
}
