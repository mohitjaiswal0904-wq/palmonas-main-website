import {
  formatReviewDate,
  getReviewerInitials,
  getSummaryStarCount,
} from '@/lib/product/review-utils';

describe('getReviewerInitials', () => {
  it('returns two initials from first and last name', () => {
    expect(getReviewerInitials('Meera Reddy')).toBe('MR');
  });

  it('returns first two letters for single-word names', () => {
    expect(getReviewerInitials('Aseem')).toBe('AS');
  });

  it('returns question mark for empty input', () => {
    expect(getReviewerInitials('   ')).toBe('?');
  });

  it('handles extra whitespace between words', () => {
    expect(getReviewerInitials('  Nitin   K.  ')).toBe('NK');
  });
});

describe('formatReviewDate', () => {
  it('formats ISO timestamps for India locale', () => {
    expect(formatReviewDate('2025-10-25T10:00:00.000Z')).toMatch(/25 Oct 2025/);
  });

  it('returns empty string for invalid dates', () => {
    expect(formatReviewDate('not-a-date')).toBe('');
  });
});

describe('getSummaryStarCount', () => {
  it('rounds average rating to whole stars clamped 0–5', () => {
    expect(getSummaryStarCount(4.7)).toBe(5);
    expect(getSummaryStarCount(4.4)).toBe(4);
  });

  it('returns zero for invalid or non-positive ratings', () => {
    expect(getSummaryStarCount(0)).toBe(0);
    expect(getSummaryStarCount(Number.NaN)).toBe(0);
  });
});
