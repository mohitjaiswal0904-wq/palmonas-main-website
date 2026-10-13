import {
  buildSearchPagePath,
  parseSearchSearchParams,
  serializeSearchSearchParams,
} from '@/lib/utils/search-search-params';

function createRoundTripInput() {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  return {
    query: `search-term-${suffix}`,
    filters: {
      category: [`category-${suffix}`],
      color: [`color-a-${suffix}`, `color-b-${suffix}`],
    },
    sort: 'price-asc' as const,
  };
}

describe('search search params', () => {
  it('round-trips query, sort, and filters', () => {
    const input = createRoundTripInput();
    const queryString = serializeSearchSearchParams(input.query, input.filters, input.sort);
    const parsed = parseSearchSearchParams(Object.fromEntries(new URLSearchParams(queryString)));

    expect(parsed).toEqual(input);
  });

  it('ignores legacy page and cursor params when parsing filters', () => {
    const input = createRoundTripInput();
    const parsed = parseSearchSearchParams({
      q: input.query,
      sort: input.sort,
      page: '6',
      cursor: 'legacy-cursor',
      ...Object.fromEntries(
        Object.entries(input.filters).map(([key, value]) => [key, value.join(',')]),
      ),
    });

    expect(parsed).toEqual(input);
  });

  it('builds the search page path from serialized params', () => {
    const input = createRoundTripInput();
    const queryString = serializeSearchSearchParams(input.query, input.filters, 'featured');

    expect(buildSearchPagePath(input.query, input.filters, 'featured')).toBe(
      `/search?${queryString}`,
    );
  });
});
