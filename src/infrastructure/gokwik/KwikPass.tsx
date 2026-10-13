'use client';

import Script from 'next/script';
import { useCallback, useEffect, useState } from 'react';

import {
  getKwikpassCoreScriptUrl,
  getKwikpassMerchantScriptUrl,
  KWIKPASS_CORE_SCRIPT_ID,
  KWIKPASS_INIT_SCRIPT_ID,
  KWIKPASS_MERCHANT_SCRIPT_ID,
  waitForKwikpassSdk,
} from '@/infrastructure/gokwik/identity';
import { getKwikpassMerchantInfoInlineScript } from '@/infrastructure/gokwik/merchant-info';

interface KwikPassScriptProps {
  onLoaded: () => void;
  onLoadFailed?: (reason: string) => void;
}

export function KwikPassScript({ onLoaded, onLoadFailed }: KwikPassScriptProps) {
  const onReady = useCallback((): void => {
    if (typeof window.kpUpdateDOM === 'function') window.kpUpdateDOM();
    onLoaded();
  }, [onLoaded]);

  return (
    <>
      <Script
        id={KWIKPASS_INIT_SCRIPT_ID}
        strategy="lazyOnload"
        onError={() => onLoadFailed?.('merchant_info')}
      >
        {getKwikpassMerchantInfoInlineScript()}
      </Script>
      <Script
        id={KWIKPASS_CORE_SCRIPT_ID}
        src={getKwikpassCoreScriptUrl()}
        strategy="afterInteractive"
        onError={() => onLoadFailed?.('core_script')}
      />
      <Script
        id={KWIKPASS_MERCHANT_SCRIPT_ID}
        src={getKwikpassMerchantScriptUrl()}
        strategy="afterInteractive"
        onReady={onReady}
        onError={() => onLoadFailed?.('merchant_script')}
      />
    </>
  );
}

interface KwikPassProps {
  onLoaded?: () => void;
  onSdkReady?: () => void;
  onLoadFailed?: (reason: string) => void;
}

export function KwikPass({ onLoaded, onSdkReady, onLoadFailed }: KwikPassProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const handleScriptsLoaded = useCallback(() => {
    setScriptLoaded(true);
    onLoaded?.();

    void waitForKwikpassSdk(15_000).then((ready) => {
      if (ready) {
        onSdkReady?.();
        return;
      }
      onLoadFailed?.('sdk_timeout');
    });
  }, [onLoaded, onLoadFailed, onSdkReady]);

  useEffect(() => {
    if (!scriptLoaded || typeof window === 'undefined') return;

    if (typeof window.handleDOMUpdate === 'function') window.handleDOMUpdate();
    const onUpdate = (): void => {
      window.handleDOMUpdate?.();
    };
    window.addEventListener('update-dom', onUpdate);
    return () => window.removeEventListener('update-dom', onUpdate);
  }, [scriptLoaded]);

  return <KwikPassScript onLoaded={handleScriptsLoaded} onLoadFailed={onLoadFailed} />;
}
