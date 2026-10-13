import Image from 'next/image';

import { productMessages, productTheme, productUspBadges } from '@/config/product/product.config';
import {
  HORIZONTAL_SCROLL_PASS_VERTICAL,
  HORIZONTAL_SCROLLBAR_HIDDEN,
} from '@/lib/layout/horizontal-scroll';
import { cn } from '@/lib/utils/cn';
import type { ProductUspId } from '@/types/product';

interface DemifineProductUspProps {
  usps?: readonly ProductUspId[];
}

/**
 * Demifine USP strip — Shopify badge images selected from the product `usps` list.
 * Gold USP stays in `GoldProductUsp` — do not reuse this for gold.
 */
export function DemifineProductUsp({ usps }: DemifineProductUspProps) {
  const items = (usps ?? []).flatMap((id) => {
    const badge = productUspBadges[id];
    const label = productMessages.usps[id];

    return badge && label ? [{ id, badge, label }] : [];
  });

  if (items.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        productTheme.uspStrip.listClass,
        HORIZONTAL_SCROLL_PASS_VERTICAL,
        HORIZONTAL_SCROLLBAR_HIDDEN,
      )}
      role="list"
      aria-label={productMessages.a11y.productBenefits}
    >
      {items.map(({ id, badge, label }) => (
        <div key={id} className={productTheme.uspStrip.itemClass} role="listitem">
          <Image
            src={badge.src}
            alt={label}
            width={badge.width}
            height={badge.height}
            className={productTheme.uspStrip.imageClass}
          />
        </div>
      ))}
    </div>
  );
}
