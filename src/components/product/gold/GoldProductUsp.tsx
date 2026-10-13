import Image from 'next/image';

import { goldUspImage, productMessages } from '@/config/product/product.config';

/**
 * Gold trust row — one CMS strip holding all four badges (BIS Hallmark, SGL/IGI Certified,
 * Lifetime Buyback, Easy Return/Exchange). Alt text carries the badge names the separate
 * icon cards used to announce individually.
 */
export function GoldProductUsp() {
  return (
    <section aria-label={productMessages.a11y.productBenefits}>
      <Image
        src={goldUspImage.src}
        alt={productMessages.a11y.goldTrustBadges}
        width={goldUspImage.width}
        height={goldUspImage.height}
        sizes="(min-width: 1024px) 416px, 100vw"
        className="h-auto w-full"
      />
    </section>
  );
}
