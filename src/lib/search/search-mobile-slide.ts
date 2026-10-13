/**
 * Coordinates the mobile search page slide-down exit before route changes.
 * The mounted `SearchMobileSlideShell` registers a handler; header back invokes it.
 */

type SearchMobileSlideExitHandler = (navigate: () => void) => boolean;

let exitHandler: SearchMobileSlideExitHandler | null = null;

/**
 * Register the active search slide shell's exit animator.
 *
 * @param handler - Receives the pending navigation; return true if handled.
 * @returns Unsubscribe function.
 */
export function registerSearchMobileSlideExit(handler: SearchMobileSlideExitHandler): () => void {
  exitHandler = handler;
  return () => {
    if (exitHandler === handler) {
      exitHandler = null;
    }
  };
}

/**
 * Request a bottom-sheet exit animation, then run `navigate`.
 * Falls through to immediate navigation when no shell is mounted.
 *
 * @param navigate - Route change to run after the exit animation (or immediately).
 * @returns Whether a registered shell handled the request.
 */
export function requestSearchMobileSlideExit(navigate: () => void): boolean {
  if (!exitHandler) {
    navigate();
    return false;
  }

  return exitHandler(navigate);
}
