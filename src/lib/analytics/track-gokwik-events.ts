import { trackAnalyticsEvent } from '@/infrastructure/analytics/analytics-client';
import {
  buildGokwikMixpanelEvent,
  type GokwikAnalyticsEvent,
} from '@/lib/analytics/parse-gokwik-analytics-event';

/**
 * Sends a GoKwik listener event to analytics vendors with the original event name.
 *
 * @param event - Parsed GoKwik checkout / pixel event.
 */
export function trackGokwikCheckoutEvent(event: GokwikAnalyticsEvent): void {
  void trackAnalyticsEvent(buildGokwikMixpanelEvent(event)).catch(() => {
    // ponytail: checkout analytics must not block order success routing.
  });
}
