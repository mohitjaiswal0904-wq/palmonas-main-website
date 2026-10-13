'use client';

import Script from 'next/script';
import { useCallback, useEffect } from 'react';

import {
  applyCheckoutMerchantInfo,
  applyCheckoutUtmToMerchantInfo,
  getGokwikCheckoutScriptUrl,
  GOKWIK_CHECKOUT_SCRIPT_ID,
  waitForGokwikCheckoutSdk,
} from '@/infrastructure/gokwik/checkout';

interface GokwikCheckoutProps {
  onLoaded?: () => void;
  onLoadFailed?: (reason: string) => void;
}

/**
 * Loads GoKwik merchant integration script for custom storefront checkout.
 * Mount once at app root when checkout is enabled.
 */
export function GokwikCheckout({ onLoaded, onLoadFailed }: GokwikCheckoutProps) {
  useEffect(() => {
    applyCheckoutMerchantInfo();
    applyCheckoutUtmToMerchantInfo();
  }, []);

  const onIntegrationReady = useCallback((): void => {
    void waitForGokwikCheckoutSdk(20_000).then((ready) => {
      if (ready) {
        onLoaded?.();
        return;
      }
      onLoadFailed?.('sdk_timeout');
    });
  }, [onLoaded, onLoadFailed]);

  return (
    <Script
      id={GOKWIK_CHECKOUT_SCRIPT_ID}
      src={getGokwikCheckoutScriptUrl()}
      strategy="afterInteractive"
      onReady={onIntegrationReady}
      onError={() => onLoadFailed?.('integration_script')}
    />
  );
}
