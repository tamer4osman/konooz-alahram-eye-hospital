import type { ResolvedSurveyCreate } from './types';

// Per-use-case minimal ports (ISP). Prisma types never cross this boundary.

/** Verifies the caller owns the ticket they are reviewing. */
export interface SurveyTicketReader {
  /**
   * Returns the patient-profile id owning the appointment ticket, or null
   * when the ticket does not exist or belongs to a walk-in (no account).
   */
  findOwnedTicketPatientRef(
    ticketNumber: string,
    userId: string,
  ): Promise<string | null>;
}

/** Reads the caller's active data-collection consent (BCK-026). */
export interface ConsentReader {
  hasActiveConsent(userId: string, consentType: string): Promise<boolean>;
}

export interface SurveyWriter {
  /** Persist the resolved survey; rejects on duplicate ticket (unique). */
  create(resolved: ResolvedSurveyCreate): Promise<void>;
}
