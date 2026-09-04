import { describe, it, expect, vi } from 'vitest';
import {
  generateTicket,
  resolveDoctorSnapshot,
  resolveAppointmentDate,
  resolveSpecialty,
  resolveAppointmentCreate,
  toBookingConfirmation,
  createBookingRequest,
  BOOKING_INSTRUCTIONS,
  BOOKING_LOCATION,
} from '@/lib/usecases/appointments';
import type { AppointmentWriter, DoctorReader } from '@/lib/usecases/appointments';
import type { DoctorLookupResult } from '@/lib/usecases/appointments';

const NOW = new Date('2026-09-03T10:00:00.000Z');

const SNAPSHOT: DoctorLookupResult = {
  displayNameAr: 'د. تجريبي',
  displayNameEn: 'Dr. Test',
  specialtyAr: 'الشبكية',
  specialtyEn: 'Retina',
};

function stubDoctorReader(result: DoctorLookupResult): DoctorReader {
  return { findSnapshot: vi.fn().mockResolvedValue(result) };
}

function stubWriter(ticket = 'BK-123456'): AppointmentWriter {
  return { createWithRetry: vi.fn().mockResolvedValue(ticket) };
}

describe('generateTicket', () => {
  it('matches the BK-XXXXXX format', () => {
    expect(generateTicket()).toMatch(/^BK-\d{6}$/);
  });

  it('produces different tickets across calls (probabilistic)', () => {
    const tickets = new Set(Array.from({ length: 50 }, generateTicket));
    expect(tickets.size).toBeGreaterThan(1);
  });
});

describe('resolveDoctorSnapshot', () => {
  it('returns null when no doctorId supplied', () => {
    expect(resolveDoctorSnapshot(undefined, SNAPSHOT)).toBeNull();
  });

  it('returns null when doctor lookup misses (unknown id)', () => {
    expect(resolveDoctorSnapshot('doc-1', null)).toBeNull();
  });

  it('returns the snapshot when doctor exists', () => {
    expect(resolveDoctorSnapshot('doc-1', SNAPSHOT)).toEqual(SNAPSHOT);
  });
});

describe('resolveAppointmentDate', () => {
  it('uses preferred date when supplied', () => {
    const d = resolveAppointmentDate('2026-10-01', NOW);
    expect(d.toISOString()).toBe(new Date('2026-10-01').toISOString());
  });

  it('falls back to +7 days when absent', () => {
    const d = resolveAppointmentDate(undefined, NOW);
    expect(d.toISOString()).toBe('2026-09-10T10:00:00.000Z');
  });
});

describe('resolveSpecialty', () => {
  it('prefers doctor specialty over condition title', () => {
    const s = resolveSpecialty(SNAPSHOT, { conditionTitleAr: 'مياه بيضاء' });
    expect(s).toEqual({ specialtyAr: 'الشبكية', specialtyEn: 'Retina' });
  });

  it('falls back to condition title when no doctor snapshot', () => {
    const s = resolveSpecialty(null, {
      conditionTitleAr: 'مياه بيضاء',
      conditionTitleEn: 'Cataract',
    });
    expect(s).toEqual({ specialtyAr: 'مياه بيضاء', specialtyEn: 'Cataract' });
  });

  it('returns nulls when neither source exists', () => {
    expect(resolveSpecialty(null, {})).toEqual({ specialtyAr: null, specialtyEn: null });
  });
});

describe('resolveAppointmentCreate', () => {
  it('composes full record: ticket, defaults, honest instructions, location', () => {
    const resolved = resolveAppointmentCreate({ preferredTime: '14:30' }, SNAPSHOT, NOW);
    expect(resolved.ticketNumber).toMatch(/^BK-\d{6}$/);
    expect(resolved.date.toISOString()).toBe('2026-09-10T10:00:00.000Z');
    expect(resolved.time).toBe('14:30');
    expect(resolved.status).toBe('scheduled');
    expect(resolved.source).toBe('PATIENT_REQUEST');
    expect(resolved.doctorDisplayNameAr).toBe('د. تجريبي');
    expect(resolved.specialtyAr).toBe('الشبكية');
    expect(resolved.instructionsAr).toBe(BOOKING_INSTRUCTIONS.instructionsAr);
    expect(resolved.instructionsEn).toBe(BOOKING_INSTRUCTIONS.instructionsEn);
    expect(resolved.locationAr).toBe(BOOKING_LOCATION.locationAr);
  });

  it('nulls doctor fields when no doctor snapshot', () => {
    const resolved = resolveAppointmentCreate({}, null, NOW);
    expect(resolved.doctorDisplayNameAr).toBeNull();
    expect(resolved.doctorDisplayNameEn).toBeNull();
  });

  it('passes intakeData through untouched', () => {
    const intakeData = { vision: '6/12', lens: 'monofocal' };
    const resolved = resolveAppointmentCreate({ intakeData }, null, NOW);
    expect(resolved.intakeData).toEqual(intakeData);
  });
});

describe('toBookingConfirmation', () => {
  it('exposes only ref + honest pending status', () => {
    expect(toBookingConfirmation('BK-654321')).toEqual({
      ref: 'BK-654321',
      status: 'pending_reception',
    });
  });
});

describe('createBookingRequest', () => {
  it('resolves doctor snapshot, persists, and returns confirmation', async () => {
    const doctors = stubDoctorReader(SNAPSHOT);
    const writer = stubWriter('BK-111111');
    const confirmation = await createBookingRequest(
      doctors,
      writer,
      { doctorId: 'doc-1', preferredDate: '2026-10-01' },
      NOW,
    );
    expect(doctors.findSnapshot).toHaveBeenCalledWith('doc-1');
    const resolved = vi.mocked(writer.createWithRetry).mock.calls[0][0];
    expect(resolved.doctorDisplayNameEn).toBe('Dr. Test');
    expect(resolved.date.toISOString()).toBe(new Date('2026-10-01').toISOString());
    expect(confirmation).toEqual({ ref: 'BK-111111', status: 'pending_reception' });
  });

  it('skips doctor lookup when no doctorId (saves a DB roundtrip)', async () => {
    const doctors = stubDoctorReader(SNAPSHOT);
    const writer = stubWriter();
    await createBookingRequest(doctors, writer, {}, NOW);
    expect(doctors.findSnapshot).not.toHaveBeenCalled();
    expect(vi.mocked(writer.createWithRetry).mock.calls[0][1]).toBe(5);
  });

  it('propagates writer errors to the caller', async () => {
    const doctors = stubDoctorReader(null);
    const writer: AppointmentWriter = {
      createWithRetry: vi.fn().mockRejectedValue(new Error('db down')),
    };
    await expect(createBookingRequest(doctors, writer, {}, NOW)).rejects.toThrow('db down');
  });
});
