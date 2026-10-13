/** Auth claims attached to analytics base payloads without React hooks. */
export interface AnalyticsAuthContext {
  userId?: string;
  sessionId?: string;
  isGuest?: boolean;
}

let authContext: AnalyticsAuthContext = {};

/**
 * Returns the current auth analytics context set by identity sync.
 */
export function getAnalyticsAuthContext(): AnalyticsAuthContext {
  return authContext;
}

/**
 * Sets auth analytics context for event base property enrichment.
 *
 * @param context - JWT-derived identity fields for analytics payloads.
 */
export function setAnalyticsAuthContext(context: AnalyticsAuthContext): void {
  authContext = context;
}

/** Clears auth analytics context on logout or guest session. */
export function clearAnalyticsAuthContext(): void {
  authContext = {};
}
