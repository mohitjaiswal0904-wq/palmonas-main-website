import { isAppError, normaliseError } from '@/lib/errors';

export function shouldRetryQuery(failureCount: number, err: unknown): boolean {
  if (isAppError(err) && (err.code === 'NOT_FOUND' || err.code === 'UNAUTHORISED')) {
    return false;
  }
  return failureCount < 2;
}

/**
 * Returns whether an error is worth a single extra fetch (API 5xx or network).
 *
 * @param err - Normalised or raw error.
 */
export function isTransientAppError(err: unknown): boolean {
  const normalised = isAppError(err) ? err : normaliseError(err);
  return normalised.code === 'SERVER_ERROR' || normalised.code === 'NETWORK';
}

/**
 * Runs `run` and retries once when the first failure is transient.
 *
 * @param run - Fetch to execute.
 * @returns The first successful result.
 * @throws The last normalised error.
 */
export async function retryOnceOnTransient<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (err) {
    const first = normaliseError(err);

    if (!isTransientAppError(first)) {
      throw first;
    }

    try {
      return await run();
    } catch (retryErr) {
      throw normaliseError(retryErr);
    }
  }
}
