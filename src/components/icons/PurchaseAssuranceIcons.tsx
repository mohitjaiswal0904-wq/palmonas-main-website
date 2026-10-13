import { IndianRupee } from 'lucide-react';

import { purchaseAssuranceIcons } from '@/config/product/product.config';
import { productTokens } from '@/config/theme/product.tokens';
import { cn } from '@/lib/utils/cn';

interface PurchaseAssuranceIconProps {
  className?: string;
}

interface PurchaseAssuranceCdnIconProps extends PurchaseAssuranceIconProps {
  src: string;
  width: number;
  height: number;
}

/**
 * Render a decorative Shopify PNG for the purchase-assurance row.
 *
 * @param src - CDN image URL from product config.
 * @param width - Intrinsic width.
 * @param height - Intrinsic height.
 * @param className - Layout size classes from product tokens.
 */
function PurchaseAssuranceCdnIcon({
  src,
  width,
  height,
  className,
}: PurchaseAssuranceCdnIconProps) {
  return (
    // ponytail: native img — 28px mark, not worth next/image + extra host config
    // eslint-disable-next-line @next/next/no-img-element -- decorative 28px CDN glyph
    <img
      src={src}
      width={width}
      height={height}
      alt=""
      aria-hidden="true"
      className={cn('object-contain', className)}
    />
  );
}

/** Shopify return mark — 2 Days Return. */
export function PurchaseReturnIcon({ className }: PurchaseAssuranceIconProps) {
  const icon = purchaseAssuranceIcons.twoDaysReturn;

  return (
    <PurchaseAssuranceCdnIcon
      src={icon.src}
      width={icon.width}
      height={icon.height}
      className={className}
    />
  );
}

/** Shopify exchange mark — 10 Days Exchange. */
export function PurchaseExchangeIcon({ className }: PurchaseAssuranceIconProps) {
  const icon = purchaseAssuranceIcons.tenDaysExchange;

  return (
    <PurchaseAssuranceCdnIcon
      src={icon.src}
      width={icon.width}
      height={icon.height}
      className={className}
    />
  );
}

/** Lucide rupee in a ring — Cash On Delivery. */
export function PurchaseCodIcon({ className }: PurchaseAssuranceIconProps) {
  return (
    <span
      className={cn(productTokens.pdpRhythm.purchaseAssuranceCodRingClass, className)}
      style={{ color: productTokens.textMuted, borderColor: productTokens.textMuted }}
    >
      <IndianRupee
        className={productTokens.pdpRhythm.purchaseAssuranceCodGlyphClass}
        color={productTokens.textMuted}
        strokeWidth={1.75}
      />
    </span>
  );
}
