import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import {
  buildAnalyticsPageProperties,
  resolveAnalyticsPageContext,
} from '@/lib/analytics/build-analytics-page-properties';
import type { AnalyticsEventDetail, AnalyticsPropertyValue } from '@/types/analytics';

export interface RouteAnalyticsContext {
  pathname: string;
  search: string;
  previousPathname?: string;
}

/**
 * Converts a pathname into a human-readable screen name for fallback tracking.
 *
 * @param pathname - Current App Router pathname.
 * @returns Title-cased screen label.
 */
export function pathnameToScreenName(pathname: string): string {
  if (pathname === '/') {
    return 'Home';
  }

  const segments = pathname
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment).replace(/-/g, ' '));

  return segments.map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(' ');
}

function buildRouteProperties(
  pathname: string,
  search: string,
  previousPathname?: string,
): Record<string, AnalyticsPropertyValue> {
  const properties: Record<string, AnalyticsPropertyValue> = {
    path: pathname,
    ...buildAnalyticsPageProperties(resolveAnalyticsPageContext(pathname)),
  };

  if (search) {
    properties.search = search;
  }

  if (previousPathname) {
    properties.previous_screen = pathnameToScreenName(previousPathname);
  }

  return properties;
}

/**
 * Builds a semantic view event for SPA route changes (replaces generic page_view).
 *
 * @param context - Current and previous route context.
 * @returns Canonical analytics event detail for the resolved screen.
 */
export function buildRouteAnalyticsEvent(context: RouteAnalyticsContext): AnalyticsEventDetail {
  const { pathname, search, previousPathname } = context;
  const properties = buildRouteProperties(pathname, search, previousPathname);
  const pageContext = resolveAnalyticsPageContext(pathname);

  const productMatch = pathname.match(/^\/products\/([^/?#]+)/);
  if (productMatch?.[1]) {
    return {
      name: analyticsCanonicalEvents.pdpViewed,
      properties: {
        ...properties,
        product_id: pageContext.productHandle ?? decodeURIComponent(productMatch[1]),
        screen_name: pageContext.productName ?? pathnameToScreenName(pathname),
      },
      value: 1,
      currency: 'INR',
    };
  }

  const collectionMatch = pathname.match(/^\/collections\/([^/?#]+)/);
  if (collectionMatch?.[1]) {
    const collectionId = pageContext.collectionHandle ?? decodeURIComponent(collectionMatch[1]);

    return {
      name: analyticsCanonicalEvents.plpViewed,
      properties: {
        ...properties,
        collection_id: collectionId,
        collection_name: pageContext.collectionName ?? collectionId,
        screen_name: pageContext.collectionName ?? pathnameToScreenName(pathname),
      },
    };
  }

  if (pathname === '/') {
    return {
      name: analyticsCanonicalEvents.homeViewed,
      properties: {
        ...properties,
        screen_name: 'Home',
        collections_shown_count: 0,
      },
    };
  }

  if (pathname === '/cart') {
    return {
      name: analyticsCanonicalEvents.cartViewed,
      properties: {
        ...properties,
        screen_name: 'Cart',
        items_count: 0,
      },
    };
  }

  if (pathname === '/wishlist') {
    return {
      name: analyticsCanonicalEvents.wishlistViewed,
      properties: {
        ...properties,
        screen_name: 'Wishlist',
        items_count: 0,
      },
    };
  }

  if (pathname === '/search') {
    const query = new URLSearchParams(search).get('q')?.trim() ?? '';

    if (query) {
      return {
        name: analyticsCanonicalEvents.searchResultsViewed,
        properties: {
          ...properties,
          screen_name: 'Search Results',
          query,
          results_count: 0,
        },
        value: 1,
        currency: 'INR',
      };
    }

    return {
      name: analyticsCanonicalEvents.searchOpened,
      properties: {
        ...properties,
        screen_name: 'Search',
        entry_point: 'navigation',
      },
    };
  }

  if (pathname === '/offers') {
    return {
      name: analyticsCanonicalEvents.offerViewed,
      properties: {
        ...properties,
        screen_name: 'Offers',
        offer_id: 'offers-page',
        offer_name: 'Offers',
        offer_type: 'page',
      },
    };
  }

  if (pathname.startsWith('/checkout')) {
    return {
      name: analyticsCanonicalEvents.checkoutStarted,
      properties: {
        ...properties,
        screen_name: 'Checkout',
        items_count: 0,
        entry_point: previousPathname ?? 'direct',
      },
    };
  }

  const orderDetailMatch = pathname.match(/^\/account\/orders\/([^/?#]+)/);
  if (orderDetailMatch?.[1]) {
    return {
      name: analyticsCanonicalEvents.orderDetailViewed,
      properties: {
        ...properties,
        screen_name: 'Order Detail',
        order_id: decodeURIComponent(orderDetailMatch[1]),
      },
    };
  }

  if (pathname === '/account/orders') {
    return {
      name: analyticsCanonicalEvents.ordersListViewed,
      properties: {
        ...properties,
        screen_name: 'Orders',
      },
    };
  }

  return {
    name: analyticsCanonicalEvents.screenViewed,
    properties: {
      ...properties,
      screen_name: pathnameToScreenName(pathname),
    },
  };
}

/**
 * @deprecated Use {@link buildRouteAnalyticsEvent} for semantic route tracking.
 */
export function buildPageViewAnalyticsEvent(
  pathname: string,
  search: string,
): AnalyticsEventDetail {
  return buildRouteAnalyticsEvent({ pathname, search });
}
