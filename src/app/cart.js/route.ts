import { NextResponse } from 'next/server';

import { cartMessages } from '@/config/cart/cart.config';
import { isAppError } from '@/lib/errors';
import { getShopifyAjaxCart } from '@/services/server/shopify-ajax-cart.service.server';

/**
 * Shopify Ajax cart read — GoKwik GETs `/cart.js` after `/cart/update.js`.
 */
export async function GET(): Promise<NextResponse> {
  try {
    return NextResponse.json(await getShopifyAjaxCart());
  } catch (err) {
    const status = isAppError(err) && err.statusCode ? err.statusCode : 400;
    const message = err instanceof Error ? err.message : cartMessages.errors.updateQuantity;
    return NextResponse.json({ status, message, description: message }, { status });
  }
}
