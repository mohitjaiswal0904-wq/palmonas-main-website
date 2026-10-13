import Image from 'next/image';
import Link from 'next/link';

import { GiftingSectionHeading } from '@/components/gifting/GiftingSectionHeading';
import { GIFTING_OCCASIONS, GIFTING_SECTION_TITLES } from '@/config/gifting/gifting.config';

/**
 * Occasion tiles (complete mobile + desktop artwork).
 */
export function GiftingOccasionSection() {
  return (
    <section className="tab:px-6 px-3 py-0" aria-labelledby="shop-by-occasion-heading">
      <div className="mx-auto w-full max-w-5xl">
        <GiftingSectionHeading
          id="shop-by-occasion-heading"
          title={GIFTING_SECTION_TITLES.shopByOccasion}
          align="center"
          className="mb-5"
        />

        <ul className="tab:gap-4 grid grid-cols-4 gap-2">
          {GIFTING_OCCASIONS.map((occasion) => (
            <li key={occasion.id}>
              <Link
                href={occasion.href}
                className="block"
                aria-label={`Shop ${occasion.title} gifts`}
              >
                <Image
                  src={occasion.mobileImageSrc}
                  alt={occasion.imageAlt}
                  width={152}
                  height={200}
                  className="tab:hidden h-auto w-full"
                  sizes="25vw"
                />
                <Image
                  src={occasion.desktopImageSrc}
                  alt=""
                  width={240}
                  height={320}
                  className="tab:block hidden h-auto w-full"
                  sizes="200px"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
