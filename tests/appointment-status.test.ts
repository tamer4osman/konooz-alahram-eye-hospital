import { describe, it, expect, vi } from 'vitest';
import {
  resolveStatusPatch,
  markAppointmentStatus,
  AppointmentNotFoundError,
  InvalidStatusTransitionError,
} from '@/lib/usecases/appointments';
import type {
  AppointmentStatusReader,
  AppointmentStatusWriter,
  AppointmentStatusUpdate,
  LiveAppointmentStatus,
} from '@/lib/usecases/appointments';

// ─────────────────────────────────────────────
// Appointment status transitions (staff PATCH)
// ─────────────────────────────────────────────

describe('resolveStatusPatch', () => {
  it('resolves a cancellation with reason and trims the note', () => {
    const resolved = resolveStatusPatch(
      { status: 'cancelled', reason: 'patient_request', note: '  سيسافر المريض  ' },
      'scheduled',
    );
    expect(resolved).toEqual({
      status: 'cancelled',
      reason: 'patient_request',
      note: 'سيسافر المريض',
    });
  });

  it('resolves a no_show with reason and null note when note is blank', () => {
    const resolved = resolveStatusPatch(
      { status: 'no_show', reason: 'other', note: '   ' },
      'confirmed',
    );
    expect(resolved).toEqual({ status: 'no_show', reason: 'other', note: null });
  });

  it('rejects when reason is missing', () => {
    expect(() =>
      resolveStatusPatch({ status: 'cancelled' } as AppointmentStatusUpdate, 'scheduled'),
    ).toThrow(InvalidStatusTransitionError);
  });

  it('rejects transitions from terminal states', () => {
    for (const current of ['completed', 'cancelled', 'no_show'] as LiveAppointmentStatus[]) {
      expect(() =>
        resolveStatusPatch({ status: 'cancelled', reason: 'other' }, current),
      ).toThrow(InvalidStatusTransitionError);
    }
  });

  it('rejects transitions from in_queue', () => {
    expect(() =>
      resolveStatusPatch({ status: 'cancelled', reason: 'other' }, 'in_queue'),
    ).toThrow(InvalidStatusTransitionError);
  });

  it('allows both scheduled and confirmed sources', () => {
    for (const current of ['scheduled', 'confirmed'] as LiveAppointmentStatus[]) {
      expect(() =>
        resolveStatusPatch({ status: 'no_show', reason: 'duplicate' }, current),
      ).not.toThrow();
    }
  });
});

describe('markAppointmentStatus', () => {
  function stubReader(status: LiveAppointmentStatus | null): AppointmentStatusReader {
    return { findStatus: vi.fn().mockResolvedValue(status) };
  }

  function stubWriter(): AppointmentStatusWriter & { applyStatusPatch: ReturnType<typeof vi.fn> } {
    return { applyStatusPatch: vi.fn().mockResolvedValue(undefined) };
  }

  it('applies the resolved patch for an existing scheduled appointment', async () => {
    const writer = stubWriter();
    await markAppointmentStatus(
      stubReader('scheduled'),
      writer,
      'apt-1',
      { status: 'no_show', reason: 'other' },
    );
    expect(writer.applyStatusPatch).toHaveBeenCalledWith('apt-1', {
      status: 'no_show',
      reason: 'other',
      note: null,
    });
  });

  it('throws AppointmentNotFoundError when the reader misses', async () => {
    await expect(
      markAppointmentStatus(stubReader(null), stubWriter(), 'apt-x', {
        status: 'cancelled',
        reason: 'other',
      }),
    ).rejects.toThrow(AppointmentNotFoundError);
  });

  it('does not write when transition rules reject the patch', async () => {
    const writer = stubWriter();
    await expect(
      markAppointmentStatus(stubReader('completed'), writer, 'apt-1', {
        status: 'cancelled',
        reason: 'other',
      }),
    ).rejects.toThrow(InvalidStatusTransitionError);
    expect(writer.applyStatusPatch).not.toHaveBeenCalled();
  });
});
