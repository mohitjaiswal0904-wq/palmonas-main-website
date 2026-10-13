import type { SearchSuggestions } from '@/types/search-suggestions';

/**
 * Builds unique suggestion labels from recent, popular, and explore terms.
 *
 * @param suggestions - Header search suggestion payload.
 * @returns Deduped term list in stable order.
 */
export function collectSearchSuggestionTerms(suggestions: SearchSuggestions): string[] {
  const terms = [
    ...suggestions.recentSearchTerms,
    ...suggestions.headerPopularTerms,
    ...suggestions.popularTerms,
    ...suggestions.exploreTerms.map((term) => term.query),
  ];

  return Array.from(new Set(terms.map((term) => term.trim()).filter(Boolean)));
}

/**
 * Filters suggestion terms by a case-insensitive substring match.
 *
 * @param terms - Candidate suggestion labels.
 * @param query - Raw user input (empty returns all terms).
 * @returns Matching terms in original order.
 */
export function filterSearchSuggestionTerms(terms: string[], query: string): string[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return terms;
  }

  return terms.filter((term) => term.toLowerCase().includes(normalized));
}
