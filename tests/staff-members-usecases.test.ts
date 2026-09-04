import { describe, it, expect, vi } from 'vitest';
import {
  parseCategory,
  resolveStaffMemberCreate,
  resolveDeactivation,
  addStaffMember,
  listStaffDirectory,
  DEFAULT_CATEGORY,
  DEFAULT_STATUS,
  DEFAULT_SHIFT,
  StaffMemberNameRequiredError,
} from '@/lib/usecases/staff-members';
import type { StaffDirectoryReader, StaffDirectoryWriter } from '@/lib/usecases/staff-members';

const MEMBER = { id: 'sm-1', nameAr: 'د. فاطمة' };

function stubWriter(maxOrder = 4): StaffDirectoryWriter {
  return {
    maxSortOrder: vi.fn().mockResolvedValue(maxOrder),
    create: vi.fn().mockResolvedValue(MEMBER),
    updateStatus: vi.fn().mockResolvedValue(MEMBER),
    deactivate: vi.fn().mockResolvedValue(undefined),
  };
}

describe('parseCategory', () => {
  it('accepts valid categories', () => {
    expect(parseCategory('surgeon')).toBe('surgeon');
    expect(parseCategory('admin')).toBe('admin');
  });

  it('falls back to nurse for unknown/missing values (defensive default)', () => {
    expect(parseCategory('wizard')).toBe(DEFAULT_CATEGORY);
    expect(parseCategory(undefined)).toBe(DEFAULT_CATEGORY);
    expect(parseCategory(42)).toBe(DEFAULT_CATEGORY);
  });
});

describe('resolveStaffMemberCreate', () => {
  it('throws when nameAr missing (wire-shape rule preserved)', () => {
    expect(() => resolveStaffMemberCreate({}, 0)).toThrow(StaffMemberNameRequiredError);
    expect(() => resolveStaffMemberCreate({ nameAr: 42 }, 0)).toThrow(StaffMemberNameRequiredError);
  });

  it('coerces non-string optionals defensively and applies defaults', () => {
    const resolved = resolveStaffMemberCreate(
      { nameAr: 'د. فاطمة', roleAr: 42, status: undefined, shift: undefined },
      5,
    );
    expect(resolved.nameAr).toBe('د. فاطمة');
    expect(resolved.nameEn).toBeNull();
    expect(resolved.roleAr).toBe('');
    expect(resolved.status).toBe(DEFAULT_STATUS);
    expect(resolved.status).toBe('on_duty');
    expect(resolved.shift).toBe(DEFAULT_SHIFT);
    expect(resolved.shift).toBe('morning');
    expect(resolved.departmentAr).toBe('');
    expect(resolved.phone).toBeNull();
    expect(resolved.sortOrder).toBe(5);
  });
});

describe('resolveDeactivation', () => {
  it('soft-delete: isActive false + off_duty (history preserved)', () => {
    expect(resolveDeactivation()).toEqual({ isActive: false, status: 'off_duty' });
  });
});

describe('use cases', () => {
  it('addStaffMember computes next sort order from writer', async () => {
    const writer = stubWriter(4);
    const result = await addStaffMember(writer, { nameAr: 'د. فاطمة' });
    expect(writer.maxSortOrder).toHaveBeenCalledOnce();
    const resolved = vi.mocked(writer.create).mock.calls[0][0];
    expect(resolved.sortOrder).toBe(5);
    expect(result).toEqual(MEMBER);
  });

  it('addStaffMember propagates name error from rules', async () => {
    const writer = stubWriter();
    await expect(addStaffMember(writer, {})).rejects.toThrow(StaffMemberNameRequiredError);
    expect(writer.create).not.toHaveBeenCalled();
  });

  it('listStaffDirectory delegates to reader', async () => {
    const reader: StaffDirectoryReader = { listActive: vi.fn().mockResolvedValue([MEMBER]) };
    expect(await listStaffDirectory(reader)).toEqual([MEMBER]);
  });
});
