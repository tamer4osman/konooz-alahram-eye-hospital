// Survey use-case layer types. Framework-free: no Prisma, no Next.js.

/** Fully-resolved survey payload the adapter persists verbatim. */
export interface ResolvedSurveyCreate {
  ticketNumber: string;
  patientRefId: string;
  /** 1..5 — validated by validateSurveyRatings. */
  overallRating: number;
  /** 0..10 — NPS-style recommendation score. */
  recommendScore: number;
  commentAr: string | null;
  commentEn: string | null;
}

export class ConsentRequiredError extends Error {
  constructor() {
    super('Data-collection consent is required before submitting feedback');
    this.name = 'ConsentRequiredError';
  }
}

export class SurveyTicketNotFoundError extends Error {
  constructor() {
    super('No appointment found for this ticket owned by the current patient');
    this.name = 'SurveyTicketNotFoundError';
  }
}

export class SurveyAlreadySubmittedError extends Error {
  constructor() {
    super('A survey was already submitted for this visit');
    this.name = 'SurveyAlreadySubmittedError';
  }
}

export class InvalidSurveyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidSurveyError';
  }
}
