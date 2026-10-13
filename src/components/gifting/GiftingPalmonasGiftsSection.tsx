import Image from 'next/image';
import Link from 'next/link';

import { GiftingSectionHeading } from '@/components/gifting/GiftingSectionHeading';
import { GIFTING_PALMONAS_GIFTS, GIFTING_SECTION_TITLES } from '@/config/gifting/gifting.config';

/**
 * Three-up Palmonas gift category cards (complete mobile + desktop artwork).
 */
export function GiftingPalmonasGiftsSection() {
  return (
    <section className="tab:px-6 px-4 py-8" aria-labelledby="palmonas-gifts-heading">
      <div className="mx-auto w-full max-w-5xl">
        <GiftingSectionHeading
          id="palmonas-gifts-heading"
          title={GIFTING_SECTION_TITLES.palmonasGifts}
          align="center"
          className="mb-5"
        />

        <ul className="tab:gap-4 grid grid-cols-3 gap-2">
          {GIFTING_PALMONAS_GIFTS.map((card) => (
            <li key={card.id}>
              <Link href={card.href} aria-label={`Shop ${card.title}`} className="block w-full">
                <Image
                  src={card.mobileImageSrc ?? card.imageSrc}
                  alt={card.imageAlt}
                  width={208}
                  height={305}
                  className="tab:hidden h-auto w-full"
                  sizes="33vw"
                />
                <Image
                  src={card.desktopImageSrc ?? card.imageSrc}
                  alt=""
                  width={320}
                  height={470}
                  className="tab:block hidden h-auto w-full"
                  sizes="220px"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
