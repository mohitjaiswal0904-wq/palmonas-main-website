'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import { captureLandingUtmParams } from '@/lib/cart/checkout-utm-storage';

/**
 * Persists landing-page UTM query params to localStorage on every route load.
 */
export function LandingUtmCapture() {
  const searchParams = useSearchParams();

  // Capture last-touch UTMs whenever the URL includes utm_* query keys.
  useEffect(() => {
    captureLandingUtmParams(searchParams);
  }, [searchParams]);

  return null;
}
