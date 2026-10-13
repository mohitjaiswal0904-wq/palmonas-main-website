import Image from 'next/image';
import Link from 'next/link';

import { GIFTING_FREE_GIFTS } from '@/config/gifting/gifting.config';

/**
 * Free gifts promotional banner (complete mobile + desktop artwork).
 */
export function GiftingFreeGiftsBanner() {
  return (
    <div className="h-full">
      <Link
        href={GIFTING_FREE_GIFTS.ctaHref}
        aria-label={GIFTING_FREE_GIFTS.ctaLabel}
        className="block h-full"
      >
        <Image
          src={GIFTING_FREE_GIFTS.mobileImageSrc}
          alt={GIFTING_FREE_GIFTS.imageAlt}
          width={720}
          height={581}
          className="tab:hidden h-auto w-full"
          sizes="100vw"
        />
        <Image
          src={GIFTING_FREE_GIFTS.desktopImageSrc}
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
