import { NextResponse } from 'next/server';

import { cartMessages } from '@/config/cart/cart.config';
import {
  parseShopifyAjaxAttributes,
  parseShopifyAjaxUpdatesForm,
  parseShopifyAjaxUpdatesJson,
} from '@/lib/cart/shopify-ajax-update';
import { isAppError } from '@/lib/errors';
import { applyShopifyAjaxCartUpdates } from '@/services/server/shopify-ajax-cart.service.server';

/**
 * Shopify Ajax cart update — third-party scripts POST `/cart/update.js`.
 *
 * @param request - JSON `{ updates: { [key]: qty } }` or form `updates[key]=qty`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { updates, attributes } = await readUpdatePayload(request);
    const cart = await applyShopifyAjaxCartUpdates(updates, { attributes });
    return NextResponse.json(cart);
  } catch (err) {
    const status = isAppError(err) && err.statusCode ? err.statusCode : 400;
    const message = err instanceof Error ? err.message : cartMessages.errors.updateQuantity;
    return NextResponse.json({ status, message, description: message }, { status });
  }
}

/**
 * Reads a Shopify Ajax updates map from JSON or form body.
 *
 * @param request - Incoming POST.
 * @returns Quantity by line key.
 */
async function readUpdatePayload(
  request: Request,
): Promise<{ updates: Record<string, number>; attributes: Record<string, unknown> }> {
  const contentType = request.headers.get('content-type') ?? '';
  if (
    contentType.includes('application/x-www-form-urlencoded') ||
    contentType.includes('multipart/form-data')
  ) {
    return { updates: parseShopifyAjaxUpdatesForm(await request.formData()), attributes: {} };
  }

  try {
    const body: unknown = await request.json();
    return {
      updates: parseShopifyAjaxUpdatesJson(body),
      attributes: parseShopifyAjaxAttributes(body),
    };
  } catch {
    throw new Error('Invalid cart update payload');
  }
}
