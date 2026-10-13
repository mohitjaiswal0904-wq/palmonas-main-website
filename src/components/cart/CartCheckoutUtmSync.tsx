'use client';

import { useEffect } from 'react';

import { getCartCheckoutUtmParams } from '@/config/cart/cart.config';
import {
  applyUtmParamsToPageUrl,
  persistCheckoutUtmCookies,
} from '@/lib/cart/checkout-utm-storage';

/**
 * Applies stored landing UTMs to the cart page URL query string for GoKwik checkout.
 */
export function CartCheckoutUtmSync() {
  // GoKwik reads UTMs from window.location.search — sync on cart mount.
  useEffect(() => {
    const utmParams = getCartCheckoutUtmParams();
    applyUtmParamsToPageUrl(utmParams);
    persistCheckoutUtmCookies(utmParams);
  }, []);

  return null;
}
