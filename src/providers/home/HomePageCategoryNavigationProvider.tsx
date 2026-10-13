'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from 'react';

import {
  HOME_PAGE_CATEGORY_QUERY_PARAM,
  homePageCategories,
  type HomePageCategoryId,
} from '@/config/home-page-categories.config';
import { buildHomePageCategoryHref, resolveHomePageCategory } from '@/lib/utils/home-page-category';
import { useNavigationPending } from '@/providers/navigation/NavigationPendingProvider';

interface HomePageCategoryNavigationContextValue {
  /** Category shown in tabs (optimistic while a switch is in flight). */
  activeCategory: HomePageCategoryId;
  handleSelect: (categoryId: HomePageCategoryId) => void;
  /** Warm the App Router RSC cache for a category href (hover / idle). */
  prefetchCategory: (categoryId: HomePageCategoryId) => void;
  isPending: boolean;
}

const HomePageCategoryNavigationContext =
  createContext<HomePageCategoryNavigationContextValue | null>(null);

/**
 * Shared home category navigation for desktop tabs + mobile bottom nav.
 * On `/`, pending drives body skeleton under tabs (no full-page overlay).
 * Prefetches inactive category routes on idle + hover so switches resolve faster.
 */
export function HomePageCategoryNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startNavigation } = useNavigationPending();
  const [isPending, startTransition] = useTransition();
  const [optimisticCategory, setOptimisticCategory] = useState<HomePageCategoryId | null>(null);

  const categoryParam = searchParams.get(HOME_PAGE_CATEGORY_QUERY_PARAM) ?? undefined;
  const urlCategory = resolveHomePageCategory(categoryParam);

  // Derive active category - if optimistic matches URL, it's no longer optimistic
  const activeCategory = useMemo(() => {
    // If optimistic state matches current URL, we can clear it
    if (optimisticCategory !== null && urlCategory === optimisticCategory) {
      return urlCategory; // Return URL category and clear optimistic below
    }
    return optimisticCategory ?? urlCategory;
  }, [optimisticCategory, urlCategory]);

  // Clear optimistic when it matches URL (derived state pattern)
  if (optimisticCategory !== null && urlCategory === optimisticCategory) {
    setOptimisticCategory(null);
  }

  const prefetchCategory = useCallback(
    (categoryId: HomePageCategoryId) => {
      if (pathname === '/' && categoryId === urlCategory) {
        return;
      }

      try {
        router.prefetch(buildHomePageCategoryHref(categoryId));
      } catch {
        // Prefetch is best-effort; navigation still works without it.
      }
    },
    [pathname, router, urlCategory],
  );

  // Warm inactive home category RSC payloads after first paint (few tabs only).
  useEffect(() => {
    const inactiveIds = homePageCategories
      .map((category) => category.id)
      .filter((categoryId) => categoryId !== urlCategory);

    const prefetchInactive = () => {
      for (const categoryId of inactiveIds) {
        prefetchCategory(categoryId);
      }
    };

    if (typeof window.requestIdleCallback === 'function') {
      const idleId = window.requestIdleCallback(prefetchInactive, { timeout: 2_000 });
      return () => {
        window.cancelIdleCallback(idleId);
      };
    }

    const timeoutId = window.setTimeout(prefetchInactive, 200);
    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [prefetchCategory, urlCategory]);

  const handleSelect = useCallback(
    (categoryId: HomePageCategoryId) => {
      // Off-home, missing `?category=` still resolves to silver — do not treat that as "already Home" (PW-720).
      if (pathname === '/' && categoryId === urlCategory && optimisticCategory === null) {
        return;
      }

      const href = buildHomePageCategoryHref(categoryId);
      setOptimisticCategory(categoryId);
      prefetchCategory(categoryId);

      // Switching category only changes `?category=`, so the pathname-keyed RouteScrollReset
      // stays out of it — reset here instead (PW-464).
      window.scrollTo({ top: 0, behavior: 'auto' });

      if (pathname === '/') {
        startTransition(() => {
          router.push(href, { scroll: true });
        });
        return;
      }

      // Off-home (mobile bottom nav): destination overlay until `/` mounts.
      startNavigation(href);
      startTransition(() => {
        router.push(href, { scroll: true });
      });
    },
    [optimisticCategory, pathname, prefetchCategory, router, startNavigation, urlCategory],
  );

  const value = useMemo(
    () => ({ activeCategory, handleSelect, prefetchCategory, isPending }),
    [activeCategory, handleSelect, prefetchCategory, isPending],
  );

  return (
    <HomePageCategoryNavigationContext.Provider value={value}>
      {children}
    </HomePageCategoryNavigationContext.Provider>
  );
}

/**
 * Access shared home category navigation.
 *
 * @param _serverActiveCategory - Reserved for call-site SSR sync; URL / optimistic state wins.
 * @returns Active category, select handler, prefetch helper, and pending state.
 * @throws If used outside {@link HomePageCategoryNavigationProvider}.
 */
export function useHomePageCategoryNavigation(
  _serverActiveCategory?: HomePageCategoryId,
): HomePageCategoryNavigationContextValue {
  const context = useContext(HomePageCategoryNavigationContext);
  if (!context) {
    throw new Error(
      'useHomePageCategoryNavigation must be used within HomePageCategoryNavigationProvider',
    );
  }
  return context;
}
