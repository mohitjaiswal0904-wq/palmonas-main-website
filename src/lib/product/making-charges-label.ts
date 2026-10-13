import { isProductFeatureEnabled, productMessages } from '@/config/product/product.config';
import type { MtoPrice } from '@/types/mto-price';

/**
 * Resolve gold making-charges pill label from MTO only (no mock).
 *
 * Flag off → hidden. Shows only when API signals zero making charge / discount.
 *
 * @param price - Live MTO price or undefined when silent.
 * @returns Label to show, or null when hidden.
 */
export function resolveMakingChargesLabel(price: MtoPrice | undefined): string | null {
  if (!isProductFeatureEnabled('makingChargesBadge')) {
    return null;
  }

  if (price?.showMakingChargeDiscount || price?.makingChargeShow === 0) {
    return productMessages.makingChargesZero;
  }

  return null;
}
