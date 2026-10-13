import 'server-only';

import { componentsConfig } from '@/config/components.config';
import { buildFallbackHeaderItems, transformHeaderSlotPayload } from '@/lib/utils/header';
import { getCachedHeaderSlotDefault } from '@/services/server/cms-slot.service.server';
import { DEFAULT_HEADER_CONFIG, type HeaderSlotViewModel } from '@/types/layout';

const headerConfig = componentsConfig.header;

export async function getHeaderData(): Promise<HeaderSlotViewModel> {
  try {
    const payload = await getCachedHeaderSlotDefault();
    return transformHeaderSlotPayload(payload);
  } catch {
    return {
      config: DEFAULT_HEADER_CONFIG,
      items: buildFallbackHeaderItems(headerConfig.fallback),
    };
  }
}
