import {
  analyticsDefaultCurrency,
  analyticsEventMappingRegistry,
  mixpanelIgnoredEvents,
} from '@/config/analytics/analytics.config';
import {
  META_STANDARD_PROPERTY,
  sanitizeAnalyticsProperties,
} from '@/lib/analytics/sanitize-analytics-properties';
import type {
  AnalyticsEventDetail,
  AnalyticsPropertyValue,
  AnalyticsProviderId,
  TransformedProviderEvent,
} from '@/types/analytics';

/**
 * Maps a canonical analytics event to provider-specific event names and payloads.
 *
 * @param event - Canonical event from app code.
 * @param providerIds - Providers that should receive this event.
 * @returns One transformed payload per configured provider.
 */
export async function transformAnalyticsEvent(
  event: AnalyticsEventDetail,
  providerIds: AnalyticsProviderId[],
): Promise<TransformedProviderEvent[]> {
  const passthroughName = event.passthroughEventName === true;
  const mapping = passthroughName ? undefined : analyticsEventMappingRegistry[event.name];
  const baseProperties = sanitizeAnalyticsProperties(event.properties ?? {});

  if (event.value !== undefined) {
    baseProperties.value = event.value;
  }

  const currency = event.currency ?? analyticsDefaultCurrency;
  if (event.value !== undefined || event.currency) {
    baseProperties.currency = currency;
  }

  return providerIds
    .filter(
      (provider) =>
        passthroughName || provider !== 'mixpanel' || !mixpanelIgnoredEvents.has(event.name),
    )
    .map((provider) => {
      const providerMapping = mapping?.[provider];
      const eventName = passthroughName ? event.name : (providerMapping?.eventName ?? event.name);
      const mappedProperties = providerMapping?.properties ?? {};
      const properties: Record<string, AnalyticsPropertyValue> = {
        ...baseProperties,
        ...mappedProperties,
      };

      if (provider === 'meta' && providerMapping?.standard) {
        properties[META_STANDARD_PROPERTY] = true;
      }

      return {
        provider,
        eventName,
        properties,
      };
    });
}
