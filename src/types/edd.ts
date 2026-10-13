export interface EddStoreDetails {
  address: string;
  found: true;
  mapLink: string;
  matchType: string;
  phone: string;
  pincode: string;
  storeName: string;
}

export interface EddResult {
  edd: string;
  pincode: string;
  /** Raw `ships_in` from utils EDD API — not shown as order-within copy. */
  shipsIn: string;
  /** Raw `order_within` from utils EDD API — drives "Order within" UI. */
  orderWithin: string;
  status: string;
  store: EddStoreDetails | null;
}

export interface CheckEddParams {
  pincode: string;
  inStock: boolean;
  /**
   * Catalog flavor for utils EDD API — mirrors palmonas-app:
   * `mto` for gold/MTO, `demifine` otherwise.
   */
  type: 'mto' | 'demifine';
}

interface EddStoreRecordApiResponse {
  address?: string;
  map_link?: string;
  match_type?: string;
  phone?: string;
  pincode?: string;
  store_name?: string;
}

interface EddStoreDetailsApiResponse {
  address?: string;
  district_prefix?: string;
  error?: string;
  found?: boolean;
  map_link?: string;
  match_type?: string;
  phone?: string;
  pincode?: string;
  store?: EddStoreRecordApiResponse | null;
  store_name?: string;
}

interface EddApiResponse {
  edd?: string;
  pincode?: string;
  ships_in?: string | null;
  status?: string;
  store_details?: EddStoreDetailsApiResponse;
  order_within?: string | null;
}

/**
 * Normalises optional EDD string fields from the utils API.
 *
 * @param value - Raw API value.
 * @returns Trimmed string, or empty when absent/non-string.
 */
function normalizeEddString(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
}

function parseStoreDetails(raw: EddStoreDetailsApiResponse | undefined): EddStoreDetails | null {
  if (!raw || raw.found !== true || raw.store === null) {
    return null;
  }

  const record = raw.store ?? raw;
  const storeName = record.store_name?.trim();

  if (!storeName) {
    return null;
  }

  return {
    address: record.address ?? raw.address ?? '',
    found: true,
    mapLink: record.map_link ?? raw.map_link ?? '',
    matchType: record.match_type ?? raw.match_type ?? '',
    phone: record.phone ?? raw.phone ?? '',
    pincode: record.pincode ?? raw.pincode ?? '',
    storeName,
  };
}

export function transformEdd(raw: EddApiResponse): EddResult {
  if (raw.status !== 'success' || !raw.edd || !raw.pincode) {
    throw new Error('Delivery is not available for this pincode.');
  }

  return {
    edd: raw.edd,
    pincode: raw.pincode,
    shipsIn: normalizeEddString(raw.ships_in),
    orderWithin: normalizeEddString(raw.order_within),
    status: raw.status,
    store: parseStoreDetails(raw.store_details),
  };
}
