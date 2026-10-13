import 'server-only';

import { unstable_cache as cacheWithRevalidation } from 'next/cache';
import { cache } from 'react';

import { DEFAULT_SEARCH_SUGGESTIONS } from '@/components/search/search-suggestions.defaults';
import { getApiBaseUrl } from '@/lib/env';
import { getPageSections } from '@/services/server/cms.service.server';
import type { CmsSection } from '@/types/cms';
import {
  PopularCollectionSuggestionSchema,
  SearchSuggestionsSchema,
  type PopularCollectionSuggestion,
  type SearchSuggestions,
} from '@/types/search-suggestions';

const SEARCH_SUGGESTIONS_REVALIDATE_SECONDS = 300;

interface SearchSuggestionsApiData {
  popular_terms?: unknown;
  popular_searches?: unknown;
  header_popular_searches?: unknown;
  popular_collections?: unknown;
}

function toStringList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry.trim();
      }

      if (typeof entry === 'object' && entry !== null && 'label' in entry) {
        const label = entry.label;
        return typeof label === 'string' ? label.trim() : '';
      }

      if (typeof entry === 'object' && entry !== null && 'query' in entry) {
        const query = entry.query;
        return typeof query === 'string' ? query.trim() : '';
      }

      if (typeof entry === 'object' && entry !== null && 'term' in entry) {
        const term = entry.term;
        return typeof term === 'string' ? term.trim() : '';
      }

      return '';
    })
    .filter(Boolean);
}

function toCollectionList(value: unknown): PopularCollectionSuggestion[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    const parsed = PopularCollectionSuggestionSchema.safeParse(entry);

    if (parsed.success) {
      return [parsed.data];
    }

    if (typeof entry !== 'object' || entry === null) {
      return [];
    }

    const label = 'label' in entry && typeof entry.label === 'string' ? entry.label.trim() : '';
    const handle =
      'handle' in entry && typeof entry.handle === 'string'
        ? entry.handle.trim()
        : 'href' in entry && typeof entry.href === 'string'
          ? entry.href.replace(/^\/collections\//, '').trim()
          : '';

    if (!label || !handle) {
      return [];
    }

    return [{ label, handle }];
  });
}

/**
 * Maps CMS / static suggestion payloads into UI terms.
 * Recent history is never sourced from SSR — client `useSearchHistory` owns that.
 *
 * @param raw - Envelope or raw payload from CMS section content.
 * @returns Normalised suggestions, or null when no usable terms are present.
 */
function parseSuggestionsPayload(raw: unknown): SearchSuggestions | null {
  if (typeof raw !== 'object' || raw === null) {
    return null;
  }

  const envelope = raw as { data?: SearchSuggestionsApiData };
  const payload = (envelope.data ?? raw) as SearchSuggestionsApiData;
  const popularTerms = toStringList(payload.popular_terms ?? payload.popular_searches);
  const headerPopularTerms = toStringList(payload.header_popular_searches);
  const popularCollections = toCollectionList(payload.popular_collections);

  if (
    popularTerms.length === 0 &&
    headerPopularTerms.length === 0 &&
    popularCollections.length === 0
  ) {
    return null;
  }

  const parsed = SearchSuggestionsSchema.safeParse({
    popularTerms: popularTerms.length > 0 ? popularTerms : DEFAULT_SEARCH_SUGGESTIONS.popularTerms,
    recentSearchTerms: [],
    headerPopularTerms:
      headerPopularTerms.length > 0
        ? headerPopularTerms
        : popularTerms.length > 0
          ? popularTerms
          : DEFAULT_SEARCH_SUGGESTIONS.headerPopularTerms,
    popularCollections:
      popularCollections.length > 0
        ? popularCollections
        : DEFAULT_SEARCH_SUGGESTIONS.popularCollections,
    exploreTerms: DEFAULT_SEARCH_SUGGESTIONS.exploreTerms,
  });

  return parsed.success ? parsed.data : null;
}

function parseSuggestionsFromSections(sections: CmsSection[]): SearchSuggestions | null {
  for (const section of sections) {
    if (section.type !== 'search_suggestions') {
      continue;
    }

    try {
      const parsedContent = section.content ?? null;
      const suggestions = parseSuggestionsPayload(parsedContent);

      if (suggestions) {
        return suggestions;
      }
    } catch {
      continue;
    }
  }

  const popularTerms = sections
    .filter((section) => section.type === 'popular_search' && section.title)
    .map((section) => section.title?.trim() ?? '')
    .filter(Boolean);

  const popularCollections = sections.flatMap((section) => {
    if (section.type !== 'popular_collection' || !section.title || !section.ctaHref) {
      return [];
    }

    const handle = section.ctaHref.replace(/^\/collections\//, '').trim();

    if (!handle) {
      return [];
    }

    return [{ label: section.title, handle }];
  });

  if (popularTerms.length === 0 && popularCollections.length === 0) {
    return null;
  }

  return SearchSuggestionsSchema.parse({
    popularTerms: popularTerms.length > 0 ? popularTerms : DEFAULT_SEARCH_SUGGESTIONS.popularTerms,
    recentSearchTerms: [],
    headerPopularTerms:
      popularTerms.length > 0 ? popularTerms : DEFAULT_SEARCH_SUGGESTIONS.headerPopularTerms,
    popularCollections:
      popularCollections.length > 0
        ? popularCollections
        : DEFAULT_SEARCH_SUGGESTIONS.popularCollections,
    exploreTerms: DEFAULT_SEARCH_SUGGESTIONS.exploreTerms,
  });
}

/**
 * Resolves static search suggestions from CMS, then defaults.
 * User recent history is client-only (`useSearchHistory`).
 */
async function resolveSearchSuggestions(): Promise<SearchSuggestions> {
  try {
    const sections = await getPageSections('search');
    const cmsSuggestions = parseSuggestionsFromSections(sections);

    if (cmsSuggestions) {
      return cmsSuggestions;
    }
  } catch {
    // Fall through to static defaults.
  }

  return DEFAULT_SEARCH_SUGGESTIONS;
}

export const getSearchSuggestions = cache(async (): Promise<SearchSuggestions> => {
  return cacheWithRevalidation(
    async () => resolveSearchSuggestions(),
    ['search-suggestions', 'static', getApiBaseUrl()],
    {
      revalidate: SEARCH_SUGGESTIONS_REVALIDATE_SECONDS,
      tags: ['search-suggestions'],
    },
  )();
});
