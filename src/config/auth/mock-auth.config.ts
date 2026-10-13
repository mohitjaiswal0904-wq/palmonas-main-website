import rawConfig from '@/config/auth/auth.config.json';
import type { GokwikPayload } from '@/types/auth/auth.types';

const mockAuthConfig = rawConfig.mockAuth;

const MOCK_PASSWORD_LENGTH = 13;
const MOCK_PASSWORD_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export interface MockAuthCredentials {
  phone: string;
  email: string;
  shopifyCustomerId: string;
}

/**
 * Whether temporary mock login is active.
 *
 * Controlled by `NEXT_PUBLIC_MOCK_AUTH_ENABLED` (`true` / unset).
 * Restart the Next.js dev server after changing this env var.
 */
export function isMockAuthEnabled(): boolean {
  // Literal env key required so Next.js can inline the public value on the client.
  return process.env.NEXT_PUBLIC_MOCK_AUTH_ENABLED === 'true';
}

/**
 * UI delay between mock login steps (ms).
 */
export function getMockAuthUiDelayMs(): number {
  return mockAuthConfig.uiDelayMs;
}

/**
 * Pre-filled mock OTP shown in the login modal.
 */
export function getMockAuthOtp(): string {
  return mockAuthConfig.mockOtp;
}

/**
 * Reads mock auth credentials from env (static keys required for Next.js client inlining).
 *
 * @throws When mock auth is enabled but required env vars are missing.
 */
export function getMockAuthCredentials(): MockAuthCredentials {
  const { credentials } = mockAuthConfig;
  const phone = process.env.NEXT_PUBLIC_MOCK_AUTH_PHONE ?? credentials.phone;
  const email = process.env.NEXT_PUBLIC_MOCK_AUTH_EMAIL ?? credentials.email;
  const shopifyCustomerId =
    process.env.NEXT_PUBLIC_MOCK_AUTH_SHOPIFY_CUSTOMER_ID ?? credentials.shopifyCustomerId;

  if (!phone || !email || !shopifyCustomerId) {
    throw new Error(
      'Mock auth is enabled but credentials are incomplete. Set NEXT_PUBLIC_MOCK_AUTH_PHONE, NEXT_PUBLIC_MOCK_AUTH_EMAIL, and NEXT_PUBLIC_MOCK_AUTH_SHOPIFY_CUSTOMER_ID in .env.development (or .env.local) and restart the dev server.',
    );
  }

  return { phone, email, shopifyCustomerId };
}

/**
 * Generates a random alphanumeric password for mock login API requests.
 */
export function generateMockPassword(length = MOCK_PASSWORD_LENGTH): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => MOCK_PASSWORD_CHARS[byte % MOCK_PASSWORD_CHARS.length]).join(
    '',
  );
}

/**
 * Reads mock KwikPass kpToken from env or config fallback.
 */
export function getMockAuthKpToken(): string {
  return process.env.NEXT_PUBLIC_MOCK_AUTH_KP_TOKEN ?? mockAuthConfig.mockKpToken;
}

/**
 * Builds gokwik payload for mock login with configured kpToken.
 */
export function buildMockGokwikPayload(): GokwikPayload {
  const credentials = getMockAuthCredentials();
  return {
    phone: credentials.phone,
    email: credentials.email,
    password: generateMockPassword(),
    shopifyCustomerId: credentials.shopifyCustomerId,
    isNewUser: false,
    state: 'ENABLED',
    kpToken: getMockAuthKpToken(),
    multipassToken: null,
    customerInsights: null,
  };
}
