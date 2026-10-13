import { extractSearchHistoryQueries } from '@/lib/search/parse-search-history';
import { DEFAULT_SEARCH_SUGGESTIONS } from '@/components/search/search-suggestions.defaults';

describe('extractSearchHistoryQueries', () => {
  it('extracts query strings from history API envelope', () => {
    expect(
      extractSearchHistoryQueries({
        status: 200,
        message: 'Search history retrieved successfully',
        data: {
          queries: [
            { query: 'Mangalsutra', created_at: '2025-12-19T13:42:35.261660+00:00' },
            { query: 'Diamond', created_at: '2025-12-19T13:39:59.888264+00:00' },
            { query: 'Rings', created_at: '2025-12-19T13:39:37.808283+00:00' },
          ],
          count: 3,
        },
      }),
    ).toEqual(['Mangalsutra', 'Diamond', 'Rings']);
  });

  it('returns empty list when queries are missing', () => {
    expect(extractSearchHistoryQueries({ status: 200, data: { queries: [], count: 0 } })).toEqual(
      [],
    );
    expect(extractSearchHistoryQueries(null)).toEqual([]);
  });

  it('keeps defaults available when history is empty', () => {
    expect(DEFAULT_SEARCH_SUGGESTIONS.headerPopularTerms.length).toBeGreaterThan(0);
    expect(DEFAULT_SEARCH_SUGGESTIONS.popularCollections.length).toBeGreaterThan(0);
    expect(DEFAULT_SEARCH_SUGGESTIONS.popularCollections).toContainEqual({
      label: 'Solitaire Collection',
      handle: 'solitaire-rings',
    });
  });
});
