import { POP_PAID_MONTHS, POP_TOTAL_MONTHS, popPlanDetailMessages } from '@/config/pop.config';
import { readPopAmountRupees, readPopMonthlyAmount } from '@/types/pop/subscription-list';
import type { PopSubscriptionApiItem } from '@/types/pop/subscription-list';

/** Instalment row kind for the details timeline. */
export type PopInstalmentKind = 'paid' | 'upcoming' | 'bonus';

/** Normalised instalment row for the plan details UI. */
export interface PopInstalment {
  id: string;
  kind: PopInstalmentKind;
  sequence: number;
  title: string;
  subtitle: string;
  amountLabel: string;
  statusLabel?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  bonusMessage?: string;
}

/** Query params for GET /api/v2/pop/subscriptions/{sub_id}. */
export interface PopSubscriptionDetailParams {
  count?: number;
  skip?: number;
}

/** Raw instalment item from the subscription detail API. */
export interface PopInstalmentApiItem {
  id?: string | number;
  instalment_id?: string | number;
  sequence?: number;
  instalment_number?: number;
  month_number?: number;
  index?: number;
  number?: number;
  status?: string;
  type?: string;
  is_bonus?: boolean;
  bonus?: boolean;
  amount?: number;
  amount_paise?: number;
  paid_at?: string;
  paid_on?: string;
  payment_date?: string;
  completed_at?: string;
  due_at?: string;
  due_on?: string;
  due_date?: string;
  scheduled_at?: string;
  available_from?: string;
  available_at?: string;
  days_left?: number;
  days_remaining?: number;
  payment_method?: string;
  payment_mode?: string;
  method?: string;
  receipt_url?: string;
  invoice_url?: string;
  [key: string]: unknown;
}

/** Detail API payload variants. */
export interface PopSubscriptionDetailApiResponse {
  subscription?: PopSubscriptionApiItem;
  items?: PopInstalmentApiItem[];
  instalments?: PopInstalmentApiItem[];
  payments?: PopInstalmentApiItem[];
  bonus?: PopInstalmentApiItem | Record<string, unknown>;
  count?: number;
  skip?: number;
  total?: number;
  data?: PopSubscriptionDetailApiResponse | PopInstalmentApiItem[];
  [key: string]: unknown;
}

export interface PopPlanDetailResult {
  subscriptionId: string;
  planName: string;
  monthlyAmount: number;
  instalments: PopInstalment[];
}

const PAID_STATUSES = new Set(['paid', 'completed', 'success', 'captured', 'settled']);
const UPCOMING_STATUSES = new Set([
  'pending',
  'due',
  'upcoming',
  'scheduled',
  'created',
  'open',
  'active',
]);
const BONUS_STATUSES = new Set(['bonus', 'free', 'complimentary', 'reward']);

/**
 * Formats an instalment date as `5 Mar 2026` for POP detail copy.
 *
 * @param value - ISO date string or Date.
 * @returns Compact formatted date.
 */
export function formatPopInstalmentDate(value: string | Date): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

/**
 * Builds user-facing days-left copy for upcoming instalments.
 *
 * @param days - Remaining days from API.
 * @returns Localised status label.
 */
export function formatPopDaysLeft(days: number): string {
  if (days === 1) return popPlanDetailMessages.dayLeft;
  return popPlanDetailMessages.daysLeft.replace('{count}', String(days));
}

/**
 * Reads instalment sequence number from API item.
 *
 * @param item - Raw instalment row.
 * @param fallback - Index-based fallback when API omits sequence.
 * @returns 1-based instalment number.
 */
export function readPopInstalmentSequence(item: PopInstalmentApiItem, fallback: number): number {
  const sequence = Number(
    item.instalment_number ?? item.sequence ?? item.month_number ?? item.number ?? item.index,
  );
  return Number.isFinite(sequence) && sequence > 0 ? sequence : fallback;
}

/**
 * Determines whether a raw instalment row represents the bonus month.
 *
 * @param item - Raw instalment row.
 * @returns True when row is the free bonus month.
 */
export function isPopBonusInstalment(item: PopInstalmentApiItem): boolean {
  if (item.is_bonus === true || item.bonus === true) return true;
  const status = String(item.status ?? item.type ?? '').toLowerCase();
  return BONUS_STATUSES.has(status);
}

/**
 * Resolves instalment kind from API status/type fields.
 *
 * @param item - Raw instalment row.
 * @returns Timeline row kind.
 */
export function resolvePopInstalmentKind(item: PopInstalmentApiItem): PopInstalmentKind {
  if (isPopBonusInstalment(item)) return 'bonus';

  const status = String(item.status ?? item.type ?? '').toLowerCase();
  if (PAID_STATUSES.has(status)) return 'paid';
  if (UPCOMING_STATUSES.has(status)) return 'upcoming';
  if (status.includes('paid')) return 'paid';
  if (status.includes('due') || status.includes('pending')) return 'upcoming';
  return 'upcoming';
}

/**
 * Extracts instalment rows from detail API payload.
 *
 * @param raw - Raw detail API body.
 * @returns Instalment items array.
 */
export function extractPopInstalmentItems(
  raw: PopSubscriptionDetailApiResponse,
): PopInstalmentApiItem[] {
  if (Array.isArray(raw.items)) return raw.items;
  if (Array.isArray(raw.instalments)) return raw.instalments;
  if (Array.isArray(raw.payments)) return raw.payments;
  if (Array.isArray(raw.data)) return raw.data;

  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    return extractPopInstalmentItems(raw.data as PopSubscriptionDetailApiResponse);
  }

  return [];
}

/**
 * Reads optional bonus row from detail payload when not included in items.
 *
 * @param raw - Raw detail API body.
 * @returns Bonus instalment row or null.
 */
function readPopBonusItem(raw: PopSubscriptionDetailApiResponse): PopInstalmentApiItem | null {
  if (raw.bonus && typeof raw.bonus === 'object') {
    return raw.bonus as PopInstalmentApiItem;
  }

  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    const nested = raw.data as PopSubscriptionDetailApiResponse;
    if (nested.bonus && typeof nested.bonus === 'object') {
      return nested.bonus as PopInstalmentApiItem;
    }
  }

  return null;
}

/**
 * Reads subscription summary from detail payload.
 *
 * @param raw - Raw detail API body.
 * @returns Subscription summary object when present.
 */
export function readPopDetailSubscription(
  raw: PopSubscriptionDetailApiResponse,
): PopSubscriptionApiItem | undefined {
  if (raw.subscription && typeof raw.subscription === 'object') {
    return raw.subscription;
  }

  if (raw.data && typeof raw.data === 'object' && !Array.isArray(raw.data)) {
    const nested = raw.data as PopSubscriptionDetailApiResponse;
    if (nested.subscription && typeof nested.subscription === 'object') {
      return nested.subscription;
    }
  }

  return undefined;
}

function readPopInstalmentDate(item: PopInstalmentApiItem, paid: boolean): string | undefined {
  const value = paid
    ? (item.paid_at ?? item.paid_on ?? item.payment_date ?? item.completed_at)
    : (item.due_at ??
      item.due_on ??
      item.due_date ??
      item.scheduled_at ??
      item.available_from ??
      item.available_at);

  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readPopPaymentMethod(item: PopInstalmentApiItem): string | undefined {
  const method = item.payment_method ?? item.payment_mode ?? item.method;
  if (typeof method !== 'string' || method.length === 0) return undefined;
  return method.toUpperCase();
}

function readPopReceiptUrl(item: PopInstalmentApiItem): string | undefined {
  const url = item.receipt_url ?? item.invoice_url;
  return typeof url === 'string' && url.length > 0 ? url : undefined;
}

/**
 * Maps a raw instalment row to UI timeline data.
 *
 * @param item - Raw instalment from detail API.
 * @param fallbackSequence - Index fallback for missing sequence.
 * @param monthlyAmount - Plan monthly amount for display fallback.
 * @returns Normalised instalment row.
 */
export function transformPopInstalmentItem(
  item: PopInstalmentApiItem,
  fallbackSequence: number,
  monthlyAmount: number,
): PopInstalment {
  const kind = resolvePopInstalmentKind(item);
  const sequence = readPopInstalmentSequence(item, fallbackSequence);
  const amount =
    readPopAmountRupees(item.amount_paise, item.amount) || (kind === 'bonus' ? 0 : monthlyAmount);

  const dateValue = readPopInstalmentDate(item, kind === 'paid');
  const formattedDate = dateValue ? formatPopInstalmentDate(dateValue) : '';

  if (kind === 'bonus') {
    return {
      id: String(item.id ?? item.instalment_id ?? `bonus-${sequence}`),
      kind,
      sequence,
      title: popPlanDetailMessages.bonusMonthTitle,
      subtitle: formattedDate
        ? popPlanDetailMessages.availableFrom.replace('{date}', formattedDate)
        : '',
      amountLabel: popPlanDetailMessages.freeLabel,
      bonusMessage: popPlanDetailMessages.bonusMessage,
    };
  }

  const title = popPlanDetailMessages.instalmentTitle.replace('{number}', String(sequence));
  const subtitle = formattedDate
    ? kind === 'paid'
      ? popPlanDetailMessages.paidOn.replace('{date}', formattedDate)
      : popPlanDetailMessages.dueOn.replace('{date}', formattedDate)
    : '';

  const daysLeft = Number(item.days_left ?? item.days_remaining);
  const statusLabel =
    kind === 'paid'
      ? popPlanDetailMessages.paidStatus
      : Number.isFinite(daysLeft) && daysLeft >= 0
        ? formatPopDaysLeft(daysLeft)
        : undefined;

  return {
    id: String(item.id ?? item.instalment_id ?? `instalment-${sequence}`),
    kind,
    sequence,
    title,
    subtitle,
    amountLabel: new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount),
    statusLabel,
    paymentMethod: kind === 'paid' ? readPopPaymentMethod(item) : undefined,
    receiptUrl: kind === 'paid' ? readPopReceiptUrl(item) : undefined,
  };
}

/**
 * Builds a bonus-month row when the API omits it from the items list.
 *
 * @param monthlyAmount - Monthly instalment amount.
 * @returns Synthetic bonus instalment row.
 */
function buildFallbackBonusInstalment(monthlyAmount: number): PopInstalment {
  void monthlyAmount;
  return {
    id: 'bonus-month',
    kind: 'bonus',
    sequence: POP_TOTAL_MONTHS,
    title: popPlanDetailMessages.bonusMonthTitle,
    subtitle: '',
    amountLabel: popPlanDetailMessages.freeLabel,
    bonusMessage: popPlanDetailMessages.bonusMessage,
  };
}

/**
 * Transforms subscription detail API payload into timeline UI data.
 *
 * @param raw - Raw detail API response.
 * @param subscriptionId - Subscription id from route.
 * @returns Normalised plan detail for rendering.
 */
export function transformPopSubscriptionDetail(
  raw: PopSubscriptionDetailApiResponse,
  subscriptionId: string,
): PopPlanDetailResult {
  const subscription = readPopDetailSubscription(raw);
  const monthlyAmount = subscription ? readPopMonthlyAmount(subscription) : 0;
  const planName =
    (subscription && typeof subscription.plan_name === 'string' && subscription.plan_name) ||
    (subscription && typeof subscription.name === 'string' && subscription.name) ||
    'Saving 5+1 Plan';

  const rawItems = extractPopInstalmentItems(raw);
  const bonusItem = readPopBonusItem(raw);

  const mergedItems = [...rawItems];
  if (bonusItem && !mergedItems.some(isPopBonusInstalment)) {
    mergedItems.push(bonusItem);
  }

  let instalments = mergedItems.map((item, index) =>
    transformPopInstalmentItem(item, index + 1, monthlyAmount),
  );

  if (instalments.length === 0 && subscription) {
    const paidCount = Number(subscription.paid_count ?? 0);
    const totalCount = Number(subscription.total_count ?? POP_PAID_MONTHS);
    const synthesized: PopInstalmentApiItem[] = [];

    for (let index = 1; index <= totalCount; index += 1) {
      synthesized.push({
        instalment_number: index,
        status: index <= paidCount ? 'paid' : 'pending',
        amount_paise: Math.round(monthlyAmount * 100),
      });
    }

    synthesized.push({ is_bonus: true, status: 'bonus' });
    instalments = synthesized.map((item, index) =>
      transformPopInstalmentItem(item, index + 1, monthlyAmount),
    );
  }

  if (!instalments.some((item) => item.kind === 'bonus')) {
    instalments = [...instalments, buildFallbackBonusInstalment(monthlyAmount)];
  }

  instalments.sort((a, b) => {
    if (a.kind === 'bonus') return 1;
    if (b.kind === 'bonus') return -1;
    return a.sequence - b.sequence;
  });

  return {
    subscriptionId,
    planName,
    monthlyAmount,
    instalments,
  };
}
