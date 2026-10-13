import 'server-only';

import { unstable_cache as cacheWithRevalidation } from 'next/cache';

import {
  componentsConfig,
  type CmsSlotComponentConfig,
  type CmsSlotId,
  type FooterComponentConfig,
  type HeaderComponentConfig,
} from '@/config/components.config';
import { ENDPOINTS } from '@/lib/endpoints';
import { getApiBaseUrl } from '@/lib/env';
import { normaliseError } from '@/lib/errors';
import { createPublicServerApi } from '@/lib/server-api';
import { unwrapCmsSlotResponse } from '@/lib/utils/unwrap-cms-slot-response';
import type { CmsSlotPayload } from '@/types/cms-slot';

type ComponentsConfigEntry = (typeof componentsConfig)[keyof typeof componentsConfig];

function getSlotConfig(
  slot: CmsSlotId,
): CmsSlotComponentConfig | FooterComponentConfig | HeaderComponentConfig {
  for (const config of Object.values(componentsConfig) as ComponentsConfigEntry[]) {
    if ('slot' in config && config.slot === slot) {
      return config;
    }
  }

  throw new Error(`No component config found for CMS slot: ${slot}`);
}

async function fetchCmsSlotDefault(slot: CmsSlotId): Promise<CmsSlotPayload> {
  try {
    const config = getSlotConfig(slot);
    const client = createPublicServerApi();
    const { data } = await client.get<unknown>(ENDPOINTS.cms.slotDefault(slot), {
      params: config.api.params,
    });

    return unwrapCmsSlotResponse(data);
  } catch (err) {
    throw normaliseError(err);
  }
}

export function getCachedCmsSlotDefault(slot: CmsSlotId): Promise<CmsSlotPayload> {
  const config = getSlotConfig(slot);

  return cacheWithRevalidation(
    async () => fetchCmsSlotDefault(slot),
    [config.componentId, config.slot, config.api.params.platform, getApiBaseUrl()],
    {
      revalidate: config.cache.revalidateSeconds,
      tags: [...config.cache.tags, `cms-slot-${slot}`],
    },
  )();
}

export function getCachedFooterSlotDefault(): Promise<CmsSlotPayload> {
  return getCachedCmsSlotDefault(componentsConfig.footer.slot);
}

export function getCachedHeaderSlotDefault(): Promise<CmsSlotPayload> {
  return getCachedCmsSlotDefault(componentsConfig.header.slot);
}

export function getFooterFallbackColumns(): FooterComponentConfig['fallback']['columns'] {
  return componentsConfig.footer.fallback.columns;
}
