import { describe, expect, it } from 'vitest';
import { toClinicalDTO } from '@/lib/dashboard/clinical';

// Minimal row factory shaped like Prisma ClinicalConsultationRecord & items.
function makeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'c1',
    ticketNumber: 'T-100',
    patientId: 'PT-1',
    patientNameAr: 'محمد',
    patientNameEn: null,
    patientAge: null,
    patientGender: 'MALE',
    patientPhone: '091',
    doctorNameAr: 'د. أحمد',
    doctorNameEn: null,
    clinicRoom: 'C-105',
    visitDate: null,
    visitTime: '',
    status: null,
    chiefComplaintAr: null,
    chiefComplaintEn: null,
    visualAcuityOD_Unaided: '',
    visualAcuityOD_BCVA: '',
    visualAcuityOS_Unaided: '',
    visualAcuityOS_BCVA: '',
    iopOD_mmHg: null,
    iopOS_mmHg: null,
    corneaAr: null,
    corneaEn: null,
    anteriorChamberAr: null,
    anteriorChamberEn: null,
    lensStatusAr: null,
    lensStatusEn: null,
    fundusMaculaAr: null,
    fundusMaculaEn: null,
    icdCode: 'H25.9',
    diagnosisAr: null,
    diagnosisEn: null,
    surgicalPlan: null,
    nextFollowUpDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'staff@test',
    items: [] as Array<Record<string, unknown>>,
    ...overrides,
  } as unknown as Parameters<typeof toClinicalDTO>[0];
}

describe('toClinicalDTO', () => {
  it('maps nulls to honest display defaults without mutating input', () => {
    const row = makeRow();
    const dto = toClinicalDTO(row);

    expect(dto.patientNameEn).toBe('');
    expect(dto.patientAge).toBe(0);
    expect(dto.visitDate).toBe('');
    expect(dto.status).toBe('completed'); // null status -> completed fallback
    expect(dto.iopOD_mmHg).toBe(0);
    expect(dto.diagnosisAr).toBe('');
    expect(dto.surgicalPlan).toBeUndefined();
    expect(dto.nextFollowUpDate).toBe('');
    // input row untouched
    expect(row.status).toBeNull();
  });

  it('normalizes gender enum MALE/FEMALE -> male/female', () => {
    expect(toClinicalDTO(makeRow({ patientGender: 'FEMALE' })).patientGender).toBe('female');
    expect(toClinicalDTO(makeRow({ patientGender: 'MALE' })).patientGender).toBe('male');
    expect(toClinicalDTO(makeRow({ patientGender: null })).patientGender).toBe('male');
  });

  it('passes through populated clinical fields untouched', () => {
    const dto = toClinicalDTO(
      makeRow({
        patientNameEn: 'Mohammed',
        patientAge: 54,
        visitDate: '2026-08-20',
        status: 'in_progress',
        chiefComplaintAr: 'تشوش الإبصار',
        surgicalPlan: 'Phaco IOL',
        nextFollowUpDate: '2026-09-01',
      }),
    );

    expect(dto.patientNameEn).toBe('Mohammed');
    expect(dto.patientAge).toBe(54);
    expect(dto.visitDate).toBe('2026-08-20');
    expect(dto.status).toBe('in_progress');
    expect(dto.chiefComplaintAr).toBe('تشوش الإبصار');
    expect(dto.surgicalPlan).toBe('Phaco IOL');
    expect(dto.nextFollowUpDate).toBe('2026-09-01');
    expect(dto.icdCode).toBe('H25.9');
  });

  it('maps prescriptions and drops empty tapering schedules to undefined', () => {
    const dto = toClinicalDTO(
      makeRow({
        items: [
          {
            id: 'rx1',
            drugNameAr: 'قطرة موكسيفلوكساسين',
            drugNameEn: null,
            category: 'antibiotic',
            eye: 'OD',
            dosage: 'قطرة',
            frequency: '4x',
            durationDays: 7,
            instructionsAr: null,
            instructionsEn: null,
            taperingSchedule: [],
          },
          {
            id: 'rx2',
            drugNameAr: 'ستيرويد',
            drugNameEn: 'Steroid',
            category: 'steroid',
            eye: 'OU',
            dosage: 'قطرة',
            frequency: '2x',
            durationDays: 14,
            instructionsAr: 'بعد الوجبات',
            instructionsEn: 'After meals',
            taperingSchedule: ['week1: 4x', 'week2: 2x'],
          },
        ],
      }),
    );

    expect(dto.prescriptions).toHaveLength(2);
    expect(dto.prescriptions[0]).toMatchObject({
      id: 'rx1',
      drugNameEn: '',
      category: 'antibiotic',
      eye: 'OD',
      durationDays: 7,
      instructionsAr: '',
    });
    expect(dto.prescriptions[0].taperingSchedule).toBeUndefined();
    expect(dto.prescriptions[1].taperingSchedule).toEqual(['week1: 4x', 'week2: 2x']);
  });

  it('returns an empty prescriptions array when the record has no items', () => {
    expect(toClinicalDTO(makeRow()).prescriptions).toEqual([]);
  });
});
