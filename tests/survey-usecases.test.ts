import { describe, it, expect, vi } from 'vitest';
import {
  submitSurvey,
  resolveSurveyCreate,
  validateSurveyRatings,
  ConsentRequiredError,
  SurveyTicketNotFoundError,
  InvalidSurveyError,
  type SurveyInput,
  type ConsentReader,
  type SurveyTicketReader,
  type SurveyWriter,
} from '@/lib/usecases/surveys';

// ─────────────────────────────────────────────
// Survey validation rules (pure)
// ─────────────────────────────────────────────

describe('validateSurveyRatings', () => {
  it('accepts overallRating 1..5 and recommendScore 0..10', () => {
    expect(() => validateSurveyRatings({ overallRating: 1, recommendScore: 0 })).not.toThrow();
    expect(() => validateSurveyRatings({ overallRating: 5, recommendScore: 10 })).not.toThrow();
    expect(() => validateSurveyRatings({ overallRating: 3, recommendScore: 7 })).not.toThrow();
  });

  it('rejects out-of-range overallRating', () => {
    expect(() => validateSurveyRatings({ overallRating: 0, recommendScore: 5 })).toThrow(
      InvalidSurveyError,
    );
    expect(() => validateSurveyRatings({ overallRating: 6, recommendScore: 5 })).toThrow(
      InvalidSurveyError,
    );
  });

  it('rejects non-integer and out-of-range recommendScore', () => {
    expect(() => validateSurveyRatings({ overallRating: 4, recommendScore: 3.5 })).toThrow(
      InvalidSurveyError,
    );
    expect(() => validateSurveyRatings({ overallRating: 4, recommendScore: 11 })).toThrow(
      InvalidSurveyError,
    );
    expect(() => validateSurveyRatings({ overallRating: 4, recommendScore: -1 })).toThrow(
      InvalidSurveyError,
    );
  });
});

describe('resolveSurveyCreate', () => {
  it('trims ticket and comments, drops empty comments to null', () => {
    const resolved = resolveSurveyCreate(
      {
        ticketNumber: '  BK-123456  ',
        overallRating: 4,
        recommendScore: 9,
        commentAr: '  خدمة ممتازة  ',
        commentEn: '   ',
      },
      'patient-ref-1',
    );
    expect(resolved).toEqual({
      ticketNumber: 'BK-123456',
      patientRefId: 'patient-ref-1',
      overallRating: 4,
      recommendScore: 9,
      commentAr: 'خدمة ممتازة',
      commentEn: null,
    });
  });

  it('rejects comments over 1000 characters', () => {
    expect(() =>
      resolveSurveyCreate(
        {
          ticketNumber: 'BK-1',
          overallRating: 4,
          recommendScore: 8,
          commentEn: 'x'.repeat(1001),
        },
        'ref',
      ),
    ).toThrow(InvalidSurveyError);
  });

  it('rejects a blank ticket', () => {
    expect(() =>
      resolveSurveyCreate(
        { ticketNumber: '   ', overallRating: 4, recommendScore: 8 },
        'ref',
      ),
    ).toThrow(InvalidSurveyError);
  });

  it('propagates rating validation failures', () => {
    expect(() =>
      resolveSurveyCreate(
        { ticketNumber: 'BK-1', overallRating: 9, recommendScore: 8 },
        'ref',
      ),
    ).toThrow(InvalidSurveyError);
  });
});

// ─────────────────────────────────────────────
// submitSurvey orchestration (stub ports)
// ─────────────────────────────────────────────

const INPUT: SurveyInput = {
  ticketNumber: 'BK-123456',
  overallRating: 5,
  recommendScore: 10,
};

function stubConsent(granted: boolean): ConsentReader {
  return { hasActiveConsent: vi.fn().mockResolvedValue(granted) };
}

function stubTickets(patientRefId: string | null): SurveyTicketReader {
  return { findOwnedTicketPatientRef: vi.fn().mockResolvedValue(patientRefId) };
}

function stubWriter(): SurveyWriter & { create: ReturnType<typeof vi.fn> } {
  return { create: vi.fn().mockResolvedValue(undefined) };
}

describe('submitSurvey', () => {
  it('checks consent first, then ticket ownership, then writes', async () => {
    const consent = stubConsent(true);
    const tickets = stubTickets('ref-1');
    const writer = stubWriter();

    await submitSurvey(consent, tickets, writer, INPUT, 'user-1');

    expect(consent.hasActiveConsent).toHaveBeenCalledWith('user-1', 'privacy_policy');
    expect(tickets.findOwnedTicketPatientRef).toHaveBeenCalledWith('BK-123456', 'user-1');
    expect(writer.create).toHaveBeenCalledWith(
      expect.objectContaining({ ticketNumber: 'BK-123456', patientRefId: 'ref-1' }),
    );
  });

  it('rejects without consent and never probes ticket ownership', async () => {
    const consent = stubConsent(false);
    const tickets = stubTickets('ref-1');
    const writer = stubWriter();

    await expect(submitSurvey(consent, tickets, writer, INPUT, 'user-1')).rejects.toThrow(
      ConsentRequiredError,
    );
    expect(tickets.findOwnedTicketPatientRef).not.toHaveBeenCalled();
    expect(writer.create).not.toHaveBeenCalled();
  });

  it('rejects tickets not owned by the caller', async () => {
    const writer = stubWriter();
    await expect(
      submitSurvey(stubConsent(true), stubTickets(null), writer, INPUT, 'user-1'),
    ).rejects.toThrow(SurveyTicketNotFoundError);
    expect(writer.create).not.toHaveBeenCalled();
  });

  it('rejects invalid ratings before any write', async () => {
    const writer = stubWriter();
    await expect(
      submitSurvey(
        stubConsent(true),
        stubTickets('ref-1'),
        writer,
        { ...INPUT, overallRating: 0 },
        'user-1',
      ),
    ).rejects.toThrow(InvalidSurveyError);
    expect(writer.create).not.toHaveBeenCalled();
  });
});
