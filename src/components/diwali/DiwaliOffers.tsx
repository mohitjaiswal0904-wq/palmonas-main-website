import Link from 'next/link';

import { DiwaliOfferArch } from '@/components/diwali/DiwaliOfferArch';
import { DiwaliSectionHeading } from '@/components/diwali/DiwaliSectionHeading';
import {
  DIWALI_CARD_COLUMN_CLASS,
  DIWALI_SECTION_CLASS,
} from '@/components/diwali/diwali-constants';
import { diwaliImages, diwaliMessages, diwaliShopTabs } from '@/config/diwali/diwali.config';
import { cn } from '@/lib/utils/cn';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';

const BUNDLE_SLOT_COUNT = 4;
const BUNDLE_FILLED_SLOTS = 2;

/**
 * Demi-fine offer cards: two arch tiles, then a full-width bundle banner.
 */
export function DiwaliOffers() {
  const copy = diwaliMessages.offers;
  const rupeesTab = diwaliShopTabs.find((tab) => tab.id === 'rupees-999');
  const flatTab = diwaliShopTabs.find((tab) => tab.id === 'flat-40');
  const bundleTab = diwaliShopTabs.find((tab) => tab.id === 'buy-4');

  return (
    <>
      <section aria-label={diwaliMessages.a11y.offers} className={DIWALI_SECTION_CLASS}>
        <DiwaliSectionHeading
          eyebrow={copy.eyebrow}
          title={copy.title}
          titleId="diwali-offers-heading"
        />

        <div className={cn(DIWALI_CARD_COLUMN_CLASS, 'mt-4')}>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={resolveCollectionPagePath(rupeesTab?.handle ?? '')}
              className="flex flex-col items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
              aria-label={copy.rupees999Cta}
            >
              <DiwaliOfferArch
                kicker={copy.rupees999Kicker}
                price={copy.rupees999Price}
                note={copy.rupees999Note}
                imageLabel={copy.imageSlot}
                imageSrc={diwaliImages.rupees999}
              />
              <span className="text-center text-xs font-bold text-[#151515]">
                {copy.rupees999Cta}
              </span>
            </Link>

            <Link
              href={resolveCollectionPagePath(flatTab?.handle ?? '')}
              className="flex flex-col items-center gap-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
              aria-label={copy.flatCta}
            >
              <DiwaliOfferArch
                kicker={copy.flatKicker}
                price={copy.flatPrice}
                note={copy.flatNote}
                imageLabel={copy.imageSlot}
                imageSrc={diwaliImages.flat40}
              />
              <span className="text-center text-xs font-bold text-[#151515]">{copy.flatCta}</span>
            </Link>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="diwali-bundle-heading"
        className="relative overflow-hidden border-y-2 border-[#E8B84A] bg-[#5D0424] text-white"
      >
        <div className={cn(DIWALI_SECTION_CLASS, 'flex flex-col items-center py-6 text-center')}>
          <p className="text-[10px] font-extrabold tracking-[0.14em] text-[#5D0424] uppercase">
            <span className="rounded-full border border-[#E8B84A] bg-[#FCE7B2] px-2.5 py-0.5">
              {copy.bestValue}
            </span>
          </p>
          <p
            id="diwali-bundle-heading"
            className="font-nunito-sans mt-3 text-2xl font-bold tracking-tight text-[#FCE7B2]"
          >
            {copy.bundleTitle}
          </p>
          <div className="mt-3 flex gap-2" aria-hidden="true">
            {Array.from({ length: BUNDLE_SLOT_COUNT }, (_, index) => (
              <span
                key={index}
                className={
                  index < BUNDLE_FILLED_SLOTS
                    ? 'size-6 rounded-full bg-[#FCE7B2]'
                    : 'size-6 rounded-full border border-[#E8B84A]'
                }
              />
            ))}
          </div>
          <Link
            href={resolveCollectionPagePath(bundleTab?.handle ?? '')}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-[#E8B84A] bg-[#FCE7B2] px-4 py-1.5 text-xs font-bold text-[#5D0424] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FCE7B2]"
            aria-label={copy.bundleCta}
          >
            {copy.bundleCta}
          </Link>
        </div>
      </section>
    </>
  );
}
