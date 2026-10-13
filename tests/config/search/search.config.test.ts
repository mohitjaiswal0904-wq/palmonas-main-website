import {
  SEARCH_HISTORY_LIMIT,
  SEARCH_HISTORY_STALE_MS,
  SEARCH_MOST_LOVED_COLLECTION_HANDLE,
  SEARCH_MOST_LOVED_LIMIT,
  searchMessages,
} from '@/config/search/search.config';

describe('search.config', () => {
  it('keeps history limit at 5', () => {
    expect(SEARCH_HISTORY_LIMIT).toBe(5);
    expect(SEARCH_HISTORY_STALE_MS).toBe(5 * 60_000);
  });

  it('exposes recent-search labels and loading a11y copy', () => {
    expect(searchMessages.labels.recentSearch).toBe('Recent Search');
    expect(searchMessages.a11y.recentSearchLoading.length).toBeGreaterThan(0);
  });

  it('exposes popular search and collection labels', () => {
    expect(searchMessages.labels.popularSearch).toBe('Popular Searches');
    expect(searchMessages.labels.popularCollection).toBe('Popular Collection');
  });

  it('exposes empty-state copy and most-loved constants', () => {
    expect(searchMessages.labels.formatNoResultsTitle('opal')).toBe('No results for “opal”');
    expect(searchMessages.labels.mostLoved).toBe('Most Loved');
    expect(searchMessages.labels.viewAll).toBe('View All');
    expect(searchMessages.labels.resultSummarySuffix).toBe('for');
    expect(SEARCH_MOST_LOVED_COLLECTION_HANDLE).toBe('best-sellers');
    expect(SEARCH_MOST_LOVED_LIMIT).toBe(8);
  });

  it('formats a11y helpers for search and collection rows', () => {
    expect(searchMessages.a11y.formatSearchForTerm('Gold Ring')).toBe('Search for Gold Ring');
    expect(searchMessages.a11y.formatBrowseCollection('Rings Collection')).toBe(
      'Browse Rings Collection',
    );
  });
});
