'use client';

import Link, { type LinkProps } from 'next/link';
import { useRouter } from 'next/navigation';
import { forwardRef, type AnchorHTMLAttributes, type MouseEvent, type ReactNode } from 'react';

import { canonicalizeAppHref } from '@/lib/navigation/canonical-app-path';
import { isModifiedClick } from '@/lib/navigation/is-modified-click';
import { normalizeHref } from '@/lib/navigation/normalize-href';
import {
  shouldPrefetchAppRoute,
  shouldSkipNavigationOverlay,
} from '@/lib/navigation/static-app-routes';
import { useNavigationPending } from '@/providers/navigation/NavigationPendingProvider';

type AppLinkProps = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    children?: ReactNode;
  };

/**
 * App Router link with prefetch off by default and soft-navigation pending overlay.
 * Viewport Link prefetch fetches full RSC payloads and slows navigations when many links are visible.
 * Pass `prefetch` to re-enable for critical destinations (home, cart).
 */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(function AppLink(
  { href, onClick, onPointerDown, target, prefetch = false, children, ...rest },
  ref,
) {
  const router = useRouter();
  const { startNavigation } = useNavigationPending();
  const hrefString = typeof href === 'string' ? href : (href.pathname ?? '') + (href.search ?? '');
  const canonicalHref = canonicalizeAppHref(hrefString);
  const resolvedPrefetch =
    prefetch === false ? false : prefetch === true ? true : shouldPrefetchAppRoute(canonicalHref);

  /** Prefetch this destination on press so swipe-back → next tap is not a cold RSC fetch. */
  const prefetchOnPress = () => {
    try {
      void router.prefetch(canonicalHref);
    } catch {
      // Prefetch is best-effort; navigation still proceeds on click.
    }
  };

  /**
   * Start pending overlay for unmodified same-origin soft navigations.
   *
   * @param event - Anchor click event.
   */
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) {
      return;
    }
    if (target === '_blank' || isModifiedClick(event)) {
      return;
    }
    if (!normalizeHref(canonicalHref)) {
      return;
    }
    if (!shouldSkipNavigationOverlay(canonicalHref)) {
      startNavigation(canonicalHref);
    }
  };

  return (
    <Link
      ref={ref}
      href={canonicalHref}
      target={target}
      prefetch={resolvedPrefetch}
      onPointerDown={(event) => {
        onPointerDown?.(event);
        prefetchOnPress();
      }}
      onClick={handleClick}
      {...rest}
    >
      {children}
    </Link>
  );
});
