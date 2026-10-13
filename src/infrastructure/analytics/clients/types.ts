import type { AnalyticsIdentifyOptions } from '@/lib/analytics/analytics-identify';
import type { AnalyticsProviderId, AnalyticsPropertyValue } from '@/types/analytics';

/** Shared init + track contract for a single analytics vendor client. */
export interface AnalyticsVendorClient {
  readonly id: AnalyticsProviderId;
  /** Returns true when a non-empty credential was supplied at construction. */
  isConfigured: () => boolean;
  /** Loads SDK and performs vendor-specific setup. */
  init: () => Promise<boolean>;
  /** Returns true after a successful {@link init}. */
  isReady: () => boolean;
  /** Sends one event to the vendor SDK. */
  track: (eventName: string, properties: Record<string, AnalyticsPropertyValue>) => Promise<void>;
  /** Sets the vendor distinct id when supported. */
  identify?: (distinctId: string, options?: AnalyticsIdentifyOptions) => Promise<void>;
  /** Clears the vendor identity when supported. */
  resetIdentity?: () => Promise<void>;
  /** Registers Mixpanel super properties when supported. */
  registerSuperProperties?: (properties: Record<string, AnalyticsPropertyValue>) => void;
}
