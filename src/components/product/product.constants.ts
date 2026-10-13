import type { ComponentType } from 'react';

import {
  AdjustableRingsIcon,
  AntiTarnishIcon,
  GoldPlatedIcon,
  PlatinumPlatedIcon,
  SkinSafeIcon,
  SterlingSilverIcon,
} from '@/components/icons';
import type { ProductUspId } from '@/types/product';

/** Icons for demifine USP keys from the product API. */
export const PRODUCT_USP_ICONS: Record<ProductUspId, ComponentType<{ className?: string }>> = {
  anti_tarnish: AntiTarnishIcon,
  skin_safe_jewellery: SkinSafeIcon,
  platinum_plated: PlatinumPlatedIcon,
  gold_plated_14k: GoldPlatedIcon,
  sterling_silver_925: SterlingSilverIcon,
  gold_tone_plated: GoldPlatedIcon,
  adjustable_rings: AdjustableRingsIcon,
};
