import { analyticsCanonicalEvents } from '@/config/analytics/analytics.config';
import { resolveAnalyticsPageContext } from '@/lib/analytics/build-analytics-page-properties';
import type { ClickAnalyticsContext } from '@/lib/analytics/build-click-analytics-event';
import { getClickAccessibleLabel } from '@/lib/analytics/get-click-accessible-label';
import type { AnalyticsPropertyValue } from '@/types/analytics';

export interface SemanticClickResolution {
  eventName: string;
  properties: Record<string, AnalyticsPropertyValue>;
}

interface ClickInferenceRule {
  eventName: string;
  test: (label: string) => boolean;
  buildProperties?: (context: {
    label: string;
    href: string | null;
    pathname: string;
  }) => Record<string, AnalyticsPropertyValue>;
}

const ADD_TO_CART_LABEL = /add to cart|add to bag/i;
const BUY_NOW_LABEL = /buy it now|buy now/i;
const GO_TO_CART_LABEL = /go to cart/i;
const WISHLIST_ADD_LABEL = /add to wishlist|save to wishlist/i;
const WISHLIST_REMOVE_LABEL = /remove from wishlist|remove wishlist/i;

const CLICK_INFERENCE_RULES: ClickInferenceRule[] = [
  {
    eventName: analyticsCanonicalEvents.addToCartClicked,
    test: (label) => ADD_TO_CART_LABEL.test(label),
  },
  {
    eventName: analyticsCanonicalEvents.buyNowClicked,
    test: (label) => BUY_NOW_LABEL.test(label),
  },
  {
    eventName: analyticsCanonicalEvents.navigationClicked,
    test: (label) => GO_TO_CART_LABEL.test(label),
    buildProperties: ({ label }) => ({
      nav_item_name: label,
      destination_screen: '/cart',
    }),
  },
  {
    eventName: analyticsCanonicalEvents.addToWishlist,
    test: (label) => WISHLIST_ADD_LABEL.test(label),
    buildProperties: ({ label, pathname }) => ({
      product_id: resolveAnalyticsPageContext(pathname).productHandle ?? 'unknown',
      title: label,
      origin_screen: pathname,
    }),
  },
  {
    eventName: analyticsCanonicalEvents.removeFromWishlist,
    test: (label) => WISHLIST_REMOVE_LABEL.test(label),
    buildProperties: ({ label, pathname }) => ({
      product_id: resolveAnalyticsPageContext(pathname).productHandle ?? 'unknown',
      title: label,
      origin_screen: pathname,
    }),
  },
];

function extractProductHandleFromHref(href: string): string | undefined {
  const match = href.match(/\/products\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

function extractCollectionHandleFromPath(pathname: string): string | undefined {
  const match = pathname.match(/^\/collections\/([^/?#]+)/);
  return match?.[1] ? decodeURIComponent(match[1]) : undefined;
}

/**
 * Resolves a semantic analytics event from click target metadata when no explicit tag is set.
 *
 * @param element - Trackable click target.
 * @param context - Current route context.
 * @returns Semantic event name + properties, or null when the click should not be tracked.
 */
export function resolveSemanticClickEvent(
  element: HTMLElement,
  context: ClickAnalyticsContext,
): SemanticClickResolution | null {
  const explicitEvent = element.getAttribute('data-analytics-event')?.trim();
  if (explicitEvent) {
    return null;
  }

  const label = getClickAccessibleLabel(element);
  const href =
    element instanceof HTMLAnchorElement
      ? (element.getAttribute('href') ?? element.href)
      : (element.closest('a[href]')?.getAttribute('href') ?? null);

  for (const rule of CLICK_INFERENCE_RULES) {
    if (!rule.test(label)) {
      continue;
    }

    const pageContext = resolveAnalyticsPageContext(context.pathname);
    const productId = pageContext.productHandle ?? 'unknown';

    return {
      eventName: rule.eventName,
      properties: {
        product_id: productId,
        screen_name: context.pathname,
        button_name: label,
        ...(rule.buildProperties?.({ label, href, pathname: context.pathname }) ?? {}),
      },
    };
  }

  if (href?.startsWith('/products/')) {
    const sku = extractProductHandleFromHref(href);
    const collectionId = extractCollectionHandleFromPath(context.pathname);

    if (sku && collectionId) {
      const pageContext = resolveAnalyticsPageContext(context.pathname);

      return {
        eventName: analyticsCanonicalEvents.plpProductClicked,
        properties: {
          sku,
          collection_id: collectionId,
          collection_name: pageContext.collectionName ?? collectionId,
          screen_name: context.pathname,
        },
      };
    }

    return null;
  }

  return null;
}
