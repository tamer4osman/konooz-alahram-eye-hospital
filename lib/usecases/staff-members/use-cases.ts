import type { CreateStaffMemberInput } from './types';
import type {
  StaffDirectoryReader,
  StaffDirectoryWriter,
} from './ports';
import {
  resolveStaffMemberCreate,
} from './rules';
import { StaffMemberNameRequiredError } from './types';

// Use cases: orchestration only. Business rules live in rules.ts; ports are
// injected as first arguments. Typed errors propagate unchanged.

export async function listStaffDirectory(reader: StaffDirectoryReader): Promise<Array<Record<string, unknown>>> {
  return reader.listActive();
}

export async function addStaffMember(
  writer: StaffDirectoryWriter,
  body: CreateStaffMemberInput,
): Promise<Record<string, unknown>> {
  const maxOrder = await writer.maxSortOrder();
  const resolved = resolveStaffMemberCreate(body, maxOrder + 1);
  return writer.create(resolved);
}

export async function updateStaffMemberStatus(
  writer: StaffDirectoryWriter,
  id: string,
  status: string,
): Promise<Record<string, unknown>> {
  return writer.updateStatus(id, status);
}

export async function removeStaffMember(
  writer: StaffDirectoryWriter,
  id: string,
): Promise<void> {
  await writer.deactivate(id);
}

export { StaffMemberNameRequiredError };
