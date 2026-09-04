import type { RoomPatch, ResolvedRoomCreate } from './types';
import type { HospitalRoom as RoomDTO } from '@/data/dashboardData';

// Per-use-case minimal ports (ISP).

export interface RoomReader {
  list(): Promise<RoomDTO[]>;
}

export interface RoomWriter {
  create(resolved: ResolvedRoomCreate): Promise<RoomDTO>;
  update(id: string, patch: RoomPatch): Promise<RoomDTO>;
  delete(id: string): Promise<void>;
}
