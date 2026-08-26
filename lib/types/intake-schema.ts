/**
 * Per-department intake schema — defines the dynamic form fields
 * rendered in BookingModal for each department/clinic.
 *
 * Stored as JSON on Department.intakeSchema. When null, the modal
 * falls back to the hardcoded eye-specific triage section.
 */

export type IntakeFieldType =
  | 'text'
  | 'tel'
  | 'email'
  | 'select'
  | 'radio-group'
  | 'date'
  | 'textarea';

export interface IntakeFieldOption {
  value: string;
  labelAr: string;
  labelEn: string;
  /** Optional emoji suffix shown in the label (e.g. " 👀") */
  emoji?: string;
}

export interface IntakeField {
  /** Unique key stored in appointment.intakeData */
  id: string;
  type: IntakeFieldType;
  labelAr: string;
  labelEn: string;
  /** Placeholder text (optional) */
  placeholderAr?: string;
  placeholderEn?: string;
  /** Whether the field is required (default: false) */
  required?: boolean;
  /** Options for select / radio-group */
  options?: IntakeFieldOption[];
  /** Min length for text/tel/textarea */
  minLength?: number;
  /** Max length for text/tel/textarea */
  maxLength?: number;
  /** Regex pattern for validation */
  pattern?: string;
}

export type IntakeSchema = IntakeField[];
