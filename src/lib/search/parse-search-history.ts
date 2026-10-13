/**
 * Extracts search query strings from `/api/v2/shopify/search/history` payloads.
 *
 * @param raw - Full API envelope or raw `data` object.
 * @returns Ordered list of non-empty query strings.
 */
export function extractSearchHistoryQueries(raw: unknown): string[] {
  if (typeof raw !== 'object' || raw === null) {
    return [];
  }

  const envelope = raw as { data?: { queries?: unknown } };
  const queries = envelope.data?.queries ?? (raw as { queries?: unknown }).queries;

  if (!Array.isArray(queries)) {
    return [];
  }

  return queries
    .map((entry) => {
      if (typeof entry === 'string') {
        return entry.trim();
      }

      if (typeof entry === 'object' && entry !== null && 'query' in entry) {
        const query = (entry as { query?: unknown }).query;
        return typeof query === 'string' ? query.trim() : '';
      }

      if (typeof entry === 'object' && entry !== null && 'term' in entry) {
        const term = (entry as { term?: unknown }).term;
        return typeof term === 'string' ? term.trim() : '';
      }

      return '';
    })
    .filter(Boolean);
}
