import { Suspense, type ReactNode } from 'react';

import { CmsShellFooter, CmsShellHeader } from '@/components/cms/CmsPageChrome';
import {
  FooterSkeleton,
  HeaderSkeleton,
  MainContentSkeleton,
} from '@/components/layout/PageChromeSkeleton';
import type { CmsPageShellResponse } from '@/types/cms-page';

interface StreamingCmsPageShellProps {
  shell: CmsPageShellResponse;
  children: ReactNode;
  /** Fallback shown while `children` (async RSC) resolves. */
  mainFallback?: ReactNode;
}

/**
 * Streams CMS shell header, main, and footer independently via Suspense.
 * Chrome prefers `shell.layouts` and falls back to slot defaults.
 */
export function StreamingCmsPageShell({
  shell,
  children,
  mainFallback,
}: StreamingCmsPageShellProps) {
  return (
    <>
      <Suspense fallback={<HeaderSkeleton />}>
        <CmsShellHeader shell={shell} />
      </Suspense>
      <Suspense fallback={mainFallback ?? <MainContentSkeleton />}>{children}</Suspense>
      <Suspense fallback={<FooterSkeleton />}>
        <CmsShellFooter shell={shell} />
      </Suspense>
    </>
  );
}
