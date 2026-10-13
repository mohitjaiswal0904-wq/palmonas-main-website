import Image from 'next/image';
import Link from 'next/link';

import { GiftingSectionHeading } from '@/components/gifting/GiftingSectionHeading';
import {
  GIFTING_BY_PRICE,
  GIFTING_BY_PRICE_ICON_SRC,
  GIFTING_SECTION_TITLES,
} from '@/config/gifting/gifting.config';

/**
 * Price-band tiles for quick gift discovery (complete mobile + desktop artwork).
 */
export function GiftingByPriceSection() {
  return (
    <section className="tab:px-6 px-4 py-4" aria-labelledby="gifts-by-price-heading">
      <div className="mx-auto w-full max-w-5xl">
        <div className="relative mb-5 flex justify-center">
          <Image
            src={GIFTING_BY_PRICE_ICON_SRC}
            alt=""
            width={32}
            height={32}
            className="absolute top-1/2 left-[calc(50%-5.5rem)] h-8 w-8 -translate-y-1/2"
            aria-hidden="true"
          />
          <GiftingSectionHeading
            id="gifts-by-price-heading"
            title={GIFTING_SECTION_TITLES.giftsByPrice}
            align="center"
          />
        </div>

        <ul className="tab:gap-4 grid grid-cols-4 gap-2">
          {GIFTING_BY_PRICE.map((card) => (
            <li key={card.id}>
              <Link href={card.href} className="block" aria-label={`Shop gifts ${card.label}`}>
                <Image
                  src={card.mobileImageSrc}
                  alt={card.label}
                  width={146}
                  height={146}
                  className="tab:hidden h-auto w-full"
                  sizes="25vw"
                />
                <Image
                  src={card.desktopImageSrc}
                  alt=""
                  width={220}
                  height={220}
                  className="tab:block hidden h-auto w-full"
                  sizes="180px"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
