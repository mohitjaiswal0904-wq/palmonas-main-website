import { POP_PAID_MONTHS, POP_TOTAL_MONTHS, getPopPlanStatusLabel } from '@/config/pop.config';

/** Which plan card layout to render. */
export type PopPlanCardKind = 'progress' | 'redeemable';

/** Normalised POP plan for the my-plans UI. */
export interface PopPlan {
  id: string;
  razorpaySubscriptionId: string;
  apiStatus: string;
  statusLabel: string;
  cardKind: PopPlanCardKind;
  planName: string;
  monthlyAmount: number;
  paidSoFar: number;
  totalValue: number;
  bonusAmount: number;
  redeemableAmount: number;
  paidCount: number;
  totalCount: number;
  remainingCount: number;
}

/** Query params for GET /api/v2/pop/subscriptions. */
export interface PopSubscriptionListParams {
  limit?: number;
  offset?: number;
}

/** Single subscription item from GET /api/v2/pop/subscriptions. */
export interface PopSubscriptionApiItem {
  id?: string | number;
  subscription_id?: string | number;
  razorpay_subscription_id?: string;
  razorpaySubscriptionId?: string;
  razorpay_sub_id?: string;
  subscription?: PopSubscriptionApiItem | Record<string, unknown>;
  status?: string;
  plan_name?: string;
  plan_type?: string;
  name?: string;
  amount?: number;
  amount_paise?: number;
  monthly_amount?: number;
  monthly_amount_paise?: number;
  instalment_amount?: number;
  paid_amount?: number;
  paid_amount_paise?: number;
  paid_so_far?: number;
  paid_so_far_paise?: number;
  amount_paid?: number;
  total_value?: number;
  total_value_paise?: number;
  total_amount?: number;
  total_redeemable_paise?: number;
  bonus_amount?: number;
  bonus_amount_paise?: number;
  bonus?: number;
  redeemable_amount?: number;
  instalments_paid?: number;
  installments_paid?: number;
  paid_instalments?: number;
  paid_count?: number;
  remaining_count?: number;
  total_count?: number;
  total_instalments?: number;
  billing_mode?: string;
  created_at?: string;
  is_redeemable?: boolean;
  all_instalments_completed?: boolean;
  ready_to_redeem?: boolean;
  custom_data?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/** Paginated list payload inside the API `data` object. */
export interface PopSubscriptionListPage {
  count?: number;
  items?: PopSubscriptionApiItem[];
  limit?: number;
  offset?: number;
  total?: number;
}

/** List API envelope variants. */
export interface PopSubscriptionListApiResponse extends PopSubscriptionListPage {
  data?: PopSubscriptionApiItem[] | PopSubscriptionListPage;
  items?: PopSubscriptionApiItem[];
  subscriptions?: PopSubscriptionApiItem[];
  results?: PopSubscriptionApiItem[];
  status?: number;
  message?: string;
  [key: string]: unknown;
}

export interface PopPlanListResult {
  plans: PopPlan[];
  total: number;
}

const REDEEMABLE_STATUSES = new Set([
  'completed',
  'redeemable',
  'ready_to_redeem',
  'ready',
  'redeemed_pending',
]);

/**
 * Converts paise from the POP API into rupees for display.
 *
 * @param paise - Amount in paise from API.
 * @returns Amount in rupees, or 0 when invalid.
 */
export function paiseToRupees(paise: unknown): number {
  const value = Number(paise);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value / 100;
}

/**
 * Reads the first positive rupee amount from optional paise/rupee fields.
 *
 * @param paise - Primary paise field.
 * @param rupees - Fallback rupee field.
 * @returns Amount in rupees.
 */
export function readPopAmountRupees(paise: unknown, rupees?: unknown): number {
  const fromPaise = paiseToRupees(paise);
  if (fromPaise > 0) return fromPaise;
  const fromRupees = Number(rupees);
  return Number.isFinite(fromRupees) && fromRupees > 0 ? fromRupees : 0;
}

/**
 * Reads monthly instalment amount from a subscription API item.
 *
 * @param item - Raw subscription from list API.
 * @returns Monthly amount in rupees.
 */
export function readPopMonthlyAmount(item: PopSubscriptionApiItem): number {
  return readPopAmountRupees(
    item.amount_paise ?? item.monthly_amount_paise,
    item.monthly_amount ?? item.instalment_amount ?? item.amount,
  );
}

/**
 * Resolves a stable subscription id for list keys and actions.
 *
 * @param item - Raw subscription from list API.
 * @returns Subscription id string, or null when none is available.
 */
export function readPopSubscriptionId(item: PopSubscriptionApiItem): string | null {
  const id = item.id ?? item.subscription_id;
  if (id != null && String(id).length > 0) return String(id);
  if (typeof item.created_at === 'string' && item.created_at.length > 0) return item.created_at;
  return null;
}

/**
 * Flattens nested subscription payloads from list/detail API variants.
 *
 * @param item - Raw subscription row from POP APIs.
 * @returns Normalised top-level subscription fields.
 */
export function normalizePopSubscriptionApiItem(
  item: PopSubscriptionApiItem,
): PopSubscriptionApiItem {
  const record = item as Record<string, unknown>;
  const nested = record.subscription;

  if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
    return { ...(nested as PopSubscriptionApiItem), ...item };
  }

  return item;
}

/**
 * Reads Razorpay subscription id used by GET /api/v2/pop/subscriptions/{sub_id}.
 *
 * @param item - Raw subscription from list API.
 * @returns Razorpay subscription id string, or null when unavailable.
 */
export function readPopRazorpaySubscriptionId(item: PopSubscriptionApiItem): string | null {
  const normalized = normalizePopSubscriptionApiItem(item);
  const record = normalized as Record<string, unknown>;
  const customData =
    normalized.custom_data && typeof normalized.custom_data === 'object'
      ? (normalized.custom_data as Record<string, unknown>)
      : null;

  const candidates: unknown[] = [
    normalized.razorpay_subscription_id,
    normalized.razorpaySubscriptionId,
    normalized.razorpay_sub_id,
    record.razorpay_subscription_id,
    record.razorpaySubscriptionId,
    customData?.razorpay_subscription_id,
    customData?.razorpaySubscriptionId,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      return candidate.trim();
    }
  }

  const subscriptionId = normalized.subscription_id;
  if (typeof subscriptionId === 'string' && subscriptionId.startsWith('sub_')) {
    return subscriptionId;
  }

  return null;
}

/**
 * Normalises raw API status string.
 *
 * @param item - Raw subscription from list API.
 * @returns Lower-case API status (defaults to `created`).
 */
export function readPopApiStatus(item: PopSubscriptionApiItem): string {
  return String(item.status ?? 'created').toLowerCase();
}

/**
 * Reads paid instalment count from Razorpay POP subscription fields.
 *
 * @param item - Raw subscription from list API.
 * @returns Number of instalments paid so far.
 */
export function readPopPaidCount(item: PopSubscriptionApiItem): number {
  const paid = Number(
    item.paid_count ??
      item.instalments_paid ??
      item.installments_paid ??
      item.paid_instalments ??
      0,
  );
  return Number.isFinite(paid) && paid >= 0 ? paid : 0;
}

/**
 * Derives which card layout to use for a subscription.
 *
 * @param item - Raw subscription from list API.
 * @returns `redeemable` for completed plans, otherwise `progress`.
 */
export function resolvePopPlanCardKind(item: PopSubscriptionApiItem): PopPlanCardKind {
  const apiStatus = readPopApiStatus(item);
  if (
    item.is_redeemable === true ||
    item.all_instalments_completed === true ||
    item.ready_to_redeem === true ||
    REDEEMABLE_STATUSES.has(apiStatus)
  ) {
    return 'redeemable';
  }

  const paidCount = readPopPaidCount(item);
  const totalCount = Number(item.total_count ?? 0);
  const remainingCount = Number(item.remaining_count ?? 0);

  if (totalCount > 0 && paidCount >= totalCount && remainingCount === 0) {
    return 'redeemable';
  }

  return 'progress';
}

/**
 * Extracts subscription array from list API envelope.
 *
 * @param raw - Raw list API response (paginated `data` object or legacy shapes).
 * @returns Subscription items array.
 */
export function extractPopSubscriptionItems(
  raw: PopSubscriptionListApiResponse,
): PopSubscriptionApiItem[] {
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.subscriptions)) return raw.subscriptions;
  if (Array.isArray(raw.results)) return raw.results;
  if (Array.isArray(raw.data)) return raw.data;

  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    const nested = raw.data as PopSubscriptionListPage;
    if (Array.isArray(nested.items)) return nested.items;
  }

  return [];
}

/**
 * Reads total subscription count from paginated list payload.
 *
 * @param raw - Raw list API response.
 * @returns Total count from API or transformed plan count fallback.
 */
export function readPopSubscriptionTotal(
  raw: PopSubscriptionListApiResponse,
  planCount: number,
): number {
  if (typeof raw.total === 'number') return raw.total;
  if (typeof raw.count === 'number') return raw.count;

  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    const nested = raw.data as PopSubscriptionListPage;
    if (typeof nested.total === 'number') return nested.total;
    if (typeof nested.count === 'number') return nested.count;
  }

  return planCount;
}

/**
 * Maps a subscription API item to a UI plan card.
 *
 * @param item - Raw subscription from list API.
 * @returns Normalised plan for rendering.
 */
export function transformPopSubscriptionItem(item: PopSubscriptionApiItem): PopPlan | null {
  const normalized = normalizePopSubscriptionApiItem(item);
  const id = readPopSubscriptionId(normalized);
  const razorpaySubscriptionId = readPopRazorpaySubscriptionId(normalized);
  if (!id || !razorpaySubscriptionId) return null;

  const monthlyAmount = readPopMonthlyAmount(normalized);
  if (monthlyAmount <= 0) return null;

  const paidCount = readPopPaidCount(normalized);
  const totalCount = Number(normalized.total_count ?? POP_PAID_MONTHS);
  const remainingCount = Number(normalized.remaining_count ?? Math.max(totalCount - paidCount, 0));

  const paidFromApi = readPopAmountRupees(
    normalized.paid_amount_paise ?? normalized.paid_so_far_paise,
    normalized.paid_so_far ?? normalized.paid_amount ?? normalized.amount_paid,
  );
  const paidSoFar = paidFromApi > 0 ? paidFromApi : monthlyAmount * paidCount;

  const totalValue =
    readPopAmountRupees(
      normalized.total_value_paise ?? normalized.total_redeemable_paise,
      normalized.total_value,
    ) || monthlyAmount * POP_TOTAL_MONTHS;

  const bonusAmount =
    readPopAmountRupees(
      normalized.bonus_amount_paise,
      normalized.bonus_amount ?? normalized.bonus,
    ) || monthlyAmount;

  const redeemableAmount =
    readPopAmountRupees(normalized.total_redeemable_paise, normalized.redeemable_amount) ||
    totalValue;

  const apiStatus = readPopApiStatus(normalized);

  const planName =
    (typeof normalized.plan_name === 'string' && normalized.plan_name) ||
    (typeof normalized.plan_type === 'string' && normalized.plan_type) ||
    (typeof normalized.name === 'string' && normalized.name) ||
    'Saving 5+1 Plan';

  return {
    id,
    razorpaySubscriptionId,
    apiStatus,
    statusLabel: getPopPlanStatusLabel(apiStatus),
    cardKind: resolvePopPlanCardKind(normalized),
    planName,
    monthlyAmount,
    paidSoFar,
    totalValue,
    bonusAmount,
    redeemableAmount,
    paidCount,
    totalCount,
    remainingCount,
  };
}

/**
 * Transforms list API response into sorted UI plans (redeemable first).
 *
 * @param raw - Raw list API response.
 * @returns Plans and total count.
 */
export function transformPopSubscriptionList(
  raw: PopSubscriptionListApiResponse,
): PopPlanListResult {
  const items = extractPopSubscriptionItems(raw);
  const plans = items
    .map(transformPopSubscriptionItem)
    .filter((plan): plan is PopPlan => plan != null)
    .sort((a, b) => {
      if (a.cardKind === b.cardKind) return 0;
      return a.cardKind === 'redeemable' ? -1 : 1;
    });

  return {
    plans,
    total: readPopSubscriptionTotal(raw, plans.length),
  };
}
