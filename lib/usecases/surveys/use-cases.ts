import type { SurveyInput } from './rules';
import type { ConsentReader, SurveyTicketReader, SurveyWriter } from './ports';
import { resolveSurveyCreate } from './rules';
import { ConsentRequiredError, SurveyTicketNotFoundError } from './types';

// Use case: orchestration only. Business rules live in rules.ts; ports are
// injected as first arguments. Errors propagate unchanged — the route handler
// maps them onto HTTP responses.

/**
 * Submit one satisfaction survey for a visit the caller actually attended.
 * Order of gates matters: consent (BCK-026) before identity before write —
 * a patient without consent never learns whether a ticket exists.
 */
export async function submitSurvey(
  consent: ConsentReader,
  tickets: SurveyTicketReader,
  writer: SurveyWriter,
  input: SurveyInput,
  accountId: string,
): Promise<void> {
  const consented = await consent.hasActiveConsent(accountId, 'privacy_policy');
  if (!consented) throw new ConsentRequiredError();

  const patientRefId = await tickets.findOwnedTicketPatientRef(input.ticketNumber, accountId);
  if (!patientRefId) throw new SurveyTicketNotFoundError();

  const resolved = resolveSurveyCreate(input, patientRefId);
  await writer.create(resolved);
}
