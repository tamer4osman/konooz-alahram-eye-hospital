// Pure client-side survey form validation + payload building. Mirrors the
// server rules in lib/usecases/surveys/rules.ts — defense-in-depth, the API
// re-validates everything.

export interface SurveyFormInput {
  ticketNumber: string;
  overallRating: number;
  recommendScore: number;
  comment?: string;
  lang: 'ar' | 'en';
}

export interface SurveyApiPayload {
  ticketNumber: string;
  overallRating: number;
  recommendScore: number;
  commentAr?: string;
  commentEn?: string;
}

export type SurveyFormErrors = {
  ticketNumber?: boolean;
  overallRating?: boolean;
  recommendScore?: boolean;
  comment?: boolean;
};

export type SurveyFormResult =
  | { ok: true; payload: SurveyApiPayload }
  | { ok: false; errors: SurveyFormErrors };

/** Accepts 'BK-123456', 'bk-123456', or a bare 6-digit code; returns 'BK-XXXXXX'. */
function normalizeTicketNumber(raw: string): string {
  const trimmed = raw.trim().toUpperCase();
  const bare = /^(\d{6})$/.exec(trimmed);
  if (bare) return `BK-${trimmed}`;
  return trimmed;
}

export function buildSurveyPayload(input: SurveyFormInput): SurveyFormResult {
  const errors: SurveyFormErrors = {};

  const ticketNumber = normalizeTicketNumber(input.ticketNumber);
  if (!ticketNumber) {
    errors.ticketNumber = true;
  }

  const { overallRating, recommendScore } = input;
  if (!Number.isInteger(overallRating) || overallRating < 1 || overallRating > 5) {
    errors.overallRating = true;
  }
  if (!Number.isInteger(recommendScore) || recommendScore < 0 || recommendScore > 10) {
    errors.recommendScore = true;
  }

  let payload: SurveyApiPayload | null = null;
  if (Object.keys(errors).length === 0) {
    payload = {
      ticketNumber,
      overallRating,
      recommendScore,
    };
    const comment = input.comment?.trim();
    if (comment) {
      if (comment.length > 1000) {
        errors.comment = true;
      } else if (input.lang === 'ar') {
        payload.commentAr = comment;
      } else {
        payload.commentEn = comment;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, payload: payload as SurveyApiPayload };
}
