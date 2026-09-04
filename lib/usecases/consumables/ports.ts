import type {
  ConsumablePatch,
  ResolvedConsumableCreate,
} from './types';
import type { SurgicalConsumable as ConsumableDTO } from '@/data/dashboardData';

// Per-use-case minimal ports (ISP).

export interface ConsumableReader {
  list(): Promise<ConsumableDTO[]>;
}

export interface ConsumableWriter {
  create(resolved: ResolvedConsumableCreate): Promise<ConsumableDTO>;
  update(id: string, patch: ConsumablePatch): Promise<ConsumableDTO>;
}
