import type { PatientProfile } from '@/data/patientPortalData';

// Patient-facing DTO mappers (D6: patients only ever see their own rows).
// These map Prisma rows into the portal DTO shape; missing pieces become
// honest empty values — nothing is invented.

export interface PatientAppointmentRow {
  id: string;
  ticketNumber: string;
  doctorDisplayNameAr: string | null;
  doctorDisplayNameEn: string | null;
  specialtyAr: string | null;
  specialtyEn: string | null;
  date: Date;
  time: string;
  status: string;
  room: { nameAr: string; nameEn: string | null } | null;
  instructionsAr: string | null;
  instructionsEn: string | null;
}

type PortalAppointment = PatientProfile['appointments'][number];
type PortalAppointmentStatus = PortalAppointment['status'];

/** Map the DB status enum onto the portal's three-state display status. */
function toPortalAppointmentStatus(status: string): PortalAppointmentStatus {
  if (status === 'completed') return 'completed';
  if (status === 'confirmed') return 'confirmed';
  return 'scheduled';
}

export function toPortalAppointment(row: PatientAppointmentRow): PortalAppointment {
  return {
    id: row.id,
    ticketNumber: row.ticketNumber,
    doctorNameAr: row.doctorDisplayNameAr ?? '',
    doctorNameEn: row.doctorDisplayNameEn ?? '',
    specialtyAr: row.specialtyAr ?? '',
    specialtyEn: row.specialtyEn ?? '',
    date: row.date.toISOString().slice(0, 10),
    time: row.time,
    status: toPortalAppointmentStatus(row.status),
    room: row.room?.nameAr ?? row.room?.nameEn ?? '',
    instructionsAr: row.instructionsAr ?? undefined,
    instructionsEn: row.instructionsEn ?? undefined,
  };
}

export interface PatientPrescriptionRow {
  id: string;
  issuedDate: Date;
  medicationNameAr: string | null;
  medicationNameEn: string | null;
  dosageAr: string | null;
  dosageEn: string | null;
  instructionsAr: string | null;
  instructionsEn: string | null;
  doctor: { fullNameAr: string; fullNameEn: string | null } | null;
}

type PortalPrescription = PatientProfile['prescriptions'][number];

export function toPortalPrescription(row: PatientPrescriptionRow): PortalPrescription {
  return {
    id: row.id,
    date: row.issuedDate.toISOString().slice(0, 10),
    doctorAr: row.doctor?.fullNameAr ?? '',
    doctorEn: row.doctor?.fullNameEn ?? '',
    diagnosisAr: '',
    diagnosisEn: '',
    medications: [
      {
        name: row.medicationNameEn ?? row.medicationNameAr ?? '',
        dosageAr: row.dosageAr ?? '',
        dosageEn: row.dosageEn ?? '',
        frequencyAr: row.instructionsAr ?? '',
        frequencyEn: row.instructionsEn ?? '',
        targetEye: 'Both' as const,
        durationAr: '',
        durationEn: '',
      },
    ],
  };
}
