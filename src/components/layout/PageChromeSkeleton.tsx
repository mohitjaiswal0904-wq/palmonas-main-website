import type { ReactNode } from 'react';

interface PageChromeSkeletonProps {
  main?: ReactNode;
  mainAriaLabel?: string;
  /** Mirror the route's `StreamingPageShell` footer setting so the placeholder matches. */
  showFooter?: boolean;
}

/** Pulse placeholder for the site header while SSR header data resolves. */
export function HeaderSkeleton() {
  return (
    <header
      className="border-b border-stone-100 bg-white"
      aria-busy="true"
      aria-label="Loading site header"
    >
      <div className="laptop:h-16 h-24 animate-pulse bg-stone-100" />
    </header>
  );
}

/** Pulse placeholder for the site footer. */
export function FooterSkeleton() {
  return <footer aria-hidden="true" className="h-40 animate-pulse bg-stone-100" />;
}

/**
 * Generic main-content pulse used when a route has no domain skeleton.
 * @param ariaLabel - Accessible busy label for the main region
 */
export function MainContentSkeleton({
  ariaLabel = 'Loading page content',
}: {
  ariaLabel?: string;
}) {
  return (
    <main aria-busy="true" aria-label={ariaLabel} className="flex-1 px-4 py-8">
      <div className="mx-auto h-96 max-w-6xl animate-pulse rounded-lg bg-stone-100" />
    </main>
  );
}

/**
 * Placeholder chrome shown while a route's async server content streams in.
 */
export function PageChromeSkeleton({
  main,
  mainAriaLabel = 'Loading page content',
  showFooter = true,
}: PageChromeSkeletonProps) {
  return (
    <>
      <HeaderSkeleton />
      {main ?? <MainContentSkeleton ariaLabel={mainAriaLabel} />}
      {showFooter ? <FooterSkeleton /> : null}
    </>
  );
}
