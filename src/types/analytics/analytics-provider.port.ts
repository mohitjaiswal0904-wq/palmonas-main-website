import type {
  AnalyticsProviderId,
  TransformedProviderEvent,
} from '@/types/analytics/analytics.types';

/** Vendor adapter contract for a single analytics provider. */
export interface AnalyticsProviderPort {
  readonly id: AnalyticsProviderId;
  /** Returns true when this provider has a non-empty credential configured. */
  isConfigured: () => boolean;
  /** Loads vendor SDK and performs provider-specific init. */
  initialize: () => Promise<void>;
  /** Returns true after a successful {@link initialize} call. */
  isInitialized: () => boolean;
  /** Sends one transformed event to the vendor SDK. */
  track: (event: TransformedProviderEvent) => Promise<void>;
}
