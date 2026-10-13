import type { ReactNode } from 'react';

import { CartRouteChromeGate } from '@/components/layout/CartRouteChromeGate';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import {
  FooterSkeleton,
  HeaderSkeleton,
  MainContentSkeleton,
} from '@/components/layout/PageChromeSkeleton';
import { StableChromeSuspense } from '@/components/layout/StableChromeSuspense';
import { StableMainSuspense } from '@/components/layout/StableMainSuspense';

interface StreamingPageShellProps {
  children: ReactNode;
  /** Fallback shown while `children` (async RSC) resolves. */
  mainFallback?: ReactNode;
  /** Set false on routes that should not render the site footer (cart, wishlist, search, account). */
  showFooter?: boolean;
}

/**
 * Streams header, main, and footer independently via Suspense.
 * Header/footer no longer wait on page data; page data no longer blocks chrome.
 */
export function StreamingPageShell({
  children,
  mainFallback,
  showFooter = true,
}: StreamingPageShellProps) {
  return (
    <>
      <StableChromeSuspense fallback={<HeaderSkeleton />}>
        <CartRouteChromeGate>
          <Header />
        </CartRouteChromeGate>
      </StableChromeSuspense>
      <StableMainSuspense fallback={mainFallback ?? <MainContentSkeleton />}>
        {children}
      </StableMainSuspense>
      {showFooter ? (
        <StableChromeSuspense fallback={<FooterSkeleton />}>
          <Footer />
        </StableChromeSuspense>
      ) : null}
    </>
  );
}
