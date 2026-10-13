/**
 * Apply-button commits blur price inputs (PW-622) without firing equal-price toasts (PW-623).
 * Programmatic `blur()` leaves `relatedTarget` null, so callers wrap Apply flush in this helper.
 */

let filterApplyCommitDepth = 0;

/**
 * Run work during a filter-sheet Apply commit (e.g. flushSync blur of price inputs).
 *
 * @param fn - Sync work that may trigger input blur handlers.
 * @returns Return value of `fn`.
 */
export function withFilterApplyCommit<T>(fn: () => T): T {
  filterApplyCommitDepth += 1;

  try {
    return fn();
  } finally {
    filterApplyCommitDepth -= 1;
  }
}

/**
 * @returns Whether the current stack is inside {@link withFilterApplyCommit}.
 */
export function isFilterApplyCommit(): boolean {
  return filterApplyCommitDepth > 0;
}
