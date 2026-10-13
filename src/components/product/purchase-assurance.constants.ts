import type { ComponentType } from 'react';

import {
  PurchaseCodIcon,
  PurchaseExchangeIcon,
  PurchaseReturnIcon,
} from '@/components/icons/PurchaseAssuranceIcons';

export type PurchaseAssuranceId = 'twoDaysReturn' | 'tenDaysExchange' | 'cashOnDelivery';

interface PurchaseAssuranceItem {
  id: PurchaseAssuranceId;
  Icon: ComponentType<{ className?: string }>;
}

/** PDP purchase-assurance row shown above similar products. */
export const PURCHASE_ASSURANCE_ITEMS: PurchaseAssuranceItem[] = [
  { id: 'twoDaysReturn', Icon: PurchaseReturnIcon },
  { id: 'tenDaysExchange', Icon: PurchaseExchangeIcon },
  { id: 'cashOnDelivery', Icon: PurchaseCodIcon },
];
