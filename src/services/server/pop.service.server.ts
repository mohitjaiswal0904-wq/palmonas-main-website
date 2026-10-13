import 'server-only';

import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import {
  unwrapPopSubscriptionDetailPayload,
  unwrapPopSubscriptionListPayload,
} from '@/lib/pop/unwrap-pop-api';
import { createServerApi } from '@/lib/server-api';
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
}

/**
 * Fetches the authenticated user's POP subscriptions on the server.
 *
 * @param params - Pagination (`limit`, `offset`).
 * @returns Normalised plan list for the my-plans UI.
 * @throws Normalised app error when the API request fails.
 */
export async function listPopSubscriptionsServer(
  params: PopSubscriptionListParams = {},
): Promise<PopPlanListResult> {
  try {
    const limit = params.limit ?? 50;
    const offset = params.offset ?? 0;
    const client = await createServerApi();
    const { data } = await client.get<
      BackendEnvelope<PopSubscriptionListApiResponse> | PopSubscriptionListApiResponse
    >(ENDPOINTS.pop.subscriptions, { params: { limit, offset } });
    return transformPopSubscriptionList(unwrapPopSubscriptionListPayload(data));
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Fetches instalment timeline for a single POP subscription on the server.
 *
 * @param subscriptionId - Razorpay subscription id from the route.
 * @param params - Pagination (`count`, `skip`).
 * @returns Normalised instalment timeline for the details page.
 * @throws Normalised app error when the API request fails.
 */
export async function getPopSubscriptionDetailServer(
  subscriptionId: string,
  params: PopSubscriptionDetailParams = {},
): Promise<PopPlanDetailResult> {
  try {
    const count = params.count ?? 6;
    const skip = params.skip ?? 0;
    const client = await createServerApi();
    const { data } = await client.get<
      BackendEnvelope<PopSubscriptionDetailApiResponse> | PopSubscriptionDetailApiResponse
    >(ENDPOINTS.pop.subscriptionDetail(subscriptionId), {
      params: { count, skip },
    });
    return transformPopSubscriptionDetail(unwrapPopSubscriptionDetailPayload(data), subscriptionId);
  } catch (err) {
    throw normaliseError(err);
  }
}
