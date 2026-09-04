import type { ResolvedSurveyCreate } from './types';
import { InvalidSurveyError } from './types';

// Pure business rules.

export interface SurveyInput {
  ticketNumber: string;
  /** 1..5 */
  overallRating: number;
  /** 0..10 */
  recommendScore: number;
  commentAr?: string;
  commentEn?: string;
}

/** Validation is defense-in-depth: the route's zod schema checks first. */
export function validateSurveyRatings(input: {
  overallRating: number;
  recommendScore: number;
}): void {
  if (!Number.isInteger(input.overallRating) || input.overallRating < 1 || input.overallRating > 5) {
    throw new InvalidSurveyError('overallRating must be an integer between 1 and 5');
  }
  if (
    !Number.isInteger(input.recommendScore) ||
    input.recommendScore < 0 ||
    input.recommendScore > 10
  ) {
    throw new InvalidSurveyError('recommendScore must be an integer between 0 and 10');
  }
}

/** Compose the persistable record: trim comments, drop empty ones. */
export function resolveSurveyCreate(
  input: SurveyInput,
  patientRefId: string,
): ResolvedSurveyCreate {
  validateSurveyRatings(input);
  const ticketNumber = input.ticketNumber.trim();
  if (!ticketNumber) {
    throw new InvalidSurveyError('ticketNumber is required');
  }
  const commentAr = input.commentAr?.trim() || null;
  const commentEn = input.commentEn?.trim() || null;
  if (commentAr && commentAr.length > 1000) {
    throw new InvalidSurveyError('Arabic comment must be 1000 characters or fewer');
  }
  if (commentEn && commentEn.length > 1000) {
    throw new InvalidSurveyError('English comment must be 1000 characters or fewer');
  }
  return {
    ticketNumber,
    patientRefId,
    overallRating: input.overallRating,
    recommendScore: input.recommendScore,
    commentAr,
    commentEn,
  };
}
