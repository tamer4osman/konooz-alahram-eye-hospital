import { describe, it, expect, vi } from 'vitest';
import {
  synthesizePatientId,
  resolveGender,
  resolvePrescription,
  resolveClinicalCreate,
  createClinicalRecord,
  listClinicalRecords,
  DEFAULT_CLINICAL_STATUS,
  DEFAULT_RX_CATEGORY,
  DEFAULT_RX_EYE,
} from '@/lib/usecases/clinical';
import { isValidTimeframe, loadAnalytics, dashboardAnalyticsEngine } from '@/lib/usecases/analytics';
import { loadFlowBoard } from '@/lib/usecases/patient-flow';
import type { ClinicalReader, ClinicalWriter } from '@/lib/usecases/clinical';
import type { DepartmentsReader, AnalyticsEngine } from '@/lib/usecases/analytics';
import type { PatientFlowReader } from '@/lib/usecases/patient-flow';
import type { ClinicalConsultationRecord as ClinicalDTO } from '@/data/dashboardData';
import type { Specialty } from '@/data/hospitalData';

const NOW = new Date('2026-09-03T12:00:00.000Z');
const SAMPLE = { id: 'cl-1' } as unknown as ClinicalDTO;

describe('clinical rules', () => {
  it('synthesizes provisional patient id from timestamp', () => {
    expect(synthesizePatientId(NOW)).toBe('PT-1788436800000');
  });

  it('maps gender with male default', () => {
    expect(resolveGender(undefined)).toBe('MALE');
    expect(resolveGender('male')).toBe('MALE');
    expect(resolveGender('female')).toBe('FEMALE');
  });

  it('applies prescription defaults: lubricant, OU, blanks, empty tapering', () => {
    const rx = resolvePrescription({});
    expect(rx.category).toBe(DEFAULT_RX_CATEGORY);
    expect(rx.category).toBe('lubricant');
    expect(rx.eye).toBe(DEFAULT_RX_EYE);
    expect(rx.eye).toBe('OU');
    expect(rx.drugNameAr).toBe('');
    expect(rx.dosage).toBe('');
    expect(rx.durationDays).toBe(0);
    expect(rx.taperingSchedule).toEqual([]);
  });

  it('preserves explicit prescription fields', () => {
    const rx = resolvePrescription({
      drugNameAr: 'مضاد حيوي',
      category: 'antibiotic',
      eye: 'OD',
      durationDays: 7,
      taperingSchedule: ['يوم 1', 'يوم 2'],
    });
    expect(rx.category).toBe('antibiotic');
    expect(rx.eye).toBe('OD');
    expect(rx.durationDays).toBe(7);
    expect(rx.taperingSchedule).toEqual(['يوم 1', 'يوم 2']);
  });

  it('resolves create: provisional id, completed default, date from visitDate', () => {
    const resolved = resolveClinicalCreate(
      { patientNameAr: 'مريض', visitDate: '2026-01-15' },
      NOW,
    );
    expect(resolved.patientId).toBe('PT-1788436800000');
    expect(resolved.status).toBe(DEFAULT_CLINICAL_STATUS);
    expect(resolved.status).toBe('completed');
    expect(resolved.date.toISOString()).toBe(new Date('2026-01-15').toISOString());
    expect(resolved.patientGender).toBe('MALE');
    expect(resolved.icdCode).toBe('');
    expect(resolved.visitTime).toBe('');
  });

  it('date falls back to now when no visitDate', () => {
    const resolved = resolveClinicalCreate({ patientNameAr: 'مريض' }, NOW);
    expect(resolved.date).toBe(NOW);
  });

  it('create use case passes actor email to writer', async () => {
    const writer: ClinicalWriter = { create: vi.fn().mockResolvedValue(SAMPLE) };
    await createClinicalRecord(writer, { patientNameAr: 'مريض' }, 'admin@test.com', NOW);
    const [resolved, actor] = vi.mocked(writer.create).mock.calls[0];
    expect(actor).toBe('admin@test.com');
    expect(resolved.patientNameAr).toBe('مريض');
  });

  it('list use case delegates to reader', async () => {
    const reader: ClinicalReader = { list: vi.fn().mockResolvedValue([SAMPLE]) };
    expect(await listClinicalRecords(reader)).toEqual([SAMPLE]);
  });
});

describe('analytics rules', () => {
  it('validates timeframes', () => {
    expect(isValidTimeframe('day')).toBe(true);
    expect(isValidTimeframe('week')).toBe(true);
    expect(isValidTimeframe('month')).toBe(true);
    expect(isValidTimeframe('year')).toBe(true);
    expect(isValidTimeframe('hour')).toBe(false);
    expect(isValidTimeframe('')).toBe(false);
  });

  it('loadAnalytics passes departments into engine', async () => {
    const specialties = [{ id: 'sp-1' }] as unknown as Specialty[];
    const departments: DepartmentsReader = { listActive: vi.fn().mockResolvedValue(specialties) };
    const engine: AnalyticsEngine = { compute: vi.fn().mockResolvedValue({ ok: true }) };
    const result = await loadAnalytics(departments, engine, 'week');
    expect(departments.listActive).toHaveBeenCalledOnce();
    expect(engine.compute).toHaveBeenCalledWith('week', specialties);
    expect(result).toEqual({ ok: true });
  });

  it('dashboard engine delegates to computeAnalytics', () => {
    expect(typeof dashboardAnalyticsEngine.compute).toBe('function');
  });
});

describe('patient-flow use case', () => {
  it('queries events from start of day and computes stages', async () => {
    const reader: PatientFlowReader = {
      listTodayEvents: vi.fn().mockResolvedValue([]),
    };
    const result = await loadFlowBoard(reader, NOW);
    const calledStart = vi.mocked(reader.listTodayEvents).mock.calls[0][0];
    expect(calledStart.getHours()).toBe(0);
    expect(calledStart.getMinutes()).toBe(0);
    // Empty events still yields the 7 stage meta rows
    expect(result).toHaveLength(7);
  });
});
