import type {
  CreatePopSubscriptionApi,
  PopApiEnvelope,
  PopInvoiceApi,
  PopInvoiceCollectionApi,
  PopSubscriptionApi,
  PopSubscriptionTrackApi,
  PopSubscriptionsListApi,
} from '@/types/pop/pop.api';
import type {
  CreatePopSubscriptionResult,
  PopInvoice,
  PopSavingsBreakdown,
  PopSubscription,
  PopSubscriptionDetail,
  PopSubscriptionsPage,
} from '@/types/pop/pop.types';

const PAISE_PER_RUPEE = 100;
const POP_PAID_MONTHS = 5;
const POP_TOTAL_MONTHS = 6;

/**
 * Unwraps Palmonas `{ status, message, data }` POP API envelopes.
 *
 * @param envelope - Raw API response body.
 * @returns Inner `data` payload.
 */
export function unwrapPopEnvelope<T>(envelope: PopApiEnvelope<T>): T {
  return envelope.data;
}

/** Converts paise from API to rupees for display. */
export function paiseToRupees(paise: number): number {
  return paise / PAISE_PER_RUPEE;
}

/** Converts rupees to paise for API payloads when needed. */
export function rupeesToPaise(rupees: number): number {
  return rupees * PAISE_PER_RUPEE;
}

/**
 * Calculates POP savings breakdown for a monthly instalment amount.
 *
 * @param monthlyAmount - Monthly amount in rupees (multiples of 1,000).
 * @returns Instalment, bonus, and redeemable totals.
 */
export function calculatePopSavings(monthlyAmount: number): PopSavingsBreakdown {
  return {
    monthlyAmount,
    totalInstallments: monthlyAmount * POP_PAID_MONTHS,
    bonusAmount: monthlyAmount,
    redeemableAmount: monthlyAmount * POP_TOTAL_MONTHS,
  };
}

export function transformPopSubscription(raw: PopSubscriptionApi): PopSubscription {
  return {
    id: raw.id,
    subscriptionId: raw.razorpay_subscription_id,
    monthlyAmount: paiseToRupees(raw.amount_paise),
    status: raw.status,
    paidCount: raw.paid_count,
    remainingCount: raw.remaining_count,
    totalCount: raw.total_count,
    phoneNumber: raw.phone_number,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
    reference: raw.reference,
  };
}

export function transformPopSubscriptionsList(raw: PopSubscriptionsListApi): PopSubscriptionsPage {
  return {
    items: raw.items.map(transformPopSubscription),
    total: raw.total,
    limit: raw.limit,
    offset: raw.offset,
  };
}

export function transformCreatePopSubscription(
  raw: CreatePopSubscriptionApi,
): CreatePopSubscriptionResult {
  return {
    subscriptionId: raw.subscription_id,
    paymentUrl: raw.payment_url,
    status: raw.status,
    omsReference: raw.oms_reference,
    totalMonths: raw.total_months,
    billingMode: raw.billing_mode,
  };
}

function transformPopInvoice(raw: PopInvoiceApi): PopInvoice {
  const lineItem = raw.line_items?.[0];

  return {
    id: raw.id,
    amount: paiseToRupees(raw.amount),
    amountDue: paiseToRupees(raw.amount_due),
    amountPaid: paiseToRupees(raw.amount_paid),
    status: raw.status,
    paymentUrl: raw.short_url ?? null,
    createdAt: new Date(raw.created_at * 1000).toISOString(),
    currency: raw.currency,
    description: lineItem?.description ?? lineItem?.name ?? 'Monthly instalment',
  };
}

function pickInvoiceCollection(
  primary?: PopInvoiceCollectionApi,
  fallback?: PopInvoiceCollectionApi,
): PopInvoiceApi[] {
  const collection = primary?.items?.length ? primary : fallback;
  return collection?.items ?? [];
}

export function transformPopSubscriptionDetail(
  raw: PopSubscriptionTrackApi,
): PopSubscriptionDetail {
  const invoiceItems = pickInvoiceCollection(raw.invoices, raw.razorpay_invoices);

  return {
    subscriptionId: raw.subscription_id ?? '',
    omsReference: raw.oms_reference,
    phoneNumber: raw.phone_number,
    billingMode: raw.billing_mode,
    paymentMode: raw.payment_mode,
    status: raw.status ?? 'unknown',
    totalMonths: raw.total_months ?? POP_PAID_MONTHS,
    invoices: invoiceItems.map(transformPopInvoice),
  };
}
