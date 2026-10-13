import Image from 'next/image';
import Link from 'next/link';

import { GIFTING_HERO } from '@/config/gifting/gifting.config';

/**
 * Full-bleed gifting hero banners (mobile + desktop artwork).
 */
export function GiftingHeroSection() {
  return (
    <section aria-label="Gifting offer">
      <Link href={GIFTING_HERO.ctaHref} aria-label={GIFTING_HERO.ctaLabel} className="block">
        <Image
          src={GIFTING_HERO.mobileImageSrc}
          alt={GIFTING_HERO.imageAlt}
          width={720}
          height={720}
          priority
          className="tab:hidden h-auto w-full"
          sizes="100vw"
        />
        <Image
          src={GIFTING_HERO.desktopImageSrc}
          alt=""
          width={1920}
          height={700}
          priority
          className="tab:block hidden h-auto w-full"
          sizes="100vw"
        />
      </Link>
    </section>
  );
}
