const DEFAULT_SCRIPT_TIMEOUT_MS = 15_000;

interface LoadClientScriptOptions {
  id: string;
  src?: string;
  inline?: string;
  timeoutMs?: number;
}

/**
 * Injects a script tag once; resolves when onload fires or rejects on error/timeout.
 *
 * @param options - Script id, external src or inline body, optional timeout.
 */
export function loadClientScript(options: LoadClientScriptOptions): Promise<void> {
  const { id, src, inline, timeoutMs = DEFAULT_SCRIPT_TIMEOUT_MS } = options;

  if (typeof document === 'undefined') {
    return Promise.reject(new Error('script_load_ssr'));
  }

  const existing = document.getElementById(id);
  if (existing) {
    return Promise.resolve();
  }

  if (!src && !inline) {
    return Promise.reject(new Error('script_load_missing_source'));
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = id;
    script.async = true;

    if (src) {
      script.src = src;
    }

    if (inline) {
      script.text = inline;
    }

    const timeoutId = window.setTimeout(() => {
      reject(new Error('script_load_timeout'));
    }, timeoutMs);

    const resolveLoad = (): void => {
      window.clearTimeout(timeoutId);
      resolve();
    };

    if (inline && !src) {
      document.head.appendChild(script);
      resolveLoad();
      return;
    }

    script.onload = resolveLoad;

    script.onerror = () => {
      window.clearTimeout(timeoutId);
      reject(new Error('script_load_error'));
    };

    document.head.appendChild(script);
  });
}

/**
 * Polls until predicate returns true or timeout elapses.
 *
 * @param predicate - Readiness check executed on each tick.
 * @param timeoutMs - Maximum wait time.
 * @param intervalMs - Poll interval.
 */
export function waitForAnalyticsReady(
  predicate: () => boolean,
  timeoutMs = DEFAULT_SCRIPT_TIMEOUT_MS,
  intervalMs = 50,
): Promise<boolean> {
  if (predicate()) {
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    const startedAt = Date.now();

    const tick = (): void => {
      if (predicate()) {
        resolve(true);
        return;
      }

      if (Date.now() - startedAt >= timeoutMs) {
        resolve(false);
        return;
      }

      window.setTimeout(tick, intervalMs);
    };

    tick();
  });
}
