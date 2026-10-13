import Image from 'next/image';
import Link from 'next/link';

import { DiwaliSectionHeading } from '@/components/diwali/DiwaliSectionHeading';
import {
  DIWALI_CARD_COLUMN_CLASS,
  DIWALI_CARD_CTA_CLASS,
  DIWALI_SECTION_CLASS,
} from '@/components/diwali/diwali-constants';
import { ProductCardBadge } from '@/components/product/ProductCardBadge';
import { diwaliHandles, diwaliImages, diwaliMessages } from '@/config/diwali/diwali.config';
import { cn } from '@/lib/utils/cn';
import { resolveCollectionPagePath } from '@/lib/utils/collection-page-path';

/**
 * Silver and 9KT entry cards under the finer-metals heading.
 */
export function DiwaliMetals() {
  const copy = diwaliMessages.metals;

  return (
    <section aria-labelledby="diwali-metals-heading" className={DIWALI_SECTION_CLASS}>
      <DiwaliSectionHeading
        eyebrow={copy.eyebrow}
        title={copy.title}
        titleId="diwali-metals-heading"
      />

      <ul className={cn(DIWALI_CARD_COLUMN_CLASS, 'mt-4 grid grid-cols-2 gap-3')}>
        <li>
          <Link
            href={resolveCollectionPagePath(diwaliHandles.silver)}
            className="flex flex-col items-center gap-3 rounded-xl border border-[#E8B84A]/50 pb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
            aria-label={copy.silverCta}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#EFEBE6]">
              <Image
                src={diwaliImages.silver}
                alt={diwaliImages.silverAlt}
                fill
                sizes="158px"
                className="object-cover"
              />
            </div>
            <span className="flex flex-col items-center gap-1 px-2 text-center">
              <span className="text-[10px] font-bold tracking-wide text-[#222222] uppercase">
                {copy.silverLabel}
              </span>
              <span className="font-nunito-sans text-lg font-bold text-[#222222]">
                {copy.silverPrice}
              </span>
              <span className={DIWALI_CARD_CTA_CLASS}>{copy.silverCta}</span>
            </span>
          </Link>
        </li>
        <li>
          <Link
            href={resolveCollectionPagePath(diwaliHandles.gold)}
            className="flex flex-col items-center gap-3 rounded-xl border border-[#E8B84A]/50 pb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#151515]"
            aria-label={copy.goldCta}
          >
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#EFEBE6]">
              <Image
                src={diwaliImages.gold}
                alt={diwaliImages.goldAlt}
                fill
                sizes="158px"
                className="object-cover"
              />
              <ProductCardBadge
                label={copy.goldBadge}
                background="#B8862B"
                labelClassName="text-[#FFF8EE]"
              />
            </div>
            <span className="flex flex-col items-center gap-1 px-2 text-center">
              <span className="text-[10px] font-bold tracking-wide text-[#222222] uppercase">
                {copy.goldLabel}
              </span>
              <span className="font-nunito-sans text-lg font-bold text-[#222222]">
                {copy.goldPrice}
              </span>
              <span className={DIWALI_CARD_CTA_CLASS}>{copy.goldCta}</span>
            </span>
          </Link>
        </li>
      </ul>
    </section>
  );
}
