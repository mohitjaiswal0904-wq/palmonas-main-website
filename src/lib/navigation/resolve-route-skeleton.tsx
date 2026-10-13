import type { ReactElement } from 'react';

import { AboutPageSkeleton } from '@/components/about/AboutPageSkeleton';
import { CartPageSkeleton } from '@/components/cart/CartPageSkeleton';
import { CartOffersPageSkeleton } from '@/components/cart/offers/CartOffersPageSkeleton';
import { CollectionPageSkeleton } from '@/components/collection/CollectionPageSkeleton';
import { DiwaliPageSkeleton } from '@/components/diwali/DiwaliPageSkeleton';
import { EmilyInParisPageSkeleton } from '@/components/emily-in-paris/EmilyInParisPageSkeleton';
import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';
import { PageChromeSkeleton } from '@/components/layout/PageChromeSkeleton';
import { PopMyPlanSkeleton } from '@/components/pop/PopMyPlanSkeleton';
import { ProductPageSkeleton } from '@/components/product/ProductPageSkeleton';
import { SearchPageSkeleton } from '@/components/search/SearchPageSkeleton';
import { ShraddhasFavouritePageSkeleton } from '@/components/shraddhas-favourite/ShraddhasFavouritePageSkeleton';
import { normalizeHref } from '@/lib/navigation/normalize-href';

/**
 * Match a campaign landing page on its canonical path or `/pages/` alias.
 *
 * @param pathname - Normalized pathname without search.
 * @param route - Canonical campaign path (e.g. `/emily-in-paris`).
 */
function isCampaignPagePath(pathname: string, route: string): boolean {
  const alias = `/pages${route}`;

  return (
    pathname === route ||
    pathname.startsWith(`${route}/`) ||
    pathname === alias ||
    pathname.startsWith(`${alias}/`)
  );
}

/**
 * Resolve the destination page skeleton for a soft-navigation href.
 *
 * @param href - Target path (with optional search).
 * @returns Skeleton element to show while navigation is pending.
 */
export function resolveRouteSkeleton(href: string): ReactElement {
  const normalized = normalizeHref(href);
  const pathname = normalized?.pathname ?? href.split('?')[0] ?? '/';

  if (pathname === '/') {
    return <HomePageSkeleton />;
  }
  if (pathname.startsWith('/products/')) {
    return <ProductPageSkeleton />;
  }
  if (pathname.startsWith('/collections/')) {
    return <CollectionPageSkeleton />;
  }
  if (pathname === '/search' || pathname.startsWith('/search/')) {
    return <SearchPageSkeleton />;
  }
  if (isCampaignPagePath(pathname, '/emily-in-paris')) {
    return <EmilyInParisPageSkeleton />;
  }
  if (isCampaignPagePath(pathname, '/diwali')) {
    return <DiwaliPageSkeleton />;
  }
  if (isCampaignPagePath(pathname, '/shraddhas-favourite')) {
    return <ShraddhasFavouritePageSkeleton />;
  }
  if (pathname === '/cart/offers' || pathname.startsWith('/cart/offers/')) {
    return <CartOffersPageSkeleton />;
  }
  if (pathname === '/cart' || pathname.startsWith('/cart/')) {
    return <CartPageSkeleton />;
  }
  if (pathname === '/pop/my-plan' || pathname.startsWith('/pop/my-plan/')) {
    return <PopMyPlanSkeleton />;
  }
  if (pathname === '/about' || pathname.startsWith('/about/')) {
    return <AboutPageSkeleton />;
  }

  return <PageChromeSkeleton />;
}
