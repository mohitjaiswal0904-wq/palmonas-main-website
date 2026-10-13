import type { PopEnrollmentMethod } from '@/config/pop.config';
import type { ApiResponse } from '@/types/api';

/** Backend payment modes for POP subscription creation. */
export type PopPaymentType = 'automatic' | 'manual';

/** Personal details payload carried into custom_data. */
export interface PopSubscriptionPersonalDetails {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  pincode: string;
  enrollmentMethod: PopEnrollmentMethod;
  storeId: string;
  autopay: boolean;
  acceptedTerms: boolean;
}

/** Request body for POST /api/v2/pop/subscriptions. */
export interface CreatePopSubscriptionRequest {
  amount: number;
  source: string;
  payment_type: PopPaymentType;
  callback_url: string;
  custom_data: Record<string, unknown>;
}

/** Nested payload returned by the create-subscription API. */
export interface PopSubscriptionApiData {
  id?: string | number;
  payment_url?: string | null;
  redirect_url?: string | null;
  checkout_url?: string | null;
  short_url?: string | null;
  [key: string]: unknown;
}

export type CreatePopSubscriptionEnvelope = ApiResponse<PopSubscriptionApiData> & {
  status?: number;
  payment_url?: string | null;
  redirect_url?: string | null;
};

/** Client-facing create-subscription result. */
export interface PopSubscriptionResult {
  id?: string;
  paymentUrl?: string;
  raw: PopSubscriptionApiData | CreatePopSubscriptionEnvelope;
}

/** Input for creating a POP subscription from the personal-details form. */
export interface CreatePopSubscriptionInput {
  amount: number;
  details: PopSubscriptionPersonalDetails;
  callbackUrl: string;
}

/**
 * Maps enrollment method to the API `source` value.
 *
 * @param method - Online or at-store enrollment.
 * @returns Source string accepted by the subscriptions API.
 */
export function toPopSubscriptionSource(method: PopEnrollmentMethod): string {
  return method === 'at_store' ? 'store' : 'online';
}

/**
 * Maps the autopay checkbox to the API `payment_type`.
 *
 * @param autopay - Whether automatic billing is enabled.
 * @returns `automatic` or `manual`.
 */
export function toPopPaymentType(autopay: boolean): PopPaymentType {
  return autopay ? 'automatic' : 'manual';
}

/**
 * Builds the create-subscription request body from form values.
 *
 * @param input - Monthly amount, form details, and callback URL.
 * @returns Snake-case payload for POST /api/v2/pop/subscriptions.
 */
export function toCreatePopSubscriptionRequest(
  input: CreatePopSubscriptionInput,
): CreatePopSubscriptionRequest {
  const { amount, details, callbackUrl } = input;

  return {
    amount,
    source: toPopSubscriptionSource(details.enrollmentMethod),
    payment_type: toPopPaymentType(details.autopay),
    callback_url: callbackUrl,
    custom_data: {
      name: details.name,
      phone: details.phone,
      email: details.email,
      address_line_1: details.addressLine1,
      address_line_2: details.addressLine2 || null,
      city: details.city,
      pincode: details.pincode,
      enrollment_method: details.enrollmentMethod,
      store_id: details.storeId || null,
      autopay: details.autopay,
    },
  };
}

/**
 * Normalises create-subscription API response into a client result.
 *
 * @param raw - Envelope or bare data from the API.
 * @returns Payment URL (if any) and optional subscription id.
 */
export function transformCreatePopSubscriptionResponse(
  raw: CreatePopSubscriptionEnvelope | PopSubscriptionApiData,
): PopSubscriptionResult {
  let data: PopSubscriptionApiData = {};

  if ('data' in raw && raw.data != null && typeof raw.data === 'object') {
    data = raw.data as PopSubscriptionApiData;
  } else if (!('data' in raw)) {
    data = raw;
  }

  const topLevelPaymentUrl =
    'payment_url' in raw && typeof raw.payment_url === 'string' ? raw.payment_url : undefined;
  const topLevelRedirectUrl =
    'redirect_url' in raw && typeof raw.redirect_url === 'string' ? raw.redirect_url : undefined;

  const paymentUrl =
    (typeof data.payment_url === 'string' ? data.payment_url : undefined) ??
    (typeof data.redirect_url === 'string' ? data.redirect_url : undefined) ??
    (typeof data.checkout_url === 'string' ? data.checkout_url : undefined) ??
    (typeof data.short_url === 'string' ? data.short_url : undefined) ??
    topLevelPaymentUrl ??
    topLevelRedirectUrl;

  return {
    id: data.id != null ? String(data.id) : undefined,
    paymentUrl,
    raw,
  };
}
