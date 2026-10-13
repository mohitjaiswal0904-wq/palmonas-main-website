import Image from 'next/image';
import Link from 'next/link';

import { GIFTING_GIFT_CARDS } from '@/config/gifting/gifting.config';

/**
 * Gift cards promotional banner (complete mobile + desktop artwork).
 */
export function GiftingGiftCardsSection() {
  return (
    <div className="h-full">
      <Link href={GIFTING_GIFT_CARDS.ctaHref} aria-label="Open Gift Cards" className="block h-full">
        <Image
          src={GIFTING_GIFT_CARDS.mobileImageSrc}
          alt={GIFTING_GIFT_CARDS.imageAlt}
          width={660}
          height={520}
          className="tab:hidden h-auto w-full"
          sizes="100vw"
        />
        <Image
          src={GIFTING_GIFT_CARDS.desktopImageSrc}
          alt=""
          width={720}
          height={700}
          className="tab:block hidden h-full w-full object-cover"
          sizes="50vw"
        />
      </Link>
    </div>
  );
}
