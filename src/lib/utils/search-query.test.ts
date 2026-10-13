import { normalizeSearchQuery } from '@/lib/utils/search-query';

describe('normalizeSearchQuery', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeSearchQuery('  best   sellers  ')).toBe('best sellers');
  });

  it('returns an empty string for blank input', () => {
    expect(normalizeSearchQuery('   ')).toBe('');
  });
});
