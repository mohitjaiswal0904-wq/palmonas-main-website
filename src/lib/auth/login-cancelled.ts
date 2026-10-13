/** Error thrown when the user dismisses or cancels an in-flight login guard. */
export class LoginCancelledError extends Error {
  constructor() {
    super('LOGIN_CANCELLED');
    this.name = 'LoginCancelledError';
    Object.setPrototypeOf(this, LoginCancelledError.prototype);
  }
}

/**
 * Returns true when a guard-backed mutation was aborted because login was cancelled.
 *
 * @param err - Rejection from `guardApi` or guarded mutations.
 */
export function isLoginCancelledError(err: unknown): boolean {
  return err instanceof LoginCancelledError;
}
