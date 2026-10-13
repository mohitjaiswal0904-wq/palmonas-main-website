import 'server-only';

import { componentsConfig } from '@/config/components.config';
import { buildFallbackFooterItems, transformFooterSlotPayload } from '@/lib/utils/transform-footer';
import { getCachedFooterSlotDefault } from '@/services/server/cms-slot.service.server';
import { DEFAULT_FOOTER_CONFIG, type FooterSlotViewModel } from '@/types/layout';

const footerConfig = componentsConfig.footer;

export async function getFooterData(): Promise<FooterSlotViewModel> {
  try {
    const payload = await getCachedFooterSlotDefault();
    return transformFooterSlotPayload(payload);
  } catch {
    return {
      config: DEFAULT_FOOTER_CONFIG,
      items: buildFallbackFooterItems(footerConfig.fallback.columns),
    };
  }
}
