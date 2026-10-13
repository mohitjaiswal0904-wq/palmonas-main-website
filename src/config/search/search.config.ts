import rawConfig from '@/config/search/search.config.json';

type SearchConfigJson = typeof rawConfig;

export const searchConfig = rawConfig as SearchConfigJson;

/** Localization-ready user-facing copy for search UI. */
export const searchMessages = {
  ...searchConfig.messages,
  labels: {
    ...searchConfig.messages.labels,
    /** @param query - Search query that returned no products. */
    formatNoResultsTitle: (query: string) =>
      searchConfig.messages.labels.noResultTitle.replace('{{query}}', query),
  },
  a11y: {
    ...searchConfig.messages.a11y,
    /** @param term - Popular search suggestion label. */
    formatSearchForTerm: (term: string) =>
      searchConfig.messages.a11y.searchForTerm.replace('{{term}}', term),
    /** @param label - Collection display name. */
    formatBrowseCollection: (label: string) =>
      searchConfig.messages.a11y.browseCollection.replace('{{label}}', label),
  },
};

/** Max recent queries requested from `/api/v2/shopify/search/history`. */
export const SEARCH_HISTORY_LIMIT = searchConfig.constants.historyLimit;

/** How long search history stays fresh before the next focus refetch. */
export const SEARCH_HISTORY_STALE_MS = searchConfig.constants.historyStaleMs;

/** Collection handle for the search empty-state “Most Loved” rail. */
export const SEARCH_MOST_LOVED_COLLECTION_HANDLE = searchConfig.constants.mostLovedCollectionHandle;

/** Max products shown in the search empty-state “Most Loved” rail. */
export const SEARCH_MOST_LOVED_LIMIT = searchConfig.constants.mostLovedLimit;
