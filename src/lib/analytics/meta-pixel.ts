import type { AnalyticsPropertyValue } from '@/types/analytics';

/** Meta Pixel advanced-matching fields (plaintext — Meta hashes in the browser). */
export interface MetaAdvancedMatchingInput {
  email?: string | null;
  phone?: string | null;
  externalId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  country?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
}

type MetaCheckoutLine = {
  product_id: string;
  quantity: number;
  price: number;
};

type MetaCommerceContentItem = {
  id: string;
  quantity: number;
  item_price: number;
};

type MetaTrackPayloadValue = AnalyticsPropertyValue | string[] | MetaCommerceContentItem[];

type MetaTrackPayload = Record<string, MetaTrackPayloadValue>;

const META_FBC_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

/**
 * Normalizes an email for Meta advanced matching.
 *
 * @param email - Raw email from profile or checkout.
 * @returns Lowercase trimmed email, or undefined when invalid.
 */
export function normalizeMetaEmail(email: string): string | undefined {
  const normalized = email.trim().toLowerCase();
  return normalized.includes('@') ? normalized : undefined;
}

/**
 * Normalizes a phone number to E.164 for Meta advanced matching.
 *
 * @param phone - Raw phone (often 10-digit Indian numbers).
 * @param defaultCountryCode - Country calling code without `+` (defaults to India `91`).
 * @returns E.164 phone string, or undefined when no usable digits exist.
 */
export function normalizeMetaPhoneE164(
  phone: string,
  defaultCountryCode = '91',
): string | undefined {
  const trimmed = phone.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (!digits) {
    return undefined;
  }

  if (trimmed.startsWith('+')) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+${defaultCountryCode}${digits}`;
  }

  if (digits.length > 10) {
    return `+${digits}`;
  }

  return undefined;
}

/**
 * Normalizes a country to ISO 3166-1 alpha-2 lowercase.
 *
 * @param country - Country name or code.
 * @returns Two-letter country code, or undefined when not recognized.
 */
export function normalizeMetaCountry(country: string): string | undefined {
  const normalized = country.trim().toLowerCase();

  if (normalized.length === 2) {
    return normalized;
  }

  if (normalized === 'india' || normalized === 'in') {
    return 'in';
  }

  return undefined;
}

/**
 * Normalizes gender to Meta's `m` / `f` values.
 *
 * @param gender - Raw gender string from profile.
 * @returns `m`, `f`, or undefined.
 */
export function normalizeMetaGender(gender: string): 'm' | 'f' | undefined {
  const normalized = gender.trim().toLowerCase();

  if (normalized === 'm' || normalized === 'male') {
    return 'm';
  }

  if (normalized === 'f' || normalized === 'female') {
    return 'f';
  }

  return undefined;
}

/**
 * Normalizes date of birth to Meta's YYYYMMDD format.
 *
 * @param dateOfBirth - ISO date (`YYYY-MM-DD`) or compact `YYYYMMDD`.
 * @returns Eight-digit date string, or undefined when invalid.
 */
export function normalizeMetaDateOfBirth(dateOfBirth: string): string | undefined {
  const digits = dateOfBirth.replace(/\D/g, '');

  if (digits.length === 8) {
    return digits;
  }

  return undefined;
}

/**
 * Builds Meta advanced-matching init params from available customer fields.
 *
 * @param input - Customer identity fields from auth or checkout.
 * @returns Plaintext advanced-matching map for `fbq('init', ...)`.
 */
export function buildMetaAdvancedMatchingParams(
  input: MetaAdvancedMatchingInput,
): Record<string, string> {
  const params: Record<string, string> = {};

  const email = input.email ? normalizeMetaEmail(input.email) : undefined;
  if (email) {
    params.em = email;
  }

  const phone = input.phone ? normalizeMetaPhoneE164(input.phone) : undefined;
  if (phone) {
    params.ph = phone;
  }

  const externalId = input.externalId?.trim();
  if (externalId) {
    params.external_id = externalId;
  }

  const firstName = input.firstName?.trim().toLowerCase();
  if (firstName) {
    params.fn = firstName;
  }

  const lastName = input.lastName?.trim().toLowerCase();
  if (lastName) {
    params.ln = lastName;
  }

  const city = input.city?.trim().toLowerCase();
  if (city) {
    params.ct = city;
  }

  const state = input.state?.trim().toLowerCase();
  if (state) {
    params.st = state;
  }

  const zip = input.zip?.trim().toLowerCase();
  if (zip) {
    params.zp = zip;
  }

  const country = input.country ? normalizeMetaCountry(input.country) : undefined;
  if (country) {
    params.country = country;
  }

  const dateOfBirth = input.dateOfBirth ? normalizeMetaDateOfBirth(input.dateOfBirth) : undefined;
  if (dateOfBirth) {
    params.db = dateOfBirth;
  }

  const gender = input.gender ? normalizeMetaGender(input.gender) : undefined;
  if (gender) {
    params.ge = gender;
  }

  return params;
}

/**
 * Reads a first-party cookie value in the browser.
 *
 * @param name - Cookie name.
 * @returns Decoded cookie value, or undefined when absent.
 */
export function readBrowserCookie(name: string): string | undefined {
  if (typeof document === 'undefined') {
    return undefined;
  }

  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`),
  );

  if (!match?.[1]) {
    return undefined;
  }

  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Builds the `_fbc` cookie value from a Facebook click id.
 *
 * @param fbclid - `fbclid` query parameter from ad landing URLs.
 * @param createdAtMs - Creation timestamp in milliseconds.
 * @returns Meta `_fbc` value (`fb.1.{ts}.{fbclid}`).
 */
export function buildMetaFbcValue(fbclid: string, createdAtMs = Date.now()): string {
  return `fb.1.${createdAtMs}.${fbclid}`;
}

/**
 * Persists `_fbc` when the visitor lands with `fbclid` in the URL.
 *
 * @param fbclid - Facebook click id query param.
 * @returns Stored `_fbc` value.
 */
export function ensureMetaFbcCookie(fbclid: string): string {
  const value = buildMetaFbcValue(fbclid);

  if (typeof document !== 'undefined') {
    document.cookie = `_fbc=${encodeURIComponent(value)}; path=/; max-age=${META_FBC_MAX_AGE_SECONDS}; SameSite=Lax`;
  }

  return value;
}

/**
 * Captures `fbclid` from the current URL and writes `_fbc` when present.
 *
 * @param search - URL search string (defaults to `window.location.search`).
 */
export function captureMetaFbcFromUrl(search?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const fbclid = new URLSearchParams(search ?? window.location.search).get('fbclid')?.trim();

  if (!fbclid) {
    return;
  }

  ensureMetaFbcCookie(fbclid);
}

/**
 * Generates a unique Meta event id for deduplication with Conversions API.
 *
 * @returns UUID when available; otherwise a timestamp-based fallback id.
 */
export function generateMetaEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `meta-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function parseCheckoutLines(productsJson: string): MetaCheckoutLine[] {
  try {
    const parsed: unknown = JSON.parse(productsJson);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((line) => {
      if (typeof line !== 'object' || line === null) {
        return [];
      }

      const record = line as Record<string, unknown>;
      const productId = String(record.product_id ?? '').trim();

      if (!productId) {
        return [];
      }

      return [
        {
          product_id: productId,
          quantity: Number(record.quantity ?? 1),
          price: Number(record.price ?? 0),
        },
      ];
    });
  } catch {
    return [];
  }
}

function appendMetaBrowserIdentifiers(payload: MetaTrackPayload): void {
  const fbp = readBrowserCookie('_fbp');
  const fbc = readBrowserCookie('_fbc');

  if (fbp) {
    payload.fbp = fbp;
  }

  if (fbc) {
    payload.fbc = fbc;
  }
}

function appendSingleProductCommerceFields(payload: MetaTrackPayload): void {
  const productId = payload.product_id;

  if (typeof productId !== 'string' || !productId.trim()) {
    return;
  }

  const quantity = Number(payload.quantity ?? 1);
  const itemPrice = Number(payload.price ?? payload.value ?? 0);

  payload.content_ids = [productId];
  payload.content_type = 'product';
  payload.contents = [
    {
      id: productId,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      item_price: Number.isFinite(itemPrice) ? itemPrice : 0,
    },
  ];
  payload.num_items = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  if (typeof payload.product_name === 'string' && payload.product_name.trim()) {
    payload.content_name = payload.product_name;
  }

  if (typeof payload.category === 'string' && payload.category.trim()) {
    payload.content_category = payload.category;
  }
}

function appendCheckoutCommerceFields(payload: MetaTrackPayload): void {
  if (typeof payload.products_json !== 'string') {
    return;
  }

  const lines = parseCheckoutLines(payload.products_json);

  if (lines.length === 0) {
    return;
  }

  payload.content_ids = lines.map((line) => line.product_id);
  payload.content_type = 'product';
  payload.contents = lines.map((line) => ({
    id: line.product_id,
    quantity: line.quantity,
    item_price: line.price,
  }));
  payload.num_items = lines.reduce((total, line) => total + line.quantity, 0);
}

/**
 * Builds the final Meta Pixel event payload with EMQ helpers and ecommerce fields.
 *
 * @param properties - Sanitized provider event properties.
 * @returns Meta Pixel `track` payload.
 */
export function buildMetaTrackPayload(
  properties: Record<string, AnalyticsPropertyValue>,
): MetaTrackPayload {
  const payload: MetaTrackPayload = { ...properties };

  payload.eventID = generateMetaEventId();

  if (typeof payload.is_guest === 'boolean') {
    payload.login_status = payload.is_guest ? 'guest' : 'logged_in';
  }

  appendSingleProductCommerceFields(payload);
  appendCheckoutCommerceFields(payload);
  appendMetaBrowserIdentifiers(payload);

  if (typeof payload.order_id === 'string' && payload.order_id.trim()) {
    payload.order_id = payload.order_id.trim();
  }

  delete payload.products_json;
  delete payload.user_id;
  delete payload.session_id;
  delete payload.is_guest;
  delete payload.platform;
  delete payload.timestamp;

  return payload;
}
