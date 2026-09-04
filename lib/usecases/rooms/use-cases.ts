import type { HospitalRoom as RoomDTO } from '@/data/dashboardData';
import type { CreateRoomInput, RoomPatch } from './types';
import type { RoomReader, RoomWriter } from './ports';
import { resolveRoomCreate, resolveRoomPatch } from './rules';

// Use cases: orchestration only. The domain validation error
// (RoomNameRequiredError) propagates from rules; adapter typed errors
// (RoomNotFoundError, RoomConflictError) propagate unchanged.

export async function listRooms(reader: RoomReader): Promise<RoomDTO[]> {
  return reader.list();
}

export async function createRoom(writer: RoomWriter, input: CreateRoomInput): Promise<RoomDTO> {
  return writer.create(resolveRoomCreate(input));
}

export async function updateRoom(
  writer: RoomWriter,
  id: string,
  patch: RoomPatch,
): Promise<RoomDTO> {
  return writer.update(id, resolveRoomPatch(patch));
}

export async function deleteRoom(writer: RoomWriter, id: string): Promise<void> {
  await writer.delete(id);
}
