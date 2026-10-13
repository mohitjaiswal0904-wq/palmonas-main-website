'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { canonicalizeAppHref } from '@/lib/navigation/canonical-app-path';
import { shouldSkipNavigationOverlay } from '@/lib/navigation/static-app-routes';
import { useNavigationPending } from '@/providers/navigation/NavigationPendingProvider';

interface AppNavigateOptions {
  scroll?: boolean;
}

/**
 * Imperative soft navigation that shows the destination skeleton overlay.
 *
 * @returns `navigate` helper wrapping `startNavigation` + `router.push`.
 */
export function useAppNavigate() {
  const router = useRouter();
  const { startNavigation } = useNavigationPending();

  /**
   * Push a path and mark navigation pending for the destination skeleton.
   *
   * @param href - Internal href.
   * @param options - Next router options (`scroll`).
   */
  const navigate = useCallback(
    (href: string, options?: AppNavigateOptions) => {
      const canonicalHref = canonicalizeAppHref(href);
      if (!shouldSkipNavigationOverlay(canonicalHref)) {
        startNavigation(canonicalHref);
      }
      router.push(canonicalHref, options);
    },
    [router, startNavigation],
  );

  return { navigate };
}
