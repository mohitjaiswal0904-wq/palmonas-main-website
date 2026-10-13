import {
  analyticsClickPropertyKeys,
  analyticsDataAttributes,
} from '@/config/analytics/analytics.config';
import {
  buildAnalyticsPageProperties,
  resolveAnalyticsPageContext,
} from '@/lib/analytics/build-analytics-page-properties';
import {
  findTrackableClickTarget,
  getClickElementType,
  shouldSkipClickTracking,
} from '@/lib/analytics/find-trackable-click-target';
import { getClickAccessibleLabel } from '@/lib/analytics/get-click-accessible-label';
import { parseAnalyticsDataProps } from '@/lib/analytics/parse-analytics-data-props';
import { resolveSemanticClickEvent } from '@/lib/analytics/resolve-semantic-click-event';
import type { AnalyticsEventDetail, AnalyticsPropertyValue } from '@/types/analytics';

export interface ClickAnalyticsContext {
  pathname: string;
  search: string;
}

/**
 * Builds a canonical analytics event from a delegated document click.
 *
 * @param target - Raw click event target.
 * @param context - Current route context for the payload.
 * @returns Semantic click event detail or null when tracking should be skipped.
 */
export function buildClickAnalyticsEvent(
  target: EventTarget | null,
  context: ClickAnalyticsContext,
): AnalyticsEventDetail | null {
  const element = findTrackableClickTarget(target);

  if (!element || shouldSkipClickTracking(element)) {
    return null;
  }

  const explicitEventName = element.getAttribute(analyticsDataAttributes.event)?.trim();
  const label = getClickAccessibleLabel(element);
  const href =
    element instanceof HTMLAnchorElement
      ? (element.getAttribute('href') ?? element.href)
      : (element.closest('a[href]')?.getAttribute('href') ?? null);

  const semanticClick = explicitEventName ? null : resolveSemanticClickEvent(element, context);

  if (!explicitEventName && !semanticClick) {
    return null;
  }

  const eventName = explicitEventName ?? semanticClick!.eventName;

  const properties: Record<string, AnalyticsPropertyValue> = {
    [analyticsClickPropertyKeys.elementType]: getClickElementType(element),
    [analyticsClickPropertyKeys.label]: label,
    [analyticsClickPropertyKeys.path]: context.pathname,
    screen_name: context.pathname,
    ...buildAnalyticsPageProperties(resolveAnalyticsPageContext(context.pathname)),
    ...parseAnalyticsDataProps(element.getAttribute(analyticsDataAttributes.props)),
    ...(semanticClick?.properties ?? {}),
  };

  if (context.search) {
    properties[analyticsClickPropertyKeys.search] = context.search;
  }

  if (href) {
    properties[analyticsClickPropertyKeys.href] = href;
  }

  return {
    name: eventName,
    properties,
  };
}

export {
  buildRouteAnalyticsEvent,
  buildPageViewAnalyticsEvent,
} from '@/lib/analytics/build-route-analytics-event';
