import Image from 'next/image';

import offerPercentStar from '@/components/icons/svg/offer-percent-star.svg';
import { productTokens } from '@/config/theme/product.tokens';
import { cn } from '@/lib/utils/cn';

interface OfferPercentStarIconProps {
  className?: string;
}

/**
 * Listing-card offer pill star (Figma 3896:45162) with a percent glyph over the leaf.
 */
export function OfferPercentStarIcon({ className }: OfferPercentStarIconProps) {
  return (
    <span className={cn(productTokens.cardOfferCycle.iconClass, className)} aria-hidden="true">
      <Image
        src={offerPercentStar}
        alt=""
        width={11}
        height={11}
        className="absolute inset-0 size-full"
        unoptimized
      />
      <span className={productTokens.cardOfferCycle.percentClass}>%</span>
    </span>
  );
}
