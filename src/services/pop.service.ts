/** Client-only — creates POP subscriptions via @/lib/api. Used by POP hooks. */
import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import {
  unwrapPopSubscriptionDetailPayload,
  unwrapPopSubscriptionListPayload,
} from '@/lib/pop/unwrap-pop-api';
import {
  transformCreatePopSubscription,
  transformPopSubscriptionDetail as transformAccountPopSubscriptionDetail,
  transformPopSubscriptionsList,
  unwrapPopEnvelope,
} from '@/types/pop';
import type {
  CreatePopSubscriptionApi,
  CreatePopSubscriptionInput as AccountCreatePopSubscriptionInput,
  CreatePopSubscriptionResult,
  PopApiEnvelope,
  PopSubscriptionDetail as AccountPopSubscriptionDetail,
  PopSubscriptionTrackApi,
  PopSubscriptionTrackQuery,
  PopSubscriptionsListApi,
  PopSubscriptionsPage,
  PopSubscriptionsQuery,
} from '@/types/pop';
import {
  toCreatePopSubscriptionRequest,
  transformCreatePopSubscriptionResponse,
  type CreatePopSubscriptionEnvelope,
  type CreatePopSubscriptionInput,
  type PopSubscriptionResult,
} from '@/types/pop/subscription';
import {
  transformPopSubscriptionDetail,
  type PopPlanDetailResult,
  type PopSubscriptionDetailApiResponse,
  type PopSubscriptionDetailParams,
} from '@/types/pop/subscription-detail';
import {
  transformPopSubscriptionList,
  type PopPlanListResult,
  type PopSubscriptionListApiResponse,
  type PopSubscriptionListParams,
} from '@/types/pop/subscription-list';

interface BackendEnvelope<T> {
  data?: T;
  status?: number;
  message?: string;
  success?: boolean;
}

/**
 * Fetches the authenticated user's POP subscriptions.
 *
 * @param params - Pagination (`limit`, `offset`).
 * @returns Normalised plan list for the my-plans UI.
 * @throws Normalised app error when the API request fails.
 */
export async function listPopSubscriptions(
  params: PopSubscriptionListParams = {},
): Promise<PopPlanListResult> {
  try {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const { data } = await api.get<
      BackendEnvelope<PopSubscriptionListApiResponse> | PopSubscriptionListApiResponse
    >(ENDPOINTS.pop.subscriptions, { params: { limit, offset } });
    return transformPopSubscriptionList(unwrapPopSubscriptionListPayload(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Fetches instalment timeline for a single POP subscription.
 *
 * @param subscriptionId - POP subscription id.
 * @param params - Pagination (`count`, `skip`).
 * @returns Normalised instalment timeline for the details page.
 * @throws Normalised app error when the API request fails.
 */
export async function getPopSubscriptionDetail(
  subscriptionId: string,
  params: PopSubscriptionDetailParams = {},
): Promise<PopPlanDetailResult> {
  try {
    const count = params.count ?? 6;
    const skip = params.skip ?? 0;
    const { data } = await api.get<
      BackendEnvelope<PopSubscriptionDetailApiResponse> | PopSubscriptionDetailApiResponse
    >(ENDPOINTS.pop.subscriptionDetail(subscriptionId), {
      params: { count, skip },
    });
    return transformPopSubscriptionDetail(unwrapPopSubscriptionDetailPayload(data), subscriptionId);
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Creates a POP subscription for the authenticated user.
 *
 * @param input - Monthly amount, personal details, and payment callback URL.
 * @returns Normalised subscription result (optional payment redirect URL).
 * @throws Normalised app error when the API request fails.
 */
export async function createPopSubscription(
  input: CreatePopSubscriptionInput,
): Promise<PopSubscriptionResult> {
  try {
    const body = toCreatePopSubscriptionRequest(input);
    const { data } = await api.post<CreatePopSubscriptionEnvelope>(
      ENDPOINTS.pop.subscriptions,
      body,
    );
    return transformCreatePopSubscriptionResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

function toSubscriptionsQueryParams(query: PopSubscriptionsQuery = {}): Record<string, number> {
  return {
    ...(query.limit !== undefined && { limit: query.limit }),
    ...(query.offset !== undefined && { offset: query.offset }),
  };
}

function toTrackQueryParams(query: PopSubscriptionTrackQuery = {}): Record<string, number> {
  return {
    ...(query.count !== undefined && { count: query.count }),
    ...(query.skip !== undefined && { skip: query.skip }),
  };
}

/**
 * Fetches POP subscriptions for the account plan-of-purchase section.
 *
 * @param query - Pagination (`limit`, `offset`).
 * @returns Normalised subscription list for account UI.
 * @throws Normalised app error when the API request fails.
 */
export async function getPopSubscriptions(
  query: PopSubscriptionsQuery = { limit: 50, offset: 0 },
): Promise<PopSubscriptionsPage> {
  try {
    const { data } = await api.get<PopApiEnvelope<PopSubscriptionsListApi>>(
      ENDPOINTS.pop.subscriptions,
      {
        params: toSubscriptionsQueryParams(query),
      },
    );
    return transformPopSubscriptionsList(unwrapPopEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Fetches POP subscription detail for the account plan-of-purchase section.
 *
 * @param subscriptionId - POP subscription id.
 * @param query - Pagination (`count`, `skip`).
 * @returns Normalised subscription detail for account UI.
 * @throws Normalised app error when the API request fails.
 */
export async function getPopSubscriptionById(
  subscriptionId: string,
  query: PopSubscriptionTrackQuery = { count: 50, skip: 0 },
): Promise<AccountPopSubscriptionDetail> {
  try {
    const { data } = await api.get<PopApiEnvelope<PopSubscriptionTrackApi>>(
      ENDPOINTS.pop.subscriptionDetail(subscriptionId),
      {
        params: toTrackQueryParams(query),
      },
    );
    return transformAccountPopSubscriptionDetail(unwrapPopEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Creates a POP subscription from the account plan-of-purchase flow.
 *
 * @param input - Monthly amount in rupees.
 * @returns Normalised subscription result with payment redirect URL.
 * @throws Normalised app error when the API request fails.
 */
export async function createPopSubscriptionFromAccount(
  input: AccountCreatePopSubscriptionInput,
): Promise<CreatePopSubscriptionResult> {
  try {
    const { data } = await api.post<PopApiEnvelope<CreatePopSubscriptionApi>>(
      ENDPOINTS.pop.subscriptions,
      { amount: input.amount },
    );
    return transformCreatePopSubscription(unwrapPopEnvelope(data));
  } catch (err) {
    throw normaliseError(err);
  }
}
