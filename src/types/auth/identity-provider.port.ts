/**
 * Vendor-agnostic identity provider contract (CUSTOM_SHOPIFY plugin).
 * Implemented by infrastructure adapters (e.g. KwikPass plugin).
 */
export interface IdentityProviderPort {
  /**
   * @returns True when handleKpLogin is callable.
   */
  isReady(): boolean;

  /**
   * Polls until the identity SDK is ready.
   *
   * @param maxMs - Maximum wait time in milliseconds.
   * @returns True when plugin login can be opened.
   */
  waitForReady(maxMs?: number): Promise<boolean>;

  /** Opens the vendor login modal (KwikPass overlay). */
  openLogin(): void;

  /** Clears vendor + Shopify session via handleLogout. */
  logout(redirectTo?: string): void;

  /** Subscribes to successful login (kp_data_sent with kpToken). */
  onAuthSuccess(callback: (payload: { kpToken: string }) => void): () => void;

  /** Subscribes to login errors from kp_data_sent. */
  onAuthError(callback: (error: { message: string; code?: string }) => void): () => void;

  /** Subscribes to user closing the vendor modal without completing login. */
  onAuthCancel(callback: () => void): () => void;
}
