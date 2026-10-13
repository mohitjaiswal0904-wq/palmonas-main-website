import type { ReactNode } from 'react';

import { CartRouteChromeGate } from '@/components/layout/CartRouteChromeGate';
import { Header } from '@/components/layout/Header';
import { HeaderSkeleton } from '@/components/layout/PageChromeSkeleton';
import { StableChromeSuspense } from '@/components/layout/StableChromeSuspense';

/**
 * Persists site header across `/cart` and `/cart/*` so subpages skip a header refetch.
 */
export default function CartLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StableChromeSuspense fallback={<HeaderSkeleton />}>
        <CartRouteChromeGate>
          <Header />
        </CartRouteChromeGate>
      </StableChromeSuspense>
      {children}
    </>
  );
}
