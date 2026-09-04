import type { FlowStageType } from '@/lib/dashboard/patientFlow';
import type { FlowStageRef } from './ports';

// Pure business rules for stage capture: a patient has at most one open stage;
// opening a new stage auto-closes the previous one (the wait-time funnel
// derives from completed stage-to-stage transitions, so exits matter).

export class StageAlreadyOpenError extends Error {
  constructor() {
    super('المريض لديه مرحلة مفتوحة بالفعل — أغلقها أو غيّر المرحلة لتُغلق تلقائياً');
  }
}

export class StageAlreadyClosedError extends Error {
  constructor() {
    super('تم إغلاق هذه المرحلة مسبقاً');
  }
}

export class FlowStageNotFoundError extends Error {
  constructor() {
    super('مرحلة التدفق غير موجودة');
  }
}

export type StageOpenInput = { patientId: string; stageType: FlowStageType };

/**
 * Resolve an "open stage" action against the patient's current state.
 * - No open stage → simple create.
 * - Same stage already open → rejected (idempotency guard).
 * - Different stage open → previous stage auto-closes at `now`, then create.
 */
export function resolveStageOpen(
  current: FlowStageRef | null,
  input: StageOpenInput,
  now: Date,
): { closeId: string | null; create: { patientId: string; stageType: FlowStageType; enteredAt: Date } } {
  if (current && current.stageType === input.stageType) {
    throw new StageAlreadyOpenError();
  }
  return {
    closeId: current ? current.id : null,
    create: { patientId: input.patientId, stageType: input.stageType, enteredAt: now },
  };
}

/**
 * Resolve an "exit stage" action. Only open stages can be closed; the exit
 * timestamp is the moment reception confirmed the transition.
 */
export function resolveStageExit(
  current: FlowStageRef | null,
  now: Date,
): { id: string; exitedAt: Date } {
  if (!current) throw new FlowStageNotFoundError();
  if (current.exitedAt !== null) throw new StageAlreadyClosedError();
  return { id: current.id, exitedAt: now };
}
