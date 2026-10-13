import { z } from 'zod';

export const PopularCollectionSuggestionSchema = z.object({
  label: z.string(),
  handle: z.string(),
});

export type PopularCollectionSuggestion = z.infer<typeof PopularCollectionSuggestionSchema>;

export const SearchExploreTermSchema = z.object({
  label: z.string(),
  query: z.string(),
});

export type SearchExploreTerm = z.infer<typeof SearchExploreTermSchema>;

export const SearchSuggestionsSchema = z.object({
  popularTerms: z.array(z.string()),
  /** Recent queries for signed-in users — filled client-side via `useSearchHistory`. */
  recentSearchTerms: z.array(z.string()),
  headerPopularTerms: z.array(z.string()),
  popularCollections: z.array(PopularCollectionSuggestionSchema),
  exploreTerms: z.array(SearchExploreTermSchema),
});

export type SearchSuggestions = z.infer<typeof SearchSuggestionsSchema>;
