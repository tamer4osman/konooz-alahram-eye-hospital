import type {
  EquipmentPatch,
  ResolvedEquipmentCreate,
} from './types';
import type { HospitalEquipment as EquipmentDTO } from '@/data/dashboardData';

// Per-use-case minimal ports (ISP).

export interface EquipmentReader {
  list(): Promise<EquipmentDTO[]>;
}

export interface EquipmentWriter {
  create(resolved: ResolvedEquipmentCreate): Promise<EquipmentDTO>;
  update(id: string, patch: EquipmentPatch): Promise<EquipmentDTO>;
  delete(id: string): Promise<void>;
}
