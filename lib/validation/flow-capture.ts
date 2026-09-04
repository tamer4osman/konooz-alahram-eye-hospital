// Pure client-side flow-capture form validation + payload building. Mirrors
// the server rules in lib/usecases/patient-flow — defense-in-depth, the API
// re-validates everything.

export const FLOW_STAGE_TYPES = [
  'reception',
  'triage',
  'diagnostics',
  'consultation',
  'pre_op',
  'in_or',
  'procedure',
  'pacu',
  'waiting_discharge',
  'discharged',
] as const;

export type FlowStageInput = (typeof FLOW_STAGE_TYPES)[number];

export interface FlowFormInput {
  patientId: string;
  stageType: FlowStageInput;
}

export interface FlowOpenPayload {
  patientId: string;
  stageType: FlowStageInput;
}

export type FlowFormErrors = {
  patientId?: boolean;
  stageType?: boolean;
};

export type FlowOpenResult =
  | { ok: true; payload: FlowOpenPayload }
  | { ok: false; errors: FlowFormErrors };

function isFlowStageInput(value: string): value is FlowStageInput {
  return (FLOW_STAGE_TYPES as readonly string[]).includes(value);
}

export function buildFlowOpenPayload(input: FlowFormInput): FlowOpenResult {
  const errors: FlowFormErrors = {};

  const patientId = input.patientId.trim();
  if (!patientId || patientId.length > 80) {
    errors.patientId = true;
  }
  if (!isFlowStageInput(input.stageType)) {
    errors.stageType = true;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, payload: { patientId, stageType: input.stageType } };
}

export interface FlowExitFormInput {
  noteAr?: string;
  noteEn?: string;
}

export interface FlowExitPayload {
  noteAr?: string;
  noteEn?: string;
}

export type FlowExitResult =
  | { ok: true; payload: FlowExitPayload }
  | { ok: false; errors: { noteAr?: boolean; noteEn?: boolean } };

export function buildFlowExitPayload(input: FlowExitFormInput): FlowExitResult {
  const errors: { noteAr?: boolean; noteEn?: boolean } = {};
  const payload: FlowExitPayload = {};

  const noteAr = input.noteAr?.trim();
  if (noteAr) {
    if (noteAr.length > 300) errors.noteAr = true;
    else payload.noteAr = noteAr;
  }
  const noteEn = input.noteEn?.trim();
  if (noteEn) {
    if (noteEn.length > 300) errors.noteEn = true;
    else payload.noteEn = noteEn;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, payload };
}
