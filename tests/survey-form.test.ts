import { describe, it, expect } from 'vitest';
import { buildSurveyPayload, type SurveyFormInput } from '@/lib/validation/survey-form';

const base: SurveyFormInput = {
  ticketNumber: 'BK-123456',
  overallRating: 5,
  recommendScore: 9,
  comment: '  خدمة ممتازة  ',
  lang: 'ar',
};

describe('buildSurveyPayload', () => {
  it('builds a valid payload and routes the comment by language', () => {
    const result = buildSurveyPayload(base);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload).toEqual({
        ticketNumber: 'BK-123456',
        overallRating: 5,
        recommendScore: 9,
        commentAr: 'خدمة ممتازة',
      });
    }
  });

  it('routes English comments to commentEn', () => {
    const result = buildSurveyPayload({ ...base, comment: 'Great service', lang: 'en' });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.commentEn).toBe('Great service');
      expect(result.payload.commentAr).toBeUndefined();
    }
  });

  it('normalizes a bare 6-digit ticket to the BK- prefix', () => {
    const result = buildSurveyPayload({ ...base, ticketNumber: '123456' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.ticketNumber).toBe('BK-123456');
  });

  it('uppercases and trims the ticket', () => {
    const result = buildSurveyPayload({ ...base, ticketNumber: '  bk-123456 ' });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.payload.ticketNumber).toBe('BK-123456');
  });

  it('rejects an empty ticket', () => {
    const result = buildSurveyPayload({ ...base, ticketNumber: '   ' });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.ticketNumber).toBeDefined();
  });

  it('rejects ratings outside 1..5', () => {
    expect(buildSurveyPayload({ ...base, overallRating: 0 }).ok).toBe(false);
    expect(buildSurveyPayload({ ...base, overallRating: 6 }).ok).toBe(false);
    expect(buildSurveyPayload({ ...base, overallRating: 3.5 }).ok).toBe(false);
  });

  it('rejects recommend scores outside 0..10', () => {
    expect(buildSurveyPayload({ ...base, recommendScore: -1 }).ok).toBe(false);
    expect(buildSurveyPayload({ ...base, recommendScore: 11 }).ok).toBe(false);
  });

  it('rejects comments over 1000 characters', () => {
    const result = buildSurveyPayload({ ...base, comment: 'ا'.repeat(1001) });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.errors.comment).toBeDefined();
  });

  it('allows omitting the comment entirely', () => {
    const result = buildSurveyPayload({ ...base, comment: undefined });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.commentAr).toBeUndefined();
      expect(result.payload.commentEn).toBeUndefined();
    }
  });
});
