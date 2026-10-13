import 'server-only';

import { resolveShopifyAjaxLineMutations, toShopifyAjaxCart } from '@/lib/cart/shopify-ajax-update';
import { ENDPOINTS } from '@/lib/endpoints';
import { normaliseError } from '@/lib/errors';
import { createServerApi } from '@/lib/server-api';
import type { ShopifyCart } from '@/types/cart';

interface BackendEnvelope<T> {
  status?: number;
  message?: string;
  data: T;
}

/**
 * Applies a Shopify Ajax `/cart/update.js` quantity map via the Palmonas v2 cart API.
 *
 * @param updates - Quantity by variant id or classic line key.
 * @returns Shopify Ajax cart JSON.
 * @throws Normalised app error when the backend request fails.
 */
export async function applyShopifyAjaxCartUpdates(
  updates: Record<string, number>,
  options?: { attributes?: Record<string, unknown> },
): Promise<Record<string, unknown>> {
  try {
    const current = await fetchCurrentShopifyCart();
    const mutations = resolveShopifyAjaxLineMutations(current.lines, updates);

    let cart = current;
    if (mutations.removes.length > 0) {
      cart = await removeShopifyCartLines(mutations.removes);
    }
    if (mutations.updates.length > 0) {
      cart = await updateShopifyCartLines(mutations.updates);
    }

    return toShopifyAjaxCart(cart, {
      previous: current,
      requestKeys: Object.keys(updates),
      attributes: options?.attributes,
    });
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Loads the current session cart as Shopify Ajax `/cart.js` JSON.
 *
 * @returns Shopify Ajax cart payload.
 * @throws Normalised app error when the backend request fails.
 */
export async function getShopifyAjaxCart(): Promise<Record<string, unknown>> {
  try {
    return toShopifyAjaxCart(await fetchCurrentShopifyCart());
  } catch (err) {
    throw normaliseError(err);
  }
}

/**
 * Loads the session cart from v2 GET `/cart/current`.
 *
 * @returns Shopify cart from the backend.
 */
async function fetchCurrentShopifyCart(): Promise<ShopifyCart> {
  const api = await createServerApi();
  const { data } = await api.get<BackendEnvelope<ShopifyCart>>(ENDPOINTS.cart.current, {
    params: { cart_type: 'long_term' },
  });
  return unwrapData(data);
}

/**
 * Updates line quantities and waits for Shopify to persist.
 *
 * @param lines - Line ids and quantities.
 */
async function updateShopifyCartLines(
  lines: Array<{ id: string; quantity: number }>,
): Promise<ShopifyCart> {
  const api = await createServerApi();
  const { data } = await api.put<BackendEnvelope<ShopifyCart>>(ENDPOINTS.cart.update, lines, {
    params: { wait_for_shopify: true },
  });
  return unwrapData(data);
}

/**
 * Removes cart lines by id.
 *
 * @param lineIds - Line ids to delete.
 */
async function removeShopifyCartLines(lineIds: string[]): Promise<ShopifyCart> {
  const api = await createServerApi();
  const { data } = await api.delete<BackendEnvelope<ShopifyCart>>(ENDPOINTS.cart.remove, {
    data: lineIds,
  });
  return unwrapData(data);
}

/**
 * Unwraps a `{ data }` envelope or returns the payload as-is.
 *
 * @param payload - Axios response body.
 */
function unwrapData<T>(payload: unknown): T {
  if (payload && typeof payload === 'object' && 'data' in payload) {
    const envelope = payload as BackendEnvelope<T>;
    if (envelope.data !== undefined) {
      return envelope.data;
    }
  }
  return payload as T;
}
