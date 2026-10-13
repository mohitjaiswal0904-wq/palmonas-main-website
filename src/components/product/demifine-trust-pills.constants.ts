import type { ComponentType } from 'react';

import { AntiTarnishIcon } from '@/components/icons/AntiTarnishIcon';
import { GoldPlatedIcon } from '@/components/icons/GoldPlatedIcon';
import { SkinSafeIcon } from '@/components/icons/SkinSafeIcon';

export type DemifineTrustPillId = 'antiTarnish' | 'skinSafeJewellery' | 'goldTonePlated';

interface DemifineTrustPillItem {
  id: DemifineTrustPillId;
  Icon: ComponentType<{ className?: string }>;
}

/** Trust pills shown above demifine PDP deals (Figma node 2298:40125). */
export const DEMIFINE_TRUST_PILL_ITEMS: DemifineTrustPillItem[] = [
  { id: 'antiTarnish', Icon: AntiTarnishIcon },
  { id: 'skinSafeJewellery', Icon: SkinSafeIcon },
  { id: 'goldTonePlated', Icon: GoldPlatedIcon },
];
