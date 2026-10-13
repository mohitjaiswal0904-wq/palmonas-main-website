/**
 * Shares the mobile search-field draft with the search page suggestion panel.
 * The header input writes; SearchPageContent reads while the user is typing.
 */

let draftQuery = '';
const listeners = new Set<() => void>();

/**
 * Notify subscribers after the draft query changes.
 */
function emitSearchDraftQuery(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

/**
 * Publish the current mobile search-field value.
 *
 * @param query - Raw field value (may be empty).
 */
export function setSearchDraftQuery(query: string): void {
  if (draftQuery === query) {
    return;
  }

  draftQuery = query;
  emitSearchDraftQuery();
}

/**
 * Returns the latest published mobile search draft.
 *
 * @returns Current draft query string.
 */
export function getSearchDraftQuery(): string {
  return draftQuery;
}

/**
 * Subscribe to mobile search draft changes.
 *
 * @param listener - Called after the draft updates.
 * @returns Unsubscribe function.
 */
export function subscribeSearchDraftQuery(listener: () => void): () => void {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
