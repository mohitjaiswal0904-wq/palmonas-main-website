import type { PopSubscriptionDetailApiResponse } from '@/types/pop/subscription-detail';
import type {
  PopSubscriptionListApiResponse,
  PopSubscriptionListPage,
} from '@/types/pop/subscription-list';

interface BackendEnvelope<T> {
  data?: T;
  status?: number;
  message?: string;
  success?: boolean;
}

/**
 * Unwraps GET /api/v2/pop/subscriptions body into the paginated list payload.
 *
 * @param payload - Axios response body.
 * @returns Paginated subscriptions object with `items`.
 */
export function unwrapPopSubscriptionListPayload(payload: unknown): PopSubscriptionListApiResponse {
  if (!payload || typeof payload !== 'object') return {};

  const envelope = payload as BackendEnvelope<PopSubscriptionListPage>;
  if (envelope.data && typeof envelope.data === 'object' && !Array.isArray(envelope.data)) {
    return envelope.data as PopSubscriptionListApiResponse;
  }

  return payload as PopSubscriptionListApiResponse;
}

/**
 * Unwraps GET /api/v2/pop/subscriptions/{id} body into the detail payload.
 *
 * @param payload - Axios response body.
 * @returns Subscription detail object with instalment rows.
 */
export function unwrapPopSubscriptionDetailPayload(
  payload: unknown,
): PopSubscriptionDetailApiResponse {
  if (!payload || typeof payload !== 'object') return {};

  const envelope = payload as BackendEnvelope<PopSubscriptionDetailApiResponse>;
  if (envelope.data && typeof envelope.data === 'object') {
    return envelope.data as PopSubscriptionDetailApiResponse;
  }

  return payload as PopSubscriptionDetailApiResponse;
}
