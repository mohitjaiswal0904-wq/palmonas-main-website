const DEFAULT_WEBENGAGE_READY_TIMEOUT_MS = 15_000;

/**
 * Returns true when WebEngage finished SDK initialization (not just the stub).
 */
export function isWebEngageSdkInitialized(): boolean {
  return window.webengageInitialized === true;
}

/**
 * Waits until WebEngage fires `onReady` or times out.
 *
 * @param timeoutMs - Maximum wait time.
 */
export function waitForWebEngageReady(
  timeoutMs = DEFAULT_WEBENGAGE_READY_TIMEOUT_MS,
): Promise<boolean> {
  if (typeof window === 'undefined') {
    return Promise.resolve(false);
  }

  if (isWebEngageSdkInitialized()) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = (ready: boolean): void => {
      if (settled) {
        return;
      }

      settled = true;
      window.clearTimeout(timeoutId);
      resolve(ready);
    };

    const timeoutId = window.setTimeout(() => finish(false), timeoutMs);

    const attachOnReady = (): void => {
      if (isWebEngageSdkInitialized()) {
        finish(true);
        return;
      }

      if (typeof window.webengage?.onReady !== 'function') {
        finish(false);
        return;
      }

      window.webengage.onReady(() => finish(true));
    };

    attachOnReady();
  });
}

/**
 * Runs a callback after WebEngage SDK initialization completes.
 *
 * @param callback - Invoked when the SDK accepts track/login calls.
 */
export function runWhenWebEngageReady(callback: () => void): void {
  if (isWebEngageSdkInitialized()) {
    callback();
    return;
  }

  window.webengage?.onReady(callback);
}
