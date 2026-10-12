// Invoice use-case layer types. Framework-free: no Prisma, no Next.js.

export type InvoiceStatus =
  | 'paid'
  | 'pending_insurance'
  | 'pre_auth_approved'
  | 'draft'
  | 'pending'
  | 'partially_paid'
  | 'cancelled';

/** Incoming create payload (zod/route vocabulary: procedure*, status optional). */
export interface CreateInvoiceInput {
  invoiceNumber?: string;
  ticketNumber?: string;
  patientNameAr?: string;
  patientNameEn?: string;
  procedureAr?: string;
  procedureEn?: string;
  insuranceNameAr?: string;
  insuranceNameEn?: string;
  surgeonFeeLYD?: number;
  orFacilityFeeLYD?: number;
  anesthesiaFeeLYD?: number;
  lensOrDeviceFeeLYD?: number;
  consumablesFeeLYD?: number;
  totalGrossLYD?: number;
  insuranceCoveredLYD?: number;
  patientCoPayLYD?: number;
  status?: InvoiceStatus;
}

/** Incoming status patch (route PATCH body vocabulary). */
export interface InvoiceStatusPatch {
  status?: InvoiceStatus;
  paidDate?: string | null;
}

/** Audit + clock context supplied by the route handler at call time. */
export interface InvoiceCreateContext {
  actorEmail: string;
  now: Date;
}

/** Fully-resolved create payload the adapter persists verbatim. */
export interface ResolvedInvoiceCreate {
  invoiceNumber: string;
  ticketNumber: string;
  patientId: string;
  patientNameAr: string | null;
  patientNameEn: string | null;
  serviceAr: string;
  serviceEn: string | null;
  insuranceNameAr: string;
  insuranceNameEn: string | null;
  surgeonFeeLYD: number;
  orFacilityFeeLYD: number;
  anesthesiaFeeLYD: number;
  lensOrDeviceFeeLYD: number;
  consumablesFeeLYD: number;
  totalGrossLYD: number;
  insuranceCoveredLYD: number;
  patientCoPayLYD: number;
  amount: number;
  status: InvoiceStatus;
  issuedDate: Date;
  createdBy: string;
}

/** Fully-resolved status patch the adapter persists verbatim. */
export interface ResolvedStatusPatch {
  status?: InvoiceStatusPatch['status'];
  paidDate?: Date | null;
}
