import {
  PURCHASE_ASSURANCE_ITEMS,
  type PurchaseAssuranceId,
} from '@/components/product/purchase-assurance.constants';
import { productMessages, productTheme } from '@/config/product/product.config';
import { themeFonts } from '@/config/theme/fonts';

const LABELS: Record<PurchaseAssuranceId, string> = {
  twoDaysReturn: productMessages.twoDaysReturn,
  tenDaysExchange: productMessages.tenDaysExchange,
  cashOnDelivery: productMessages.cashOnDelivery,
};

/**
 * Compact return / exchange / COD row above similar products.
 */
export function ProductPurchaseAssurance() {
  return (
    <section
      className={productTheme.pdpRhythm.purchaseAssuranceSectionClass}
      aria-label={productMessages.a11y.purchaseAssurance}
    >
      <ul className={productTheme.pdpRhythm.purchaseAssuranceListClass}>
        {PURCHASE_ASSURANCE_ITEMS.map(({ id, Icon }) => (
          <li key={id} className={productTheme.pdpRhythm.purchaseAssuranceItemClass}>
            <span
              className={
                id === 'cashOnDelivery'
                  ? productTheme.pdpRhythm.purchaseAssuranceCodWrapClass
                  : undefined
              }
              style={{ color: productTheme.ink }}
            >
              <Icon className={productTheme.pdpRhythm.purchaseAssuranceIconClass} />
            </span>
            <p
              className={`${productTheme.pdpRhythm.purchaseAssuranceLabelClass} ${themeFonts.sans.className}`}
              style={{ color: productTheme.textMuted }}
            >
              {LABELS[id]}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
