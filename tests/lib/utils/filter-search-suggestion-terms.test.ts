import {
  collectSearchSuggestionTerms,
  filterSearchSuggestionTerms,
} from '@/lib/utils/filter-search-suggestion-terms';
import { DEFAULT_SEARCH_SUGGESTIONS } from '@/components/search/search-suggestions.defaults';

describe('collectSearchSuggestionTerms', () => {
  it('dedupes recent, popular, and explore terms', () => {
    expect(
      collectSearchSuggestionTerms({
        ...DEFAULT_SEARCH_SUGGESTIONS,
        recentSearchTerms: ['Ring', ' Gold '],
        headerPopularTerms: ['Ring', 'Earrings'],
        popularTerms: ['Gold'],
        exploreTerms: [{ label: 'Gold', query: 'Gold' }],
      }),
    ).toEqual(['Ring', 'Gold', 'Earrings']);
  });

  it('drops empty labels', () => {
    expect(
      collectSearchSuggestionTerms({
        ...DEFAULT_SEARCH_SUGGESTIONS,
        recentSearchTerms: ['', '  '],
        headerPopularTerms: [],
        popularTerms: [],
        exploreTerms: [{ label: 'Empty', query: '   ' }],
      }),
    ).toEqual([]);
  });
});

describe('filterSearchSuggestionTerms', () => {
  it('returns all terms when query is empty', () => {
    expect(filterSearchSuggestionTerms(['Ring', 'Gold'], '   ')).toEqual(['Ring', 'Gold']);
  });

  it('matches terms case-insensitively by substring', () => {
    expect(filterSearchSuggestionTerms(['Gold Ring', 'Silver Chain', 'Earrings'], 'gold')).toEqual([
      'Gold Ring',
    ]);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterSearchSuggestionTerms(['Ring', 'Bracelet'], 'pendant')).toEqual([]);
  });

  it('preserves original term order for matches', () => {
    expect(filterSearchSuggestionTerms(['Alpha Gold', 'Gold Beta', 'Silver'], 'gold')).toEqual([
      'Alpha Gold',
      'Gold Beta',
    ]);
  });
});
