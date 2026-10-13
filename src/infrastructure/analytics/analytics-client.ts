import {
  analyticsLazyInitProviderIds,
  analyticsPixelOnlyProviderIds,
} from '@/config/analytics/analytics.config';
import { createAnalyticsVendorClients } from '@/infrastructure/analytics/clients';
import type { AnalyticsVendorClient } from '@/infrastructure/analytics/clients/types';
import { createAnalyticsProviders } from '@/infrastructure/analytics/create-analytics-providers';
import type { AnalyticsIdentifyOptions } from '@/lib/analytics/analytics-identify';
import {
  buildAnalyticsConfig,
  getConfiguredAnalyticsProviderIds,
} from '@/lib/analytics/build-analytics-config';
import { transformAnalyticsEvent } from '@/lib/analytics/transform-analytics-event';
import type {
  AnalyticsEventDetail,
  AnalyticsPropertyValue,
  AnalyticsProviderConfig,
  AnalyticsProviderId,
} from '@/types/analytics';
import type { AnalyticsProviderPort } from '@/types/analytics/analytics-provider.port';

/**
 * Multi-provider analytics client — initializes configured vendors and fans out events.
 */
export class AnalyticsClient {
  private readonly vendorClients: AnalyticsVendorClient[];
  private providers: AnalyticsProviderPort[];
  private readonly config: AnalyticsProviderConfig;
  private initialized = false;
  private initPromise: Promise<void> | null = null;
  /** Pending delayed-init promise for Mixpanel; shared across track/identify so the delay is never bypassed. */
  private mixpanelInitPromise: Promise<void> | null = null;

  /**
   * @param config - Optional provider credentials; defaults to env-backed config.
   */
  constructor(config?: AnalyticsProviderConfig) {
    this.config = config ?? buildAnalyticsConfig();
    this.vendorClients = createAnalyticsVendorClients(this.config);
    this.providers = createAnalyticsProviders(this.vendorClients);
  }

  /** Provider ids with non-empty credentials. */
  getConfiguredProviderIds(): AnalyticsProviderId[] {
    return getConfiguredAnalyticsProviderIds(this.config);
  }

  /** Returns true when the given provider finished initialization successfully. */
  isProviderInitialized(providerId: AnalyticsProviderId): boolean {
    return this.providers.some(
      (provider) => provider.id === providerId && provider.isInitialized(),
    );
  }

  /**
   * Loads and initializes every configured provider; skips providers without credentials.
   * ponytail: failures are swallowed per provider via allSettled — one bad SDK must not block others.
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      const configured = this.providers.filter(
        (provider) =>
          provider.isConfigured() && !analyticsLazyInitProviderIds.includes(provider.id),
      );

      const immediateProviders = configured.filter((provider) => provider.id !== 'mixpanel');
      const delayedProviders = configured.filter((provider) => provider.id === 'mixpanel');

      // Store the Mixpanel delayed-init promise so track() and identify() can await it
      // directly — this prevents a race where the fire-and-forget below hasn't set the
      // inner initPromise yet by the time the first track() call reaches client.init().
      if (delayedProviders.length > 0) {
        this.mixpanelInitPromise = Promise.allSettled(
          delayedProviders.map((provider) => provider.initialize()),
        ).then(() => undefined);
      }

      await Promise.allSettled(immediateProviders.map((provider) => provider.initialize()));
      this.initialized = true;
    })();

    return this.initPromise;
  }

  /** Awaits the Mixpanel delayed init if it has not yet completed. */
  private async awaitMixpanelInit(): Promise<void> {
    if (this.mixpanelInitPromise) {
      await this.mixpanelInitPromise;
      this.mixpanelInitPromise = null;
    }
  }

  /**
   * Sets distinct id on vendors that support identity (Mixpanel, WebEngage).
   *
   * @param distinctId - Stable user identifier (base64 phone).
   */
  async identify(distinctId: string, options?: AnalyticsIdentifyOptions): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Wait for Mixpanel's delayed init before identifying so the SDK is ready.
    await this.awaitMixpanelInit();

    await Promise.allSettled(
      this.getIdentityClients().map(async (client) => {
        if (!client.isReady()) {
          await client.init();
        }

        await client.identify?.(distinctId, options);
      }),
    );
  }

  /**
   * Clears vendor identity on logout.
   */
  async resetIdentity(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    // Wait for Mixpanel's delayed init before resetting identity.
    await this.awaitMixpanelInit();

    await Promise.allSettled(
      this.getIdentityClients().map(async (client) => {
        if (!client.isReady()) {
          await client.init();
        }

        await client.resetIdentity?.();
      }),
    );
  }

  /** Returns configured vendor clients that support identity APIs. */
  private getIdentityClients(): AnalyticsVendorClient[] {
    return this.vendorClients.filter((client) => client.isConfigured() && client.identify);
  }

  /**
   * Registers super properties on Mixpanel.
   *
   * @param properties - Values attached to every later Mixpanel event.
   */
  setSuperProperties(properties: Record<string, AnalyticsPropertyValue>): void {
    for (const client of this.vendorClients) {
      client.registerSuperProperties?.(properties);
    }
  }

  /**
   * Transforms a canonical event and sends it to every initialized provider.
   *
   * @param event - Canonical analytics event from app code.
   */
  async track(event: AnalyticsEventDetail): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const activeIds = this.providers
      .filter((provider) => provider.isConfigured())
      .map((provider) => provider.id)
      .filter((id) => !analyticsPixelOnlyProviderIds.includes(id));

    if (activeIds.length === 0) {
      return;
    }

    const transformedEvents = await transformAnalyticsEvent(event, activeIds);

    // Ensure Mixpanel's timed delay has elapsed before dispatching any Mixpanel events.
    const hasMixpanelEvent = transformedEvents.some((e) => e.provider === 'mixpanel');
    if (hasMixpanelEvent) {
      await this.awaitMixpanelInit();
    }

    await Promise.allSettled(
      transformedEvents.map(async (providerEvent) => {
        const provider = this.providers.find((entry) => entry.id === providerEvent.provider);
        if (!provider?.isConfigured()) {
          return;
        }

        if (!provider.isInitialized()) {
          await provider.initialize();
        }

        if (!provider.isInitialized()) {
          return;
        }

        await provider.track(providerEvent);
      }),
    );
  }
}

/** Shared analytics client backed by public env credentials. */
export const analyticsClient = new AnalyticsClient();

/**
 * Tracks an analytics event via the shared client.
 *
 * @param event - Canonical event detail to transform and fan out.
 */
export async function trackAnalyticsEvent(event: AnalyticsEventDetail): Promise<void> {
  await analyticsClient.track(event);
}

/**
 * Sets analytics user identity on Mixpanel and WebEngage.
 *
 * @param distinctId - Base64-encoded phone or other stable id for Mixpanel.
 * @param options - Optional WebEngage CUID and profile attributes.
 */
export async function identifyAnalyticsUser(
  distinctId: string,
  options?: AnalyticsIdentifyOptions,
): Promise<void> {
  await analyticsClient.identify(distinctId, options);
}

/** Clears Mixpanel and WebEngage identity after logout. */
export async function resetAnalyticsUser(): Promise<void> {
  await analyticsClient.resetIdentity();
}

/**
 * Registers Mixpanel super properties (platform, page_name).
 *
 * @param properties - Super properties to attach to later Mixpanel events.
 */
export function setAnalyticsSuperProperties(
  properties: Record<string, AnalyticsPropertyValue>,
): void {
  analyticsClient.setSuperProperties(properties);
}
