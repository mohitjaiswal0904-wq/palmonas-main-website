import { formatSearchResultCount, searchResultCountLabel } from '@/lib/utils/search-results';

describe('formatSearchResultCount', () => {
  it('returns zero for an empty result set', () => {
    expect(formatSearchResultCount(0, false)).toBe('0');
  });

  it('returns an exact count when all results are loaded', () => {
    expect(formatSearchResultCount(12, false)).toBe('12');
  });

  it('appends plus when more results are available', () => {
    expect(formatSearchResultCount(24, true)).toBe('24+');
    expect(formatSearchResultCount(120, true)).toBe('120+');
  });
});

describe('searchResultCountLabel', () => {
  it('uses singular copy for one exact result', () => {
    expect(searchResultCountLabel(1, false)).toBe('result');
  });

  it('uses plural copy for multiple or open-ended counts', () => {
    expect(searchResultCountLabel(2, false)).toBe('results');
    expect(searchResultCountLabel(1, true)).toBe('results');
  });
});
